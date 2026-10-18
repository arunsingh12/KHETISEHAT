"use client";

import { useRef } from "react";

import { markPayoutPaidAction } from "@/actions/admin";
import { ActionForm } from "@/components/ui/ActionForm";
import { Button } from "@/components/ui/Button";
import { PAYOUT_METHODS, type PayoutMethod } from "@/lib/constants";
import { formatRupees } from "@/lib/format";
import { inputClass, labelClass } from "@/lib/ui";

export function MarkPaidDialog({
  bookingId,
  providerName,
  amountRupees,
  defaultMethod,
}: {
  bookingId: string;
  providerName: string;
  amountRupees: number | null;
  defaultMethod: PayoutMethod;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <Button size="sm" onClick={() => dialogRef.current?.showModal()}>
        Mark as Paid · {formatRupees(amountRupees)}
      </Button>
      <dialog
        ref={dialogRef}
        className="w-[min(26rem,92vw)] rounded-xl border border-line bg-surface p-5 text-ink shadow-xl backdrop:bg-ink/40"
      >
        <h3 className="font-display text-lg font-semibold">Record payment to {providerName}</h3>
        <p className="mt-1 text-sm text-ink-soft">
          Send <strong>{formatRupees(amountRupees)}</strong> from the Kheti Sehat account first, then enter the
          transaction details here. The provider is notified and this can&apos;t be undone.
        </p>
        <ActionForm
          action={markPayoutPaidAction}
          submitLabel="Confirm Payment Sent"
          pendingLabel="Saving…"
          className="mt-3 space-y-3"
          onSuccess={() => dialogRef.current?.close()}
        >
          <input type="hidden" name="bookingId" value={bookingId} />
          <div>
            <label className={labelClass}>Paid by</label>
            <select name="method" defaultValue={defaultMethod} className={inputClass}>
              {Object.entries(PAYOUT_METHODS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>UTR / transaction reference</label>
            <input name="reference" required minLength={4} placeholder="e.g. 412345678901" className={inputClass} />
          </div>
        </ActionForm>
      </dialog>
    </>
  );
}
