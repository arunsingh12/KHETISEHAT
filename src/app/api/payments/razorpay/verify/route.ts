import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyPaymentSignature } from "@/lib/payments/razorpay";
import { markPaidAndHeld } from "@/lib/escrow";

/**
 * Step 1→2 handoff: the Checkout.js success callback (or, in simulated
 * mode, our own "Pay" button) posts here. On a verified signature we mark
 * the booking paid (money now with Kheti Sehat).
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "FARMER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const bookingId: string = body.bookingId;
  const orderId: string = body.razorpay_order_id;
  const paymentId: string = body.razorpay_payment_id ?? `sim_pay_${bookingId}`;
  const signature: string = body.razorpay_signature ?? "";

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.farmerId !== session.user.id) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.razorpayOrderId !== orderId) {
    return NextResponse.json({ error: "Order mismatch" }, { status: 409 });
  }
  if (booking.escrowStatus === "HELD" || booking.escrowStatus === "RELEASED") {
    return NextResponse.json({ ok: true }); // already processed — idempotent
  }

  const verified = verifyPaymentSignature({ orderId, paymentId, signature });
  if (!verified) {
    return NextResponse.json({ error: "Payment signature could not be verified" }, { status: 400 });
  }

  await markPaidAndHeld(bookingId, paymentId);

  revalidatePath("/farmer", "layout");
  revalidatePath("/provider");
  revalidatePath("/coordinator");
  return NextResponse.json({ ok: true });
}
