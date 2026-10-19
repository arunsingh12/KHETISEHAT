"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/authz";
import { notify } from "@/lib/notifications";
import { BookingStatus } from "@/generated/prisma/enums";
import {
  cancelBooking as cancelBookingEscrow,
  confirmWorkDone,
  providerMarksComplete,
  raiseConcern,
  requestRefund,
  resolveRefund,
  resubmitWork,
  runAutoConfirm,
  setServiceAmount,
} from "@/lib/escrow";
import {
  cancelBookingSchema,
  createBookingSchema,
  manageBookingSchema,
  resolveRefundSchema,
} from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

type SessionUser = Awaited<ReturnType<typeof requireSession>>;

/**
 * Who may act on a booking: coordinators/admins on any booking, a provider
 * only on bookings assigned to them, a farmer only on their own.
 */
async function loadBookingFor(user: SessionUser, bookingId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { provider: true } });
  if (!booking) return null;
  if (user.role === "COORDINATOR" || user.role === "ADMIN") return booking;
  if (user.role === "PROVIDER" && booking.provider?.userId === user.id) return booking;
  if (user.role === "FARMER" && booking.farmerId === user.id) return booking;
  return null;
}

/** Farmer taps "Request Service" on a provider's card. */
export async function createBooking(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await requireSession(["FARMER"]);

  const parsed = createBookingSchema.safeParse({
    providerId: formData.get("providerId"),
    preferredDate: formData.get("preferredDate") || undefined,
    description: formData.get("description"),
    ayushmanCard: formData.get("ayushmanCard") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form and try again" };
  }

  const provider = await prisma.providerProfile.findUnique({
    where: { id: parsed.data.providerId },
    include: { user: true },
  });
  if (!provider) return { ok: false, error: "This provider no longer exists" };

  const booking = await prisma.booking.create({
    data: {
      farmerId: user.id,
      providerId: provider.id,
      section: provider.section,
      agriCategory: provider.agriCategory,
      healthCategory: provider.healthCategory,
      description: parsed.data.description,
      preferredDate: parsed.data.preferredDate ? new Date(parsed.data.preferredDate) : undefined,
      ayushmanCard: parsed.data.ayushmanCard,
      status: "PENDING",
    },
  });

  await notify({
    userId: provider.user.id,
    type: "BOOKING_CREATED",
    title: "New service request",
    sms: true,
    message: "A new request came in — set a price to move it to payment.",
    bookingId: booking.id,
  });

  revalidatePath("/farmer", "layout");
  revalidatePath("/provider");
  revalidatePath("/coordinator");
  revalidatePath("/admin");
  return { ok: true };
}

/** Provider or coordinator sets the price once they've reviewed the request. */
export async function setBookingPrice(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await requireSession(["PROVIDER", "COORDINATOR", "ADMIN"]);
  const bookingId = String(formData.get("bookingId") ?? "");
  const amount = Number(formData.get("amount"));
  if (!bookingId || !Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Enter a valid amount" };
  }

  const booking = await loadBookingFor(user, bookingId);
  if (!booking) return { ok: false, error: "Booking not found" };
  // The price can be set or revised only until the farmer pays.
  if (booking.status !== "PENDING" && booking.status !== "AWAITING_PAYMENT") {
    return { ok: false, error: "The price can't be changed after the farmer has paid." };
  }

  await setServiceAmount(bookingId, Math.round(amount));
  revalidatePath("/farmer", "layout");
  revalidatePath("/provider");
  revalidatePath("/coordinator");
  revalidatePath("/admin");
  return { ok: true };
}

/** Provider/coordinator "Manage Booking" modal: status, reassignment, notes. */
export async function manageBooking(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await requireSession(["PROVIDER", "COORDINATOR", "ADMIN"]);

  const parsed = manageBookingSchema.safeParse({
    bookingId: formData.get("bookingId"),
    status: formData.get("status") || undefined,
    providerId: formData.get("providerId") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { ok: false, error: "Invalid input" };
  const { bookingId, status, providerId, notes } = parsed.data;

  const current = await loadBookingFor(user, bookingId);
  if (!current) return { ok: false, error: "Booking not found" };
  // Reassigning a booking to another provider is a coordinator/admin call.
  if (providerId && user.role === "PROVIDER") {
    return { ok: false, error: "Only a coordinator can reassign a booking" };
  }

  // CONFIRMED / SETTLED / CANCELLED / DISPUTED all move money or need a
  // reason, so they only happen through the dedicated functions in
  // src/lib/escrow.ts (confirmWorkDone, markPayoutPaid, cancelBooking, resolveDispute) — never
  // through this generic dropdown.
  const MANUALLY_SETTABLE = new Set<BookingStatus>(["READY_TO_START", "IN_PROGRESS", "PROVIDER_COMPLETED"]);
  const isManuallySettable = (s: string): s is BookingStatus =>
    MANUALLY_SETTABLE.has(s as BookingStatus);

  if (status && isManuallySettable(status)) {
    // The payment gate: none of these transitions are allowed until the
    // farmer has actually paid Kheti Sehat —
    // otherwise a provider could mark unpaid work "complete".
    if (current.escrowStatus !== "HELD") {
      return { ok: false, error: "This booking can't move forward until the requester has paid." };
    }
    // Only work in progress can change status. Once marked complete it's the
    // farmer's turn (confirm / raise an issue); once confirmed it's waiting on
    // the admin's payout — the provider can't pull it back.
    if (current.status !== "READY_TO_START" && current.status !== "IN_PROGRESS") {
      return {
        ok: false,
        error:
          current.status === "PROVIDER_COMPLETED"
            ? "You've already marked this job complete — waiting for the farmer to confirm."
            : "This job's status can no longer be changed.",
      };
    }
  }

  if (status === "PROVIDER_COMPLETED") {
    await providerMarksComplete(bookingId);
  }

  if ((status && status !== "PROVIDER_COMPLETED") || providerId || notes) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        ...(status && status !== "PROVIDER_COMPLETED" && isManuallySettable(status) ? { status } : {}),
        ...(providerId ? { providerId } : {}),
        ...(notes ? { coordinatorNotes: notes } : {}),
      },
    });
  }

  revalidatePath("/provider");
  revalidatePath("/coordinator");
  revalidatePath("/admin");
  revalidatePath("/farmer", "layout");
  return { ok: true };
}

