"use client";

import { useRef } from "react";

import { raiseConcernAction } from "@/actions/bookings";
import { ActionForm } from "@/components/ui/ActionForm";
import { Button } from "@/components/ui/Button";
import { inputClass, labelClass } from "@/lib/ui";

/** Farmer → provider: "please fix this". Goes to the provider, not a coordinator. */
export function RaiseConcernDialog({ bookingId }: { bookingId: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => dialogRef.current?.showModal()}>
        Raise Concern
      </Button>
      <dialog
        ref={dialogRef}
        className="w-[min(24rem,92vw)] rounded-xl border border-line bg-surface p-5 text-ink shadow-xl backdrop:bg-ink/40"
      >
        <h3 className="font-display text-lg font-semibold">Raise a concern</h3>
        <p className="mt-1 text-sm text-ink-soft">
          Your provider will check the work, fix it, and resubmit it for you to confirm. Your payment stays safely with
          Kheti Sehat until then.
        </p>
        <ActionForm
          action={raiseConcernAction}
          submitLabel="Send to Provider"
          pendingLabel="Sending…"
          className="mt-3"
          onSuccess={() => dialogRef.current?.close()}
        >
          <input type="hidden" name="bookingId" value={bookingId} />
          <div>
            <label className={labelClass}>What needs fixing?</label>
            <textarea name="reason" required rows={3} className={inputClass} />
          </div>
        </ActionForm>
      </dialog>
    </>
  );
}
