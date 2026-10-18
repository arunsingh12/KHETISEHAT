"use client";

import { useRef } from "react";

import { manageBooking, setBookingPrice } from "@/actions/bookings";
import { ActionForm } from "@/components/ui/ActionForm";
import { Button } from "@/components/ui/Button";
import { formatRupees } from "@/lib/format";
import { inputClass, labelClass } from "@/lib/ui";
import type { BookingStatus } from "@/generated/prisma/enums";

const STATUS_OPTIONS: { value: BookingStatus; label: string }[] = [
  { value: "READY_TO_START", label: "Ready to Start" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "PROVIDER_COMPLETED", label: "Mark Work Complete" },
];

export function ManageBookingDialog({
  bookingId,
  hasPrice,
  amount,
  status,
  providerOptions,
}: {
  bookingId: string;
  hasPrice: boolean;
  amount: number | null;
  status: BookingStatus;
  providerOptions?: { id: string; label: string }[];
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Status changes are only for paid work in progress; every other stage is
  // someone else's move, so explain whose instead of offering a dropdown.
  const canUpdateStatus = status === "READY_TO_START" || status === "IN_PROGRESS";
  const waitingOn: Partial<Record<BookingStatus, string>> = {
    AWAITING_PAYMENT: `Waiting for the farmer to pay ${formatRupees(amount)}. You can start the work and update its status once they've paid — you'll get a notification.`,
    PROVIDER_COMPLETED: "You've marked this job complete — waiting for the farmer to confirm the work.",
    CONFIRMED: "The farmer confirmed the work. Kheti Sehat will send your payout shortly.",
    SETTLED: "Job complete — your payout has been sent.",
    DISPUTED: "The farmer raised an issue — a coordinator is reviewing it.",
    CANCELLED: "This booking was cancelled.",
  };

  return (
    <>
      <Button
        size="sm"
        variant={hasPrice ? "secondary" : "primary"}
        onClick={() => dialogRef.current?.showModal()}
      >
        {hasPrice ? "Manage" : "Set Price"}
      </Button>
      <dialog
        ref={dialogRef}
        className="w-[min(26rem,92vw)] rounded-xl border border-line bg-surface p-5 text-ink shadow-xl backdrop:bg-ink/40"
      >
        <div className="mb-3 flex items-start justify-between">
          <h3 className="font-display text-lg font-semibold">Manage Booking</h3>
          <button onClick={() => dialogRef.current?.close()} className="text-ink-faint hover:text-ink">
            ✕
          </button>
        </div>

        {!hasPrice && (
          <ActionForm action={setBookingPrice} submitLabel="Set Price" pendingLabel="Saving…" resetOnSuccess={false}>
            <input type="hidden" name="bookingId" value={bookingId} />
            <div>
              <label className={labelClass}>Your charge for this job (₹)</label>
              <p className="mb-1 text-xs text-ink-faint">
                The farmer pays this to Kheti Sehat; you receive it minus the platform fee after they confirm the work.
              </p>
              <input name="amount" type="number" min={1} required className={inputClass} />
            </div>
          </ActionForm>
        )}

        <ActionForm
          action={manageBooking}
          submitLabel="Save Changes"
          pendingLabel="Saving…"
          className={hasPrice ? "" : "mt-5 border-t border-line-soft pt-4"}
          onSuccess={() => dialogRef.current?.close()}
        >
          <input type="hidden" name="bookingId" value={bookingId} />
          {canUpdateStatus ? (
            <div>
              <label className={labelClass}>Update Status</label>
              <select name="status" defaultValue="" className={inputClass}>
                <option value="">Choose an option…</option>
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            waitingOn[status] && (
              <p className="rounded-lg bg-status-pending-bg px-3 py-2 text-sm text-status-pending">{waitingOn[status]}</p>
            )
          )}
          {providerOptions && (
            <div>
              <label className={labelClass}>Assign / Reassign Provider</label>
              <select name="providerId" defaultValue="" className={inputClass}>
                <option value="">Select provider</option>
                {providerOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              name="notes"
              rows={2}
              placeholder="e.g. I'll arrive at 9am with the drone"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-ink-faint">Visible to the farmer in their booking details.</p>
          </div>
        </ActionForm>
      </dialog>
    </>
  );
}
