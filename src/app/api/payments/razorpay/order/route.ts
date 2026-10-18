import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createOrder } from "@/lib/payments/razorpay";

/** Step 1 of the payment flow: create the order the farmer pays into the Kheti Sehat account. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "FARMER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookingId } = await request.json();
  if (!bookingId) {
    return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.farmerId !== session.user.id) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.status !== "AWAITING_PAYMENT" || !booking.serviceAmount) {
    return NextResponse.json(
      { error: "This booking isn't ready for payment yet" },
      { status: 409 },
    );
  }

  const order = await createOrder({ bookingId: booking.id, amountRupees: booking.serviceAmount });

  await prisma.booking.update({
    where: { id: booking.id },
    data: { razorpayOrderId: order.orderId },
  });

  return NextResponse.json(order);
}
