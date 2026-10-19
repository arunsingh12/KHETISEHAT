import { getCancelledAndDisputedBookings } from "@/lib/queries";
import { BookingStatusBadge, EscrowStatusBadge } from "@/components/ui/Badge";
import { RefundResolveForm } from "@/components/booking/RefundResolveForm";
import {
  AGRI_CATEGORY_LABELS,
  DEFAULT_COMMISSION_RATE,
  HEALTH_CATEGORY_LABELS,
  SECTION_LABELS,
} from "@/lib/constants";
import { formatDate, formatRupees } from "@/lib/format";

type Booking = Awaited<ReturnType<typeof getCancelledAndDisputedBookings>>[number];

export default async function CancellationsPage() {
  const bookings = await getCancelledAndDisputedBookings();
  const refundRequests = bookings.filter((b) => b.status === "DISPUTED");
  const history = bookings.filter((b) => b.status !== "DISPUTED");

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Refunds &amp; Cancellations</h1>
      <p className="mt-1 text-ink-soft">
        Refund requests waiting on your decision, plus every cancelled or refunded booking.
      </p>

      <h2 className="mt-6 font-display text-lg font-semibold">Refund requests</h2>
      <p className="text-sm text-ink-soft">
        Call the farmer and the provider, agree a fair outcome, then set how much is refunded.
      </p>
      <div className="mt-3 space-y-3">
        {refundRequests.length === 0 ? (
          <p className="text-ink-soft">No open refund requests.</p>
        ) : (
          refundRequests.map((booking) => (
            <BookingSummary key={booking.id} booking={booking}>
              <p className="mt-2 rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger">
                Farmer&apos;s refund request: “{booking.disputeReason}”
              </p>
              {booking.concernCount > 0 && (
                <p className="mt-2 text-sm text-ink-soft">
                  Concerns raised with the provider before this: {booking.concernCount}
                  {booking.concernReason ? ` — latest: “${booking.concernReason}”` : ""}
                  {booking.resubmissionNote ? ` · Provider's last fix: “${booking.resubmissionNote}”` : ""}
                </p>
              )}
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Contact
                  role="Farmer"
                  name={booking.farmer.name}
                  phone={booking.farmer.phone}
                  email={booking.farmer.email}
                />
                <Contact role="Provider" name={booking.provider?.displayName ?? "Unassigned"} phone={booking.provider?.phone} />
              </div>
              {booking.serviceAmount != null && (
                <RefundResolveForm
                  bookingId={booking.id}
                  serviceAmount={booking.serviceAmount}
                  commissionRate={booking.commissionRate ?? DEFAULT_COMMISSION_RATE}
                />
              )}
            </BookingSummary>
          ))
        )}
      </div>

      <h2 className="mt-8 font-display text-lg font-semibold">History</h2>
      <div className="mt-3 space-y-3">
        {history.length === 0 ? (
          <p className="text-ink-soft">Nothing here yet.</p>
        ) : (
          history.map((booking) => (
            <BookingSummary key={booking.id} booking={booking}>
              {booking.refundPercent != null && (
                <p className="mt-2 text-sm text-ink">
                  Refund decision: {booking.refundPercent}% ({formatRupees(booking.refundAmount)}) to the farmer
                  {booking.refundPercent < 100 && ` · ${formatRupees(booking.providerNet)} payout to the provider`}
                  {booking.resolutionNotes && <span className="text-ink-soft"> — {booking.resolutionNotes}</span>}
                </p>
              )}
              {booking.cancellationReason && (
                <p className="mt-2 text-sm text-ink-soft">Reason: {booking.cancellationReason}</p>
              )}
            </BookingSummary>
          ))
        )}
      </div>
    </div>
  );
}

function BookingSummary({ booking, children }: { booking: Booking; children: React.ReactNode }) {
  const categoryLabel = booking.agriCategory
    ? AGRI_CATEGORY_LABELS[booking.agriCategory]
    : booking.healthCategory
      ? HEALTH_CATEGORY_LABELS[booking.healthCategory]
      : SECTION_LABELS[booking.section];

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold">
            {categoryLabel} · {booking.provider?.displayName ?? "Unassigned"}
          </h3>
          <p className="text-sm text-ink-soft">
            {booking.farmer.name} · {booking.preferredDate ? formatDate(booking.preferredDate) : "No date given"}
            {booking.serviceAmount != null && ` · ${formatRupees(booking.serviceAmount)} paid`}
          </p>
        </div>
        <div className="flex gap-2">
          <BookingStatusBadge status={booking.status} />
          <EscrowStatusBadge status={booking.escrowStatus} />
        </div>
      </div>
      {children}
    </div>
  );
}

function Contact({
  role,
  name,
  phone,
  email,
}: {
  role: string;
  name: string;
  phone?: string | null;
  email?: string | null;
}) {
  return (
    <div className="rounded-lg border border-line-soft p-3 text-sm">
      <p className="text-xs uppercase tracking-wide text-ink-faint">{role}</p>
      <p className="font-medium">{name}</p>
      {phone && (
        <a href={`tel:${phone}`} className="block font-medium text-brand hover:text-brand-deep">
          📞 {phone}
        </a>
      )}
      {email && (
        <a href={`mailto:${email}`} className="block text-ink-soft hover:text-brand">
          {email}
        </a>
      )}
      {!phone && !email && <p className="text-ink-faint">No contact details</p>}
    </div>
  );
}
