import Link from "next/link";
import { requireUser } from "@/lib/authz";
import { getFarmerBookings, getNotifications, getUnreadNotificationCount } from "@/lib/queries";
import { StatTile } from "@/components/dashboard/DashboardShell";
import { FarmerBookingCard } from "@/components/booking/FarmerBookingCard";
import { BookingStatusBadge } from "@/components/ui/Badge";
import { AGRI_CATEGORY_LABELS, HEALTH_CATEGORY_LABELS, SECTION_LABELS } from "@/lib/constants";
import { formatDate, formatRupees, timeAgo } from "@/lib/format";

const ACTIVE = new Set(["PENDING", "AWAITING_PAYMENT", "READY_TO_START", "IN_PROGRESS", "PROVIDER_COMPLETED", "CONCERN_RAISED"]);

const QUICK_LINKS = [
  { href: "/agri-services", title: "Agri Services", hindi: "कृषि सेवाएं", body: "Drones, equipment, soil testing, agronomists, solar." },
  { href: "/health-services", title: "Health Services", hindi: "स्वास्थ्य सेवाएं", body: "Doctors, nurses, labs, pharmacy, ambulance." },
];

export default async function FarmerHomePage() {
  const user = await requireUser(["FARMER"]);
  const [bookings, notifications, unreadCount] = await Promise.all([
    getFarmerBookings(user.id),
    getNotifications(user.id),
    getUnreadNotificationCount(user.id),
  ]);

  // Bookings waiting on the farmer: pay, confirm the work, or rate the provider.
  const needsAction = bookings.filter(
    (b) =>
      (b.status === "AWAITING_PAYMENT" && b.serviceAmount) ||
      b.status === "PROVIDER_COMPLETED" ||
      ((b.status === "CONFIRMED" || b.status === "SETTLED") && !b.rating && b.provider),
  );
  const activeCount = bookings.filter((b) => ACTIVE.has(b.status)).length;
  const paidPending = bookings
    .filter((b) => b.escrowStatus === "HELD" || b.escrowStatus === "FROZEN")
    .reduce((sum, b) => sum + (b.serviceAmount ?? 0), 0);
  const totalSpent = bookings
    .filter((b) => b.escrowStatus === "RELEASED" || b.escrowStatus === "PARTIAL")
    .reduce((sum, b) => sum + (b.serviceAmount ?? 0), 0);

  const firstName = user.name?.split(" ")[0] ?? "";

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Namaste, {firstName} · नमस्ते</h1>
      <p className="mt-1 text-ink-soft">Your service requests, payments, and updates at a glance.</p>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Active Requests" value={activeCount} />
        <StatTile label="Needs Your Action" value={needsAction.length} />
        <StatTile label="Paid, Work Pending" value={formatRupees(paidPending)} />
        <StatTile label="Total Spent" value={formatRupees(totalSpent)} />
      </div>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold">Needs your attention</h2>
        {needsAction.length === 0 ? (
          <p className="mt-2 rounded-xl border border-line bg-surface p-4 text-sm text-ink-soft">
            You&apos;re all caught up — nothing to pay, confirm, or rate right now.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {needsAction.map((booking) => (
              <FarmerBookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold">Request a service</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl border border-line bg-surface p-4 transition-colors hover:border-brand hover:bg-brand-light"
            >
              <p className="font-display font-semibold text-brand-deep">{link.title}</p>
              <p className="text-xs text-marigold">{link.hindi}</p>
              <p className="mt-1 text-sm text-ink-soft">{link.body}</p>
            </Link>
          ))}
          <a
            href="tel:108"
            className="rounded-xl border border-status-danger bg-status-danger-bg p-4 transition-colors hover:bg-status-danger hover:text-white"
          >
            <p className="font-display font-semibold">Emergency · 108</p>
            <p className="text-xs">आपातकालीन एम्बुलेंस</p>
            <p className="mt-1 text-sm">Call a free government ambulance right away.</p>
          </a>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold">Recent bookings</h2>
            <Link href="/farmer/bookings" className="text-sm font-medium text-brand hover:text-brand-deep">
              View all →
            </Link>
          </div>
          {bookings.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">No bookings yet — request a service above to get started.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line-soft rounded-xl border border-line bg-surface">
              {bookings.slice(0, 5).map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {b.agriCategory
                        ? AGRI_CATEGORY_LABELS[b.agriCategory]
                        : b.healthCategory
                          ? HEALTH_CATEGORY_LABELS[b.healthCategory]
                          : SECTION_LABELS[b.section]}{" "}
                      · {b.provider?.displayName ?? "Unassigned"}
                    </p>
                    <p className="text-xs text-ink-faint">
                      Requested {formatDate(b.createdAt)}
                      {b.serviceAmount ? ` · ${formatRupees(b.serviceAmount)}` : ""}
                    </p>
                  </div>
                  <BookingStatusBadge status={b.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold">
              Updates{unreadCount > 0 && <span className="ml-2 text-sm font-medium text-marigold">{unreadCount} new</span>}
            </h2>
            <Link href="/farmer/notifications" className="text-sm font-medium text-brand hover:text-brand-deep">
              View all →
            </Link>
          </div>
          {notifications.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">Nothing yet — you&apos;ll see booking updates here.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line-soft rounded-xl border border-line bg-surface">
              {notifications.slice(0, 5).map((n) => (
                <li key={n.id} className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className={`text-sm ${n.read ? "text-ink-soft" : "font-medium text-ink"}`}>{n.title}</p>
                    <span className="shrink-0 text-xs text-ink-faint">{timeAgo(n.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-ink-soft">{n.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
