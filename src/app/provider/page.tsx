import { requireUser } from "@/lib/authz";
import { getProviderProfileForUser, getProviderBookings } from "@/lib/queries";
import { StatTile } from "@/components/dashboard/DashboardShell";
import { QueueBookingCard } from "@/components/booking/QueueBookingCard";
import { BOOKING_STATUS_LABELS, SECTION_LABELS } from "@/lib/constants";
import { formatRupees } from "@/lib/format";
import { inputClass, labelClass } from "@/lib/ui";

export default async function ProviderHomePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; section?: string }>;
}) {
  const user = await requireUser(["PROVIDER"]);
  const sp = await searchParams;
  const profile = await getProviderProfileForUser(user.id);
  if (!profile) {
    return <p className="text-ink-soft">Finish setting up your provider profile in Account Settings.</p>;
  }

  const allBookings = await getProviderBookings(profile.id);
  const filtered = allBookings.filter(
    (b) => (!sp.status || b.status === sp.status) && (!sp.section || b.section === sp.section),
  );

  const pending = allBookings.filter((b) => b.status === "PENDING" || b.status === "AWAITING_PAYMENT").length;
  const active = allBookings.filter((b) => b.status === "READY_TO_START" || b.status === "IN_PROGRESS").length;
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const earnings = allBookings
    .filter((b) => b.escrowStatus === "RELEASED" && b.releasedAt && b.releasedAt >= thisMonth)
    .reduce((sum, b) => sum + (b.providerNet ?? 0), 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Provider Dashboard</h1>
      <p className="mt-1 text-ink-soft">Manage requests, your schedule, and your earnings.</p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile label="Pending Requests" value={pending} />
        <StatTile label="Active Jobs" value={active} />
        <StatTile label="Earnings This Month" value={formatRupees(earnings)} />
      </div>

      <form className="mt-6 grid gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-3">
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
        {filtered.length === 0 ? (
          <p className="text-ink-soft">No requests match those filters.</p>
        ) : (
          filtered.map((booking) => <QueueBookingCard key={booking.id} booking={booking} />)
        )}
      </div>
    </div>
  );
}
