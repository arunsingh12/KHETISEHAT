"use client";

import { useRef } from "react";

import { disputeBookingAction } from "@/actions/bookings";
import { ActionForm } from "@/components/ui/ActionForm";
import { Button } from "@/components/ui/Button";
import { inputClass, labelClass } from "@/lib/ui";

export function DisputeBookingDialog({ bookingId }: { bookingId: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => dialogRef.current?.showModal()}>
        Raise an Issue
      </Button>
      <dialog
        ref={dialogRef}
        className="w-[min(24rem,92vw)] rounded-xl border border-line bg-surface p-5 text-ink shadow-xl backdrop:bg-ink/40"
      >
        <h3 className="font-display text-lg font-semibold">Raise an issue</h3>
        <p className="mt-1 text-sm text-ink-soft">
          Kheti Sehat keeps your payment on hold — the provider isn&apos;t paid — while a coordinator reviews this.
        </p>
        <ActionForm
          action={disputeBookingAction}
          submitLabel="Submit"
          pendingLabel="Submitting…"
          variant="danger"
          className="mt-3"
          onSuccess={() => dialogRef.current?.close()}
        >
          <input type="hidden" name="bookingId" value={bookingId} />
          <div>
            <label className={labelClass}>What went wrong?</label>
            <textarea name="reason" required rows={3} className={inputClass} />
          </div>
        </ActionForm>
      </dialog>
    </>
  );
}
