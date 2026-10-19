"use client";

import { useActionState, useState } from "react";

import { resolveRefundAction } from "@/actions/bookings";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { formatRupees } from "@/lib/format";
import { inputClass, labelClass } from "@/lib/ui";

const PRESETS = [0, 25, 50, 75, 100];

/**
 * Coordinator's decision after talking to both sides: what % of the payment
 * goes back to the farmer. The rest (minus the platform fee on it) goes to
 * the admin's payout queue for the provider. Mirrors resolveRefund's maths.
 */
export function RefundResolveForm({
  bookingId,
  serviceAmount,
  commissionRate,
}: {
  bookingId: string;
  serviceAmount: number;
  commissionRate: number;
}) {
  const [state, formAction] = useActionState(resolveRefundAction, null);
  const [percent, setPercent] = useState(50);

  const valid = Number.isInteger(percent) && percent >= 0 && percent <= 100;
  const refund = valid ? Math.round((serviceAmount * percent) / 100) : 0;
  const providerShare = serviceAmount - refund;
  const fee = percent === 100 ? 0 : Math.round((providerShare * commissionRate) / 100);
  const providerNet = providerShare - fee;

  return (
    <form action={formAction} className="mt-3 space-y-3 border-t border-line-soft pt-3">
      <input type="hidden" name="bookingId" value={bookingId} />
      <div>
        <label className={labelClass}>Refund to farmer (%)</label>
        <div className="flex flex-wrap items-center gap-2">
          <input
            name="refundPercent"
            type="number"
            min={0}
            max={100}
            step={1}
            required
            value={Number.isNaN(percent) ? "" : percent}
            onChange={(e) => setPercent(e.target.valueAsNumber)}
            className={`${inputClass} w-24`}
          />
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPercent(p)}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                percent === p ? "border-brand bg-brand-light text-brand-deep" : "border-line text-ink-soft hover:border-brand"
              }`}
            >
              {p}%
            </button>
          ))}
        </div>
      </div>

      {valid && (
        <dl className="grid grid-cols-3 gap-2 rounded-lg bg-surface-2 p-3 text-sm">
          <div>
            <dt className="text-xs text-ink-faint">Refund to farmer</dt>
            <dd className="font-semibold text-status-danger">{formatRupees(refund)}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-faint">Platform fee ({commissionRate}%)</dt>
            <dd className="font-medium text-marigold">{formatRupees(fee)}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-faint">Payout to provider</dt>
            <dd className="font-semibold text-brand-deep">{formatRupees(providerNet)}</dd>
          </div>
        </dl>
      )}

      <textarea
        name="notes"
        placeholder="What was agreed with the farmer and provider (shared with the farmer)"
        rows={2}
        className={inputClass}
      />
      <SubmitButton variant="primary" pendingText="Saving…">
        Confirm Decision
      </SubmitButton>
      {state && !state.ok && <p className="text-sm text-status-danger">{state.error}</p>}
    </form>
  );
}
