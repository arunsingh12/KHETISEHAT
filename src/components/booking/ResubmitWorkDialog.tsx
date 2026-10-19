"use client";

import { useRef } from "react";

import { resubmitWorkAction } from "@/actions/bookings";
import { ActionForm } from "@/components/ui/ActionForm";
import { Button } from "@/components/ui/Button";
import { inputClass, labelClass } from "@/lib/ui";

/** Provider answers a farmer's concern: fixed the work, send it back for confirmation. */
export function ResubmitWorkDialog({ bookingId, concern }: { bookingId: string; concern: string | null }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <Button size="sm" onClick={() => dialogRef.current?.showModal()}>
        Resubmit Work
      </Button>
      <dialog
        ref={dialogRef}
        className="w-[min(24rem,92vw)] rounded-xl border border-line bg-surface p-5 text-ink shadow-xl backdrop:bg-ink/40"
      >
        <h3 className="font-display text-lg font-semibold">Resubmit work</h3>
        {concern && (
          <p className="mt-2 rounded-lg bg-status-pending-bg px-3 py-2 text-sm text-status-pending">
            Farmer&apos;s concern: “{concern}”
          </p>
        )}
        <p className="mt-2 text-sm text-ink-soft">
          Once you&apos;ve fixed it, resubmit — the farmer will be asked to confirm the work again.
        </p>
        <ActionForm
          action={resubmitWorkAction}
          submitLabel="Resubmit Work"
          pendingLabel="Resubmitting…"
          className="mt-3"
          onSuccess={() => dialogRef.current?.close()}
        >
          <input type="hidden" name="bookingId" value={bookingId} />
          <div>
            <label className={labelClass}>What did you fix? (optional)</label>
            <textarea name="note" rows={3} className={inputClass} />
          </div>
        </ActionForm>
      </dialog>
    </>
  );
}
