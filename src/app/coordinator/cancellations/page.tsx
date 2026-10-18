import { getCancelledAndDisputedBookings } from "@/lib/queries";
import { BookingStatusBadge, EscrowStatusBadge } from "@/components/ui/Badge";
import { DisputeResolveForm } from "@/components/booking/DisputeResolveForm";
import { AGRI_CATEGORY_LABELS, HEALTH_CATEGORY_LABELS, SECTION_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export default async function CancellationsPage() {
  const bookings = await getCancelledAndDisputedBookings();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Cancel &amp; Reschedule</h1>
      <p className="mt-1 text-ink-soft">All cancelled requests, and disputes waiting on a decision.</p>

      <div className="mt-5 space-y-3">
        {bookings.length === 0 ? (
          <p className="text-ink-soft">Nothing here right now.</p>
        ) : (
          bookings.map((booking) => {
            const categoryLabel = booking.agriCategory
              ? AGRI_CATEGORY_LABELS[booking.agriCategory]
              : booking.healthCategory
                ? HEALTH_CATEGORY_LABELS[booking.healthCategory]
                : SECTION_LABELS[booking.section];
            return (
              <div key={booking.id} className="rounded-xl border border-line bg-surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base font-semibold">
                      {categoryLabel} · {booking.provider?.displayName ?? "Unassigned"}
                    </h3>
                    <p className="text-sm text-ink-soft">
                      {booking.farmer.name} · {booking.preferredDate ? formatDate(booking.preferredDate) : "No date given"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <BookingStatusBadge status={booking.status} />
                    <EscrowStatusBadge status={booking.escrowStatus} />
                  </div>
                </div>
                {booking.cancellationReason && (
                  <p className="mt-2 text-sm text-ink-soft">Reason: {booking.cancellationReason}</p>
                )}
                {booking.status === "DISPUTED" && <DisputeResolveForm bookingId={booking.id} />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
