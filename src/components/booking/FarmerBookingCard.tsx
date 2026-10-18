import { BookingStatusBadge, EscrowStatusBadge } from "@/components/ui/Badge";
import { BookingDetailDialog } from "@/components/booking/BookingDetailDialog";
import { PayButton } from "@/components/booking/PayButton";
import { ConfirmDoneButton } from "@/components/booking/ConfirmDoneButton";
import { DisputeBookingDialog } from "@/components/booking/DisputeBookingDialog";
import { CancelBookingDialog } from "@/components/booking/CancelBookingDialog";
import { RateProviderDialog } from "@/components/booking/RateProviderDialog";
import { RatingStars } from "@/components/RatingStars";
import { formatDate } from "@/lib/format";
import { AGRI_CATEGORY_LABELS, HEALTH_CATEGORY_LABELS, SECTION_LABELS } from "@/lib/constants";
import type { getFarmerBookings } from "@/lib/queries";

type Booking = Awaited<ReturnType<typeof getFarmerBookings>>[number];

const CANCELLABLE = new Set(["PENDING", "AWAITING_PAYMENT", "READY_TO_START"]);

export function FarmerBookingCard({ booking }: { booking: Booking }) {
  const categoryLabel = booking.agriCategory
    ? AGRI_CATEGORY_LABELS[booking.agriCategory]
    : booking.healthCategory
      ? HEALTH_CATEGORY_LABELS[booking.healthCategory]
      : SECTION_LABELS[booking.section];

  return (
    <div className="rounded-xl border border-line bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-marigold">
            {SECTION_LABELS[booking.section]}
          </p>
          <h3 className="font-display text-lg font-semibold">
            {categoryLabel} · {booking.provider?.displayName ?? "Unassigned"}
          </h3>
          <p className="text-sm text-ink-soft">
            {booking.preferredDate ? `Scheduled: ${formatDate(booking.preferredDate)}` : "No date requested yet"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <BookingStatusBadge status={booking.status} />
          <EscrowStatusBadge status={booking.escrowStatus} />
        </div>
      </div>

      <p className="mt-2 text-sm text-ink-soft">{booking.description}</p>

      {booking.status === "CONFIRMED" && (
        <p className="mt-2 rounded-lg bg-brand-light px-3 py-2 text-xs text-brand-deep">
          Thanks for confirming. Kheti Sehat will now pay the provider.
        </p>
      )}

      {booking.rating && (
        <div className="mt-2">
          <RatingStars value={booking.rating.stars} />
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {booking.status === "AWAITING_PAYMENT" && booking.serviceAmount && (
          <PayButton bookingId={booking.id} amountRupees={booking.serviceAmount} />
        )}
        {booking.status === "PROVIDER_COMPLETED" && (
          <>
            <ConfirmDoneButton bookingId={booking.id} />
            <DisputeBookingDialog bookingId={booking.id} />
          </>
        )}
        {(booking.status === "CONFIRMED" || booking.status === "SETTLED") && !booking.rating && booking.provider && (
          <RateProviderDialog bookingId={booking.id} providerName={booking.provider.displayName} />
        )}
        <BookingDetailDialog booking={booking} />
        {CANCELLABLE.has(booking.status) && <CancelBookingDialog bookingId={booking.id} />}
      </div>
    </div>
  );
}
