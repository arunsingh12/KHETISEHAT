import { requireUser } from "@/lib/authz";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getUnreadNotificationCount } from "@/lib/queries";

export default async function FarmerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["FARMER"]);
  const unread = await getUnreadNotificationCount(user.id);

  return (
    <DashboardShell
      title="Farmer"
      groups={[
        {
          items: [
            { href: "/farmer", label: "Home" },
            { href: "/farmer/bookings", label: "My Bookings" },
            { href: "/farmer/notifications", label: "Notifications", badge: unread },
            { href: "/farmer/settings", label: "Account Settings" },
          ],
        },
        {
          title: "Find Services",
          items: [
            { href: "/agri-services", label: "Agri Services" },
            { href: "/health-services", label: "Health Services" },
            { href: "/hospitals", label: "Hospitals" },
          ],
        },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
