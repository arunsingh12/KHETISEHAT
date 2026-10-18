"use client";

import { useRef } from "react";

import { cancelBookingAction } from "@/actions/bookings";
import { ActionForm } from "@/components/ui/ActionForm";
import { Button } from "@/components/ui/Button";
import { inputClass, labelClass } from "@/lib/ui";

export function CancelBookingDialog({ bookingId }: { bookingId: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => dialogRef.current?.showModal()}>
        Cancel
      </Button>
      <dialog
        ref={dialogRef}
        className="w-[min(24rem,92vw)] rounded-xl border border-line bg-surface p-5 text-ink shadow-xl backdrop:bg-ink/40"
      >
        <h3 className="font-display text-lg font-semibold">Cancel booking</h3>
        <p className="mt-1 text-sm text-ink-soft">
          If a payment was already made, it will be refunded automatically.
        </p>
        <ActionForm
          action={cancelBookingAction}
          submitLabel="Confirm Cancellation"
          pendingLabel="Cancelling…"
          variant="danger"
          className="mt-3"
          onSuccess={() => dialogRef.current?.close()}
        >
          <input type="hidden" name="bookingId" value={bookingId} />
          <div>
            <label className={labelClass}>Reason</label>
            <textarea name="reason" required rows={2} className={inputClass} />
          </div>
        </ActionForm>
        <button
          onClick={() => dialogRef.current?.close()}
          className="mt-2 text-xs font-medium text-ink-faint hover:text-ink"
        >
          Never mind
        </button>
      </dialog>
    </>
  );
}