/** Farmer confirms "work done" — queues the payout for admin approval (no money moves yet). */
export async function confirmBookingDone(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await requireSession(["FARMER"]);
  const bookingId = String(formData.get("bookingId") ?? "");

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.farmerId !== user.id) {
    return { ok: false, error: "Booking not found" };
  }
  if (booking.status !== "PROVIDER_COMPLETED") {
    return { ok: false, error: "This booking isn't ready to confirm yet" };
  }

  await confirmWorkDone(bookingId, "requester_confirmed");
  revalidatePath("/farmer", "layout");
  revalidatePath("/provider");
  revalidatePath("/coordinator");
  revalidatePath("/admin");
  return { ok: true };
}

/** Farmer sends a completed job back to the provider to fix — no coordinator involved. */
export async function raiseConcernAction(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await requireSession(["FARMER"]);
  const bookingId = String(formData.get("bookingId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) return { ok: false, error: "Explain what needs fixing" };

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.farmerId !== user.id) {
    return { ok: false, error: "Booking not found" };
  }

  try {
    await raiseConcern(bookingId, reason);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not raise the concern" };
  }
  revalidatePath("/farmer", "layout");
  revalidatePath("/provider");
  revalidatePath("/coordinator");
  revalidatePath("/admin");
  return { ok: true };
}

/** Provider has fixed the work after a concern and sends it back for confirmation. */
export async function resubmitWorkAction(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await requireSession(["PROVIDER", "COORDINATOR", "ADMIN"]);
  const bookingId = String(formData.get("bookingId") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!(await loadBookingFor(user, bookingId))) return { ok: false, error: "Booking not found" };

  try {
    await resubmitWork(bookingId, note);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not resubmit the work" };
  }
  revalidatePath("/farmer", "layout");
  revalidatePath("/provider");
  revalidatePath("/coordinator");
  revalidatePath("/admin");
  return { ok: true };
}

/** Farmer asks for money back — freezes the payment and goes to the coordinators. */
export async function requestRefundAction(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await requireSession(["FARMER"]);
  const bookingId = String(formData.get("bookingId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) return { ok: false, error: "Explain why you want a refund" };

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.farmerId !== user.id) {
    return { ok: false, error: "Booking not found" };
  }

  try {
    await requestRefund(bookingId, reason);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not request a refund" };
  }
  revalidatePath("/farmer", "layout");
  revalidatePath("/provider");
  revalidatePath("/coordinator", "layout");
  revalidatePath("/admin");
  return { ok: true };
}

export async function cancelBookingAction(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await requireSession(["FARMER", "PROVIDER", "COORDINATOR", "ADMIN"]);
  const parsed = cancelBookingSchema.safeParse({
    bookingId: formData.get("bookingId"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Give a reason" };
  }

  if (!(await loadBookingFor(user, parsed.data.bookingId))) {
    return { ok: false, error: "Booking not found" };
  }

  try {
    await cancelBookingEscrow(parsed.data.bookingId, parsed.data.reason);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not cancel" };
  }

  revalidatePath("/farmer", "layout");
  revalidatePath("/provider");
  revalidatePath("/coordinator");
  revalidatePath("/admin");
  return { ok: true };
}

/** Coordinator-facing manual trigger for the same sweep /api/cron/auto-release runs on a schedule. */
export async function runAutoConfirmAction(): Promise<ActionResult & { confirmed?: number }> {
  await requireSession(["COORDINATOR", "ADMIN"]);
  const result = await runAutoConfirm();
  revalidatePath("/coordinator");
  revalidatePath("/admin");
  revalidatePath("/farmer", "layout");
  revalidatePath("/provider");
  return { ok: true, confirmed: result.confirmed };
}

/** Coordinator decides what % of the payment goes back to the farmer; the rest goes to the provider. */
export async function resolveRefundAction(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireSession(["COORDINATOR", "ADMIN"]);
  const parsed = resolveRefundSchema.safeParse({
    bookingId: formData.get("bookingId"),
    refundPercent: formData.get("refundPercent"),
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form and try again" };
  }

  try {
    await resolveRefund(parsed.data.bookingId, parsed.data.refundPercent, parsed.data.notes);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not resolve the refund request" };
  }

  revalidatePath("/coordinator");
  revalidatePath("/admin", "layout");
  revalidatePath("/farmer", "layout");
  revalidatePath("/provider", "layout");
  return { ok: true };
}
