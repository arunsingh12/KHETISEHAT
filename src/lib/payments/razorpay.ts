/**
 * Razorpay service layer — collection only. The farmer pays into the
 * Kheti Sehat (admin) Razorpay account via the Orders API + Checkout.js, and
 * the money stays there. Providers are paid by the admin manually (bank
 * transfer / UPI) after approving the job, and the admin records the UTR in
 * the app — nothing here sends money to providers. Refunds on cancellation
 * go back to the farmer from the same account.
 *
 * Without RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET every function returns a
 * clearly-marked "simulated" result so the whole lifecycle still runs locally.
 */
import crypto from "node:crypto";
import Razorpay from "razorpay";

export function isRazorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

let client: Razorpay | null = null;
function getClient() {
  if (!isRazorpayConfigured()) return null;
  if (!client) {
    client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return client;
}

const PAISE_PER_RUPEE = 100;

export type CreateOrderResult = {
  orderId: string;
  amountPaise: number;
  currency: "INR";
  keyId: string | null;
  simulated: boolean;
};

/** The farmer pays ₹A into the Kheti Sehat Razorpay account. */
export async function createOrder(params: {
  bookingId: string;
  amountRupees: number;
}): Promise<CreateOrderResult> {
  const amountPaise = Math.round(params.amountRupees * PAISE_PER_RUPEE);
  const rzp = getClient();

  if (!rzp) {
    return {
      orderId: `sim_order_${params.bookingId}`,
      amountPaise,
      currency: "INR",
      keyId: null,
      simulated: true,
    };
  }

  const order = await rzp.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: params.bookingId,
    notes: { bookingId: params.bookingId },
  });

  return {
    orderId: order.id,
    amountPaise,
    currency: "INR",
    keyId: process.env.RAZORPAY_KEY_ID!,
    simulated: false,
  };
}

/** Verifies the checkout.js success payload's HMAC signature. */
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  if (params.orderId.startsWith("sim_")) return true; // simulated order, nothing to verify

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");

  return timingSafeEqualHex(expected, params.signature);
}

/** Verifies the `X-Razorpay-Signature` header on the webhook route. */
export function verifyWebhookSignature(rawBody: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return timingSafeEqualHex(expected, signature);
}

function timingSafeEqualHex(a: string, b: string) {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Cancellation / dispute path: refund the farmer from the Kheti Sehat account. */
export async function refundPayment(params: {
  paymentId: string;
  amountRupees: number;
}): Promise<{ refundId: string; simulated: boolean }> {
  const rzp = getClient();
  if (!rzp || params.paymentId.startsWith("sim_")) {
    return { refundId: `sim_refund_${params.paymentId}`, simulated: true };
  }
  const refund = await rzp.payments.refund(params.paymentId, {
    amount: Math.round(params.amountRupees * PAISE_PER_RUPEE),
  });
  return { refundId: refund.id, simulated: false };
}
