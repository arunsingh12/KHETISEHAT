/**
 * Booking payment lifecycle — implements the state machine from
 * docs/payment-module.md. Kheti Sehat's (admin's) Razorpay account is the
 * middleman:
 *   farmer pays into the Kheti Sehat account → provider completes →
 *   farmer confirms → admin pays the provider manually (minus the platform
 *   fee) and records the reference.
 * (`escrowStatus` is a legacy field name — it just tracks where the money is.)
 * Kept separate from the server actions so the cron route, the farmer's
 * confirm action, dispute resolution and admin approval share one
 * implementation.
 */
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";
import { formatRupees } from "@/lib/format";
import { AUTO_CONFIRM_HOURS, DEFAULT_COMMISSION_RATE, PAYOUT_METHODS, type PayoutMethod } from "@/lib/constants";
import * as razorpay from "@/lib/payments/razorpay";

export function computeFees(amountRupees: number, commissionRate: number) {
  const platformFee = Math.round((amountRupees * commissionRate) / 100);
  const providerNet = amountRupees - platformFee;
  return { platformFee, providerNet };
}

/** Provider/coordinator sets the price — this is what unlocks payment. */
export async function setServiceAmount(bookingId: string, amountRupees: number) {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { provider: true },
  });
  const commissionRate = booking.provider?.commissionRate ?? DEFAULT_COMMISSION_RATE;
  const { platformFee, providerNet } = computeFees(amountRupees, commissionRate);

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      serviceAmount: amountRupees,
      commissionRate,
      platformFee,
      providerNet,
      status: "AWAITING_PAYMENT",
    },
  });

  await notify({
    userId: booking.farmerId,
    type: "STATUS_CHANGED",
    title: "Payment required",
    sms: true,
    message: `Your provider is ready. Pay ${formatRupees(amountRupees)} to confirm your booking.`,
    bookingId,
  });

  return updated;
}

/**
 * Called by the payment-verify route / webhook once Razorpay confirms the
 * payment. The money is now in the Kheti Sehat Razorpay account and stays
 * there until the admin pays the provider (see markPayoutPaid).
 */
export async function markPaidAndHeld(bookingId: string, razorpayPaymentId: string) {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { provider: { include: { user: true } } },
  });
  if (!booking.serviceAmount) {
    throw new Error("Booking has no service amount set");
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      razorpayPaymentId,
      paidAt: new Date(),
      escrowStatus: "HELD",
      status: "READY_TO_START",
    },
  });

  await notify({
    userId: booking.farmerId,
    type: "PAYMENT_HELD",
    title: "Payment received",
    message: `Kheti Sehat has received your ${formatRupees(booking.serviceAmount)}. We pay the provider only after you confirm the work is done.`,
    bookingId,
  });

  if (booking.provider) {
    await notify({
      userId: booking.provider.user.id,
      type: "PAYMENT_HELD",
      title: "Payment secured",
      sms: true,
      message: "The requester has paid. You can start the work.",
      bookingId,
    });
  }

  return updated;
}

/** Provider flags their side done — starts the 72h auto-confirm clock. */
export async function providerMarksComplete(bookingId: string) {
  const dueAt = new Date(Date.now() + AUTO_CONFIRM_HOURS * 60 * 60 * 1000);
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "PROVIDER_COMPLETED",
      providerCompletedAt: new Date(),
      autoReleaseDueAt: dueAt,
    },
  });

  await notify({
    userId: booking.farmerId,
    type: "STATUS_CHANGED",
    title: "Provider marked this job complete",
    sms: true,
    message: `Please confirm the work is done, or raise an issue. If you don't respond in ${AUTO_CONFIRM_HOURS} hours it will be confirmed automatically.`,
    bookingId,
  });

  return booking;
}

/**
 * The farmer confirms the work (or the 72h sweep / a dispute resolution
 * does it for them). No money moves here — the booking joins the admin's
 * payout queue.
 */
export async function confirmWorkDone(
  bookingId: string,
  trigger: "requester_confirmed" | "auto_confirmed" | "dispute_resolved",
) {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { provider: { include: { user: true } } },
  });
  if (booking.escrowStatus !== "HELD") {
    throw new Error(`Cannot confirm a booking with escrow status ${booking.escrowStatus}`);
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CONFIRMED", confirmedAt: new Date() },
  });

  const how = {
    requester_confirmed: "The farmer confirmed the work",
    auto_confirmed: `Auto-confirmed after ${AUTO_CONFIRM_HOURS} hours with no response from the farmer`,
    dispute_resolved: "The dispute was resolved in the provider's favour",
  }[trigger];

  const admins = await prisma.user.findMany({ where: { role: "ADMIN", active: true } });
  await Promise.all([
    ...admins.map((a) =>
      notify({
        userId: a.id,
        type: "STATUS_CHANGED",
        title: "Payout awaiting approval",
        message: `${how}. Pay ${formatRupees(booking.providerNet)} to ${booking.provider?.displayName ?? "the provider"} and mark it paid under Payouts.`,
        bookingId,
      }),
    ),
    booking.provider
      ? notify({
          userId: booking.provider.user.id,
          type: "STATUS_CHANGED",
          title: "Work confirmed",
          message: `${how}. Kheti Sehat will send your payout of ${formatRupees(booking.providerNet)} shortly.`,
          bookingId,
        })
      : null,
  ]);

  return updated;
}

