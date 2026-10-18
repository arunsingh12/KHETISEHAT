import { getAllProviders, getCoordinatorBookings } from "@/lib/queries";
import { QueueBookingCard } from "@/components/booking/QueueBookingCard";
import { AGRI_CATEGORY_LABELS, BOOKING_STATUS_LABELS, HEALTH_CATEGORY_LABELS, SECTION_LABELS } from "@/lib/constants";
import { inputClass, labelClass } from "@/lib/ui";

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; section?: string }>;
}) {
  const sp = await searchParams;
  const [allProviders, bookings] = await Promise.all([
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
      <h1 className="font-display text-2xl font-bold">All Bookings</h1>
      <p className="mt-1 text-ink-soft">Every request on the platform, with full manage/reassign access.</p>

      <form className="mt-5 grid gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-3">
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
          <p className="text-ink-soft">No bookings match those filters.</p>
        ) : (
          bookings.map((booking) => (
            <QueueBookingCard key={booking.id} booking={booking} providerOptions={providerOptions} />
          ))
        )}
      </div>
    </div>
  );
}
