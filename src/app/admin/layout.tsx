import { requireUser } from "@/lib/authz";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireUser(["ADMIN"]);
  const payoutsWaiting = await prisma.booking.count({ where: { status: "CONFIRMED", escrowStatus: "HELD" } });

  return (
    <DashboardShell
      title="Admin"
      groups={[
        { items: [{ href: "/admin", label: "Home" }] },
        {
          title: "Platform",
          items: [
            { href: "/admin/users", label: "Users" },
            { href: "/admin/providers", label: "Providers" },
            { href: "/admin/hospitals", label: "Hospitals" },
            { href: "/admin/bookings", label: "All Bookings" },
            { href: "/admin/payouts", label: "Payouts", badge: payoutsWaiting },
          ],
        },
        { items: [{ href: "/admin/settings", label: "Settings" }] },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
