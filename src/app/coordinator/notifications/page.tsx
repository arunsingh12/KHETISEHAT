import { requireUser } from "@/lib/authz";
import { getNotifications } from "@/lib/queries";
import { NotificationList } from "@/components/NotificationList";

export default async function CoordinatorNotificationsPage() {
  const user = await requireUser(["COORDINATOR"]);
  const notifications = await getNotifications(user.id);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Notifications</h1>
      <p className="mt-1 text-ink-soft">Booking updates, assignments, and alerts.</p>
      <NotificationList notifications={notifications} />
    </div>
  );
}
