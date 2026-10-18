"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { formatRupees } from "@/lib/format";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

/**
 * Step 1 of the payment flow (docs/payment-module.md, "The lifecycle"): pays
 * the full service amount into the Kheti Sehat Razorpay account before the
 * provider is allowed to start work.
 *
 * When RAZORPAY_KEY_ID/SECRET aren't set, /api/payments/razorpay/order
 * returns a `simulated` order and this skips straight to verification —
 * see src/lib/payments/razorpay.ts for why.
 */
export function PayButton({ bookingId, amountRupees }: { bookingId: string; amountRupees: number }) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handlePay() {
    setStatus("loading");
    setError(null);
    try {
      const orderRes = await fetch("/api/payments/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error ?? "Could not start payment");

      if (order.simulated) {
        await verify({ bookingId, razorpay_order_id: order.orderId });
        router.refresh();
        setStatus("idle");
        return;
      }

      await loadRazorpayScript();
      const razorpay = new window.Razorpay!({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amountPaise,
        currency: order.currency,
        name: "Kheti Sehat",
        description: "Service payment — paid to the provider after you confirm the work",
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          await verify({ bookingId, ...response });
          router.refresh();
        },
        modal: { ondismiss: () => setStatus("idle") },
      });
      razorpay.open();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Payment failed");
    }
  }

  return (
    <div>
      <Button size="sm" variant="marigold" onClick={handlePay} disabled={status === "loading"}>
        {status === "loading" ? "Processing…" : `Pay ${formatRupees(amountRupees)}`}
      </Button>
      {error && <p className="mt-1 text-xs text-status-danger">{error}</p>}
    </div>
  );
}

async function verify(body: Record<string, string>) {
  const res = await fetch("/api/payments/razorpay/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Payment could not be verified");
}

let scriptPromise: Promise<void> | null = null;
function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Could not load Razorpay checkout"));
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
}