/** Expected, user-facing refusal (already paid / not confirmed yet). */
export class PayoutNotPendingError extends Error {
  constructor() {
    super("This payout isn't waiting to be paid — it may already have been marked paid");
  }
}

/**
 * Admin records that they've paid the provider. The admin sends
 * `providerNet` (service amount minus platform fee) from the Kheti Sehat
 * account themselves — by bank transfer or UPI — and enters the reference
 * here; the platform fee simply stays in the Kheti Sehat account.
 */
export async function markPayoutPaid(
  bookingId: string,
  payout: { method: PayoutMethod; reference: string; adminId: string },
) {
  // One conditional update, so a double-click or two admins at once can't
  // record the same payout twice.
  const now = new Date();
  const result = await prisma.booking.updateMany({
    where: { id: bookingId, status: "CONFIRMED", escrowStatus: "HELD" },
    data: {
      status: "SETTLED",
      escrowStatus: "RELEASED",
      releasedAt: now,
      payoutMethod: payout.method,
      payoutReference: payout.reference,
      payoutById: payout.adminId,
    },
  });
  if (result.count === 0) throw new PayoutNotPendingError();

  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { provider: true },
  });

  await Promise.all([
    booking.provider
      ? notify({
          userId: booking.provider.userId,
          type: "PAYMENT_RELEASED",
          title: "Payment sent",
          sms: true,
          message: `Kheti Sehat has sent you ${formatRupees(booking.providerNet)} by ${PAYOUT_METHODS[payout.method]} (ref ${payout.reference}) — ${formatRupees(booking.serviceAmount)} minus ${booking.commissionRate}% platform fee.`,
          bookingId,
        })
      : null,
    notify({
      userId: booking.farmerId,
      type: "PAYMENT_RELEASED",
      title: "Provider has been paid",
      message: "Your booking is complete and the provider has been paid. Thank you!",
      bookingId,
    }),
  ]);

  return booking;
}

/** Cancel a booking — refunds the requester if a payment was already held. */
export async function cancelBooking(bookingId: string, reason: string) {
  const booking = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });

  if (booking.escrowStatus === "RELEASED") {
    throw new Error("This booking has already been paid out and can no longer be cancelled");
  }

  let escrowStatus = booking.escrowStatus;
  // FROZEN (a disputed booking being refunded, via resolveDispute) is
  // refundable the same way HELD is — the money is still sitting
  // uncollected by the provider in both cases.
  if (
    (booking.escrowStatus === "HELD" || booking.escrowStatus === "FROZEN") &&
    booking.razorpayPaymentId &&
    booking.serviceAmount
  ) {
    await razorpay.refundPayment({
      paymentId: booking.razorpayPaymentId,
      amountRupees: booking.serviceAmount,
    });
    escrowStatus = "REFUNDED";
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CANCELLED",
      escrowStatus,
      cancelledAt: new Date(),
      cancellationReason: reason,
    },
  });

  await notify({
    userId: booking.farmerId,
    type: "STATUS_CHANGED",
    title: "Booking cancelled",
    message: reason,
    bookingId,
  });

  return updated;
}

/** The farmer can dispute a completed job before payout — puts the payment on hold for a coordinator to resolve. */
export async function raiseDispute(bookingId: string, reason: string) {
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "DISPUTED", escrowStatus: "FROZEN", disputeReason: reason },
  });

  const coordinators = await prisma.user.findMany({ where: { role: "COORDINATOR" } });
  await Promise.all(
    coordinators.map((c) =>
      notify({
        userId: c.id,
        type: "STATUS_CHANGED",
        title: "Booking disputed",
        message: reason,
        bookingId,
      }),
    ),
  );

  return booking;
}

/** Coordinator resolving a dispute — the "release / refund / split" outcomes from the concept note. */
export async function resolveDispute(
  bookingId: string,
  outcome: "release" | "refund",
  reason: string,
) {
  const booking = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
  if (booking.status !== "DISPUTED") {
    throw new Error("Only a disputed booking can be resolved this way");
  }

  if (outcome === "release") {
    // Back into the admin's payout queue — never pays the provider directly.
    await prisma.booking.update({ where: { id: bookingId }, data: { escrowStatus: "HELD" } });
    return confirmWorkDone(bookingId, "dispute_resolved");
  }

  return cancelBooking(bookingId, reason || "Dispute resolved in the requester's favour");
}

/**
 * Used by /api/cron/auto-release: confirms jobs the farmer hasn't responded
 * to within AUTO_CONFIRM_HOURS. They still need admin approval to pay out.
 */
export async function runAutoConfirm() {
  const due = await prisma.booking.findMany({
    where: {
      status: "PROVIDER_COMPLETED",
      escrowStatus: "HELD",
      autoReleaseDueAt: { lte: new Date() },
    },
    select: { id: true },
  });

  const results = await Promise.allSettled(due.map((b) => confirmWorkDone(b.id, "auto_confirmed")));
  return {
    checked: due.length,
    confirmed: results.filter((r) => r.status === "fulfilled").length,
  };
}
