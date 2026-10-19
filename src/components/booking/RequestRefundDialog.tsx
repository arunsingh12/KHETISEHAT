"use client";

import { useRef } from "react";

import { requestRefundAction } from "@/actions/bookings";
import { ActionForm } from "@/components/ui/ActionForm";
import { Button } from "@/components/ui/Button";
import { inputClass, labelClass } from "@/lib/ui";

/** Farmer → coordinator: "I want my money back". The coordinator decides the split. */
export function RequestRefundDialog({ bookingId }: { bookingId: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => dialogRef.current?.showModal()}>
        Request Refund
      </Button>
      <dialog
        ref={dialogRef}
        className="w-[min(24rem,92vw)] rounded-xl border border-line bg-surface p-5 text-ink shadow-xl backdrop:bg-ink/40"
      >
        <h3 className="font-display text-lg font-semibold">Request a refund</h3>
        <p className="mt-1 text-sm text-ink-soft">
          Your payment is put on hold and a Kheti Sehat coordinator will call you and the provider. They decide how
          much is refunded to you and how much goes to the provider.
        </p>
        <ActionForm
          action={requestRefundAction}
          submitLabel="Request Refund"
          pendingLabel="Submitting…"
          variant="danger"
          className="mt-3"
          onSuccess={() => dialogRef.current?.close()}
        >
          <input type="hidden" name="bookingId" value={bookingId} />
          <div>
            <label className={labelClass}>Why do you want a refund?</label>
            <textarea name="reason" required rows={3} className={inputClass} />
          </div>
        </ActionForm>
      </dialog>
    </>
  );
}
