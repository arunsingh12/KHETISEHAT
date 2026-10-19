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
  trigger: "requester_confirmed" | "auto_confirmed" | "dispute_resolved" | "refund_split",
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
    dispute_resolved: "The refund request was resolved in the provider's favour",
    refund_split: `The refund request was resolved — ${booking.refundPercent}% refunded to the farmer`,
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
  // FROZEN (a refund request) is refundable the same way HELD is — the
  // money is still sitting uncollected by the provider in both cases. A
  // 100% refund decision (resolveRefund) also lands here.
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

/**
 * "Raise Concern" — the farmer isn't happy with the work and sends it back
 * to the provider (not a coordinator). The money stays HELD and the
 * auto-confirm timer stops until the provider resubmits.
 */
export async function raiseConcern(bookingId: string, reason: string) {
  const result = await prisma.booking.updateMany({
    where: { id: bookingId, status: "PROVIDER_COMPLETED", escrowStatus: "HELD" },
    data: {
      status: "CONCERN_RAISED",
      concernReason: reason,
      concernCount: { increment: 1 },
      autoReleaseDueAt: null,
    },
  });
  if (result.count === 0) throw new Error("Only a job awaiting your confirmation can have a concern raised");

  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { provider: true },
  });
  if (booking.provider) {
    await notify({
      userId: booking.provider.userId,
      type: "STATUS_CHANGED",
      title: "The farmer raised a concern",
      sms: true,
      message: `${reason} — please check the work and resubmit it from your dashboard.`,
      bookingId,
    });
  }
  return booking;
}

/** Provider fixed the work after a concern — back to the farmer to confirm, with a fresh timer. */
export async function resubmitWork(bookingId: string, note: string) {
  const dueAt = new Date(Date.now() + AUTO_CONFIRM_HOURS * 60 * 60 * 1000);
  const result = await prisma.booking.updateMany({
    where: { id: bookingId, status: "CONCERN_RAISED", escrowStatus: "HELD" },
    data: {
      status: "PROVIDER_COMPLETED",
      providerCompletedAt: new Date(),
      autoReleaseDueAt: dueAt,
      resubmissionNote: note || null,
    },
  });
  if (result.count === 0) throw new Error("Only a job with an open concern can be resubmitted");

  await notify({
    userId: (await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } })).farmerId,
    type: "STATUS_CHANGED",
    title: "Provider resubmitted the work",
    sms: true,
    message: `${note ? `${note} — ` : ""}Please check and confirm the work, raise another concern, or request a refund. It will be confirmed automatically in ${AUTO_CONFIRM_HOURS} hours.`,
    bookingId,
  });
}

/**
 * "Request Refund" — the farmer wants money back. The payment is frozen and
 * a coordinator contacts both sides, then decides the split (resolveRefund).
 */
export async function requestRefund(bookingId: string, reason: string) {
  const result = await prisma.booking.updateMany({
    where: {
      id: bookingId,
      status: { in: ["PROVIDER_COMPLETED", "CONCERN_RAISED"] },
      escrowStatus: "HELD",
    },
    data: { status: "DISPUTED", escrowStatus: "FROZEN", disputeReason: reason, autoReleaseDueAt: null },
  });
  if (result.count === 0) throw new Error("A refund can't be requested for this booking right now");

  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { provider: true },
  });
  const coordinators = await prisma.user.findMany({ where: { role: "COORDINATOR", active: true } });
  await Promise.all([
    ...coordinators.map((c) =>
      notify({
        userId: c.id,
        type: "STATUS_CHANGED",
        title: "Refund requested",
        sms: true,
        message: `${reason} — contact the farmer and provider, then decide the refund under Refunds & Cancellations.`,
        bookingId,
      }),
    ),
    booking.provider
      ? notify({
          userId: booking.provider.userId,
          type: "STATUS_CHANGED",
          title: "Refund requested",
          message: "The farmer asked for a refund. The payment is on hold — a Kheti Sehat coordinator will contact you.",
          bookingId,
        })
      : null,
  ]);
  return booking;
}

/**
 * Coordinator's decision on a refund request: `refundPercent` of the
 * service amount goes back to the farmer; the rest (minus the platform fee
 * on that remainder) joins the admin's payout queue for the provider.
 * 100% cancels the booking; 0% is a plain confirm.
 */
export async function resolveRefund(bookingId: string, refundPercent: number, notes: string) {
  const booking = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
  if (!booking.serviceAmount) throw new Error("This booking has no payment to split");

  const refundAmount = Math.round((booking.serviceAmount * refundPercent) / 100);

  // Claim it in one conditional update so two coordinators can't both resolve it.
  const claim = await prisma.booking.updateMany({
    where: { id: bookingId, status: "DISPUTED", escrowStatus: "FROZEN" },
    data: {
      escrowStatus: "HELD",
      refundPercent,
      refundAmount,
      resolutionNotes: notes || null,
      resolvedAt: new Date(),
    },
  });
  if (claim.count === 0) throw new Error("This refund request has already been resolved");

  // If the Razorpay refund fails, put it back so the coordinator can try again.
  const unclaim = () =>
    prisma.booking.update({
      where: { id: bookingId },
      data: { escrowStatus: "FROZEN", refundPercent: null, refundAmount: null, resolvedAt: null },
    });

  if (refundPercent === 100) {
    let cancelled;
    try {
      cancelled = await cancelBooking(bookingId, notes || "Refund request resolved — full refund to the farmer");
    } catch (error) {
      await unclaim();
      throw error;
    }
    if (booking.providerId) {
      const provider = await prisma.providerProfile.findUnique({ where: { id: booking.providerId } });
      if (provider) {
        await notify({
          userId: provider.userId,
          type: "STATUS_CHANGED",
          title: "Refund request resolved",
          message: "The coordinator refunded the farmer in full, so there is no payout for this job.",
          bookingId,
        });
      }
    }
    return cancelled;
  }

  if (refundAmount > 0) {
    try {
      if (booking.razorpayPaymentId) {
        await razorpay.refundPayment({ paymentId: booking.razorpayPaymentId, amountRupees: refundAmount });
      }
    } catch (error) {
      await unclaim();
      throw error;
    }
    const { platformFee, providerNet } = computeFees(
      booking.serviceAmount - refundAmount,
      booking.commissionRate ?? DEFAULT_COMMISSION_RATE,
    );
    await prisma.booking.update({ where: { id: bookingId }, data: { platformFee, providerNet } });
  }

  await notify({
    userId: booking.farmerId,
    type: "STATUS_CHANGED",
    title: "Refund request resolved",
    sms: true,
    message:
      refundAmount > 0
        ? `${formatRupees(refundAmount)} (${refundPercent}%) is being refunded to you. ${notes}`.trim()
        : `The coordinator decided no refund is due. ${notes}`.trim(),
    bookingId,
  });

  return confirmWorkDone(bookingId, refundAmount > 0 ? "refund_split" : "dispute_resolved");
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
