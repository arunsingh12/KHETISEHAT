import { getAllProviders, getCoordinatorBookings, getLowRatedProviders, getPendingRequestsCount, getUnverifiedProviders } from "@/lib/queries";
import { StatTile } from "@/components/dashboard/DashboardShell";
import { QueueBookingCard } from "@/components/booking/QueueBookingCard";
import { AiIntakeDialog } from "@/components/coordinator/AiIntakeDialog";
import { AGRI_CATEGORY_LABELS, BOOKING_STATUS_LABELS, HEALTH_CATEGORY_LABELS, SECTION_LABELS } from "@/lib/constants";
import { inputClass, labelClass } from "@/lib/ui";

export default async function CoordinatorHomePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; section?: string }>;
}) {
  const sp = await searchParams;
  const [pending, lowRated, unverified, allProviders, bookings] = await Promise.all([
    getPendingRequestsCount(),
    getLowRatedProviders(),
    getUnverifiedProviders(),
    getAllProviders(),
    getCoordinatorBookings({ status: sp.status, section: sp.section }),
  ]);

  const providerOptions = allProviders.map((p) => ({
    id: p.id,
    label: `${p.displayName} • ${
      p.agriCategory ? AGRI_CATEGORY_LABELS[p.agriCategory] : p.healthCategory ? HEALTH_CATEGORY_LABELS[p.healthCategory] : SECTION_LABELS[p.section]
    }`,
  }));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Coordinator Dashboard</h1>
          <p className="mt-1 text-ink-soft">Manage requests, providers, cancellations and payouts.</p>
        </div>
        <AiIntakeDialog />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile label="Pending Requests" value={pending} />
        <StatTile label="Pending Verification" value={unverified.length} />
        <StatTile label="Low-Rated Providers" value={lowRated.length} />
      </div>

      <h2 className="mt-8 font-display text-lg font-semibold">All Service Requests</h2>
      <form className="mt-3 grid gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Status</label>
          <select name="status" defaultValue={sp.status ?? ""} className={inputClass}>
            <option value="">All Statuses</option>
            {Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Section</label>
          <select name="section" defaultValue={sp.section ?? ""} className={inputClass}>
            <option value="">All Sections</option>
            {Object.entries(SECTION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button className="self-end rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-deep">
          Apply Filters
        </button>
      </form>

      <div className="mt-4 space-y-3">
        {bookings.length === 0 ? (
          <p className="text-ink-soft">No requests match those filters.</p>
        ) : (
          bookings.map((booking) => (
            <QueueBookingCard key={booking.id} booking={booking} providerOptions={providerOptions} />
          ))
        )}
      </div>
    </div>
  );
}
