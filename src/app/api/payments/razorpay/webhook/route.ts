import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";
import { markPaidAndHeld } from "@/lib/escrow";

/**
 * Production path: Razorpay calls this directly once a payment captures,
 * instead of relying on the client to report success (the client can go
 * offline mid-checkout). Configure this URL + RAZORPAY_WEBHOOK_SECRET in
 * the Razorpay dashboard under Settings → Webhooks, subscribed to
 * `payment.captured`.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  if (event.event !== "payment.captured") {
    return NextResponse.json({ ok: true, ignored: event.event });
  }

  const payment = event.payload?.payment?.entity;
  const bookingId: string | undefined = payment?.notes?.bookingId;
  if (!bookingId) {
    return NextResponse.json({ ok: true, ignored: "no bookingId in notes" });
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.escrowStatus === "HELD" || booking.escrowStatus === "RELEASED") {
    return NextResponse.json({ ok: true }); // already handled, or unknown booking — idempotent no-op
  }

  await markPaidAndHeld(bookingId, payment.id);
  return NextResponse.json({ ok: true });
}
