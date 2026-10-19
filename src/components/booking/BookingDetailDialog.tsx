"use client";

import { useRef } from "react";

import { Button } from "@/components/ui/Button";
import { BookingStatusBadge, EscrowStatusBadge } from "@/components/ui/Badge";
import { formatRupees } from "@/lib/format";
import { formatDateTime } from "@/lib/format";
import type { BookingStatus, EscrowStatus } from "@/generated/prisma/enums";

export type BookingDetail = {
  status: BookingStatus;
  escrowStatus: EscrowStatus;
  description: string;
  serviceAmount: number | null;
  platformFee: number | null;
  providerNet: number | null;
  paidAt: Date | null;
  providerCompletedAt: Date | null;
  autoReleaseDueAt: Date | null;
  releasedAt: Date | null;
  cancelledAt: Date | null;
  cancellationReason: string | null;
  coordinatorNotes: string | null;
  disputeReason: string | null;
  concernReason: string | null;
  concernCount: number;
  resubmissionNote: string | null;
  refundPercent: number | null;
  refundAmount: number | null;
  resolutionNotes: string | null;
};

export function BookingDetailDialog({ booking }: { booking: BookingDetail }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => dialogRef.current?.showModal()}>
        View Details
      </Button>
      <dialog
        ref={dialogRef}
        className="w-[min(30rem,92vw)] rounded-xl border border-line bg-surface p-0 text-ink shadow-xl backdrop:bg-ink/40"
      >
        <div className="p-5">
          <div className="mb-3 flex items-start justify-between">
            <h3 className="font-display text-lg font-semibold">Booking Details</h3>
            <button onClick={() => dialogRef.current?.close()} className="text-ink-faint hover:text-ink">
              ✕
            </button>
          </div>

          <dl className="space-y-2.5 text-sm">
            <Row label="Status">
              <BookingStatusBadge status={booking.status} />
            </Row>
            <Row label="Payment">
              <EscrowStatusBadge status={booking.escrowStatus} />
            </Row>
            <Row label="Description">{booking.description}</Row>
            {booking.serviceAmount != null && (
              <>
                <Row label="Service amount">{formatRupees(booking.serviceAmount)}</Row>
                <Row label="Platform fee">{formatRupees(booking.platformFee)}</Row>
                <Row label="Provider payout">{formatRupees(booking.providerNet)}</Row>
              </>
            )}
            {booking.paidAt && <Row label="Paid at">{formatDateTime(booking.paidAt)}</Row>}
            {booking.providerCompletedAt && (
              <Row label="Provider marked done">{formatDateTime(booking.providerCompletedAt)}</Row>
            )}
            {booking.autoReleaseDueAt && booking.escrowStatus === "HELD" && (
              <Row label="Auto-confirms at">{formatDateTime(booking.autoReleaseDueAt)}</Row>
            )}
            {booking.releasedAt && <Row label="Provider paid at">{formatDateTime(booking.releasedAt)}</Row>}
            {booking.cancellationReason && (
              <Row label="Cancellation reason">{booking.cancellationReason}</Row>
            )}
            {booking.concernReason && (
              <Row label={booking.concernCount > 1 ? `Latest concern (${booking.concernCount} raised)` : "Concern"}>
                {booking.concernReason}
              </Row>
            )}
            {booking.resubmissionNote && <Row label="Provider's fix">{booking.resubmissionNote}</Row>}
            {booking.disputeReason && <Row label="Refund request">{booking.disputeReason}</Row>}
            {booking.refundPercent != null && (
              <Row label="Refund decision">
                {booking.refundPercent}% · {formatRupees(booking.refundAmount)} to the farmer
              </Row>
            )}
            {booking.resolutionNotes && <Row label="Coordinator's notes">{booking.resolutionNotes}</Row>}
            {booking.coordinatorNotes && <Row label="Notes">{booking.coordinatorNotes}</Row>}
          </dl>
        </div>
      </dialog>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line-soft pb-2 last:border-0">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="text-right text-ink">{children}</dd>
    </div>
  );
}
