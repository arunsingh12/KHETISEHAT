import { requireUser } from "@/lib/authz";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getUnreadNotificationCount } from "@/lib/queries";

export default async function ProviderLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["PROVIDER"]);
  const unread = await getUnreadNotificationCount(user.id);

  return (
    <DashboardShell
      title="Provider"
      groups={[
        {
          items: [
            { href: "/provider", label: "Home" },
            { href: "/provider/payouts", label: "My Payouts" },
            { href: "/provider/notifications", label: "Notifications", badge: unread },
            { href: "/provider/settings", label: "Account Settings" },
          ],
        },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
