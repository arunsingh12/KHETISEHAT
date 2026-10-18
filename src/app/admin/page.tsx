import { getPlatformStats } from "@/lib/queries";
import { StatTile } from "@/components/dashboard/DashboardShell";
import { BOOKING_STATUS_LABELS } from "@/lib/constants";
import { formatRupees } from "@/lib/format";
import type { BookingStatus } from "@/generated/prisma/enums";

export default async function AdminHomePage() {
  const stats = await getPlatformStats();
  const countFor = (status: BookingStatus) =>
    stats.bookingsByStatus.find((b) => b.status === status)?._count ?? 0;
  const totalBookings = stats.bookingsByStatus.reduce((sum, b) => sum + b._count, 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
      <p className="mt-1 text-ink-soft">Platform-wide visibility across every role.</p>

      <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-ink-faint">People</h2>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Farmers" value={stats.userCounts.farmers} />
        <StatTile label="Providers" value={stats.userCounts.providers} />
        <StatTile label="Coordinators" value={stats.userCounts.coordinators} />
        <StatTile label="Admins" value={stats.userCounts.admins} />
      </div>

      <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-ink-faint">Bookings</h2>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Total" value={totalBookings} />
        <StatTile label={BOOKING_STATUS_LABELS.AWAITING_PAYMENT} value={countFor("AWAITING_PAYMENT")} />
        <StatTile label={BOOKING_STATUS_LABELS.SETTLED} value={countFor("SETTLED")} />
        <StatTile label={BOOKING_STATUS_LABELS.DISPUTED} value={stats.disputedCount} />
      </div>

      <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-ink-faint">Money &amp; quality</h2>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Platform commission earned" value={formatRupees(stats.totalCommissionEarned)} />
        <StatTile label="Gross settled" value={formatRupees(stats.totalGrossSettled)} />
        <StatTile label="Payouts awaiting approval" value={stats.awaitingApprovalCount} />
        <StatTile label="Providers pending verification" value={stats.unverifiedCount} />
      </div>
    </div>
  );
}
