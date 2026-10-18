import { BookingStatusBadge, EscrowStatusBadge, Badge } from "@/components/ui/Badge";
import { BookingDetailDialog } from "@/components/booking/BookingDetailDialog";
import { ManageBookingDialog } from "@/components/booking/ManageBookingDialog";
import { CancelBookingDialog } from "@/components/booking/CancelBookingDialog";
import { formatDate, formatRupees } from "@/lib/format";
import { AGRI_CATEGORY_LABELS, HEALTH_CATEGORY_LABELS, SECTION_LABELS } from "@/lib/constants";
import type { getCoordinatorBookings } from "@/lib/queries";

type Booking = Awaited<ReturnType<typeof getCoordinatorBookings>>[number];

const CANCELLABLE = new Set(["PENDING", "AWAITING_PAYMENT", "READY_TO_START", "IN_PROGRESS"]);

export function QueueBookingCard({
  booking,
  providerOptions,
}: {
  booking: Booking;
  /** Passed only in the coordinator view — lets them (re)assign a provider. */
  providerOptions?: { id: string; label: string }[];
}) {
  const categoryLabel = booking.agriCategory
    ? AGRI_CATEGORY_LABELS[booking.agriCategory]
    : booking.healthCategory
      ? HEALTH_CATEGORY_LABELS[booking.healthCategory]
      : SECTION_LABELS[booking.section];

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{SECTION_LABELS[booking.section]}</Badge>
            {booking.aiExtracted && <Badge tone="pending">AI</Badge>}
          </div>
          <h3 className="mt-1 font-display text-base font-semibold">
            {categoryLabel} · {booking.provider?.displayName ?? "Unassigned"}
          </h3>
          <p className="text-sm text-ink-soft">
            {booking.farmer.name} · {booking.preferredDate ? formatDate(booking.preferredDate) : "No date given"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <BookingStatusBadge status={booking.status} />
          <EscrowStatusBadge status={booking.escrowStatus} />
        </div>
      </div>

      <p className="mt-2 text-sm text-ink-soft">{booking.description}</p>
      {booking.status === "READY_TO_START" && booking.escrowStatus === "HELD" && (
        <p className="mt-2 rounded-lg bg-status-active-bg px-3 py-2 text-sm font-medium text-status-active">
          ✓ The farmer has paid {formatRupees(booking.serviceAmount)} to Kheti Sehat — you can start the work. Use
          Manage → In Progress when you begin.
        </p>
      )}
      {booking.status === "AWAITING_PAYMENT" && (
        <p className="mt-2 rounded-lg bg-status-pending-bg px-3 py-2 text-sm text-status-pending">
          Waiting for the farmer to pay — don&apos;t start yet.
        </p>
      )}
      {booking.serviceAmount != null && (
        <p className="mt-1 text-sm font-medium text-ink">{formatRupees(booking.serviceAmount)}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <ManageBookingDialog
          bookingId={booking.id}
          hasPrice={booking.serviceAmount != null}
          amount={booking.serviceAmount}
          status={booking.status}
          providerOptions={providerOptions}
        />
        <BookingDetailDialog booking={booking} />
        {CANCELLABLE.has(booking.status) && <CancelBookingDialog bookingId={booking.id} />}
      </div>
    </div>
  );
}
