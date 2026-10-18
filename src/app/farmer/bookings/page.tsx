import { requireUser } from "@/lib/authz";
import { getFarmerBookings } from "@/lib/queries";
import { FarmerBookingCard } from "@/components/booking/FarmerBookingCard";
import { BOOKING_STATUS_LABELS, SECTION_LABELS } from "@/lib/constants";
import { inputClass, labelClass } from "@/lib/ui";

export default async function FarmerBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; section?: string }>;
}) {
  const user = await requireUser(["FARMER"]);
  const sp = await searchParams;
  const bookings = await getFarmerBookings(user.id, { status: sp.status, section: sp.section });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">My Bookings · मेरी बुकिंग</h1>
      <p className="mt-1 text-ink-soft">
        Track your agri and health service requests, payments, and payouts in one place.
      </p>

      <form className="mt-6 grid gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-2">
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
          <label className={labelClass}>Service Section</label>
          <select name="section" defaultValue={sp.section ?? ""} className={inputClass}>
            <option value="">All Sections</option>
            {Object.entries(SECTION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-deep sm:col-span-2 sm:w-40">
          Filter
        </button>
      </form>

      <div className="mt-6 space-y-4">
        {bookings.length === 0 ? (
          <p className="text-ink-soft">No bookings yet — browse Agri or Health Services to request one.</p>
        ) : (
          bookings.map((booking) => <FarmerBookingCard key={booking.id} booking={booking} />)
        )}
      </div>
    </div>
  );
}
