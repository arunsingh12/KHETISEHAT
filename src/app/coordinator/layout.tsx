import { requireUser } from "@/lib/authz";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getUnreadNotificationCount } from "@/lib/queries";

export default async function CoordinatorLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["COORDINATOR"]);
  const unread = await getUnreadNotificationCount(user.id);

  return (
    <DashboardShell
      title="Coordinator"
      groups={[
        { items: [{ href: "/coordinator", label: "Home" }] },
        {
          title: "Quality & Providers",
          items: [{ href: "/coordinator/verification", label: "Provider Verification" }],
        },
        {
          title: "Operations",
          items: [
            { href: "/coordinator/cancellations", label: "Cancel & Reschedule" },
            { href: "/coordinator/payouts", label: "Monthly Payout" },
            { href: "/coordinator/listings", label: "Manage Listing" },
          ],
        },
        {
          items: [
            { href: "/coordinator/notifications", label: "Notification", badge: unread },
            { href: "/coordinator/settings", label: "Account Setting" },
          ],
        },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
