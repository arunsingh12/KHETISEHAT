import { requireUser } from "@/lib/authz";
import { getNotifications } from "@/lib/queries";
import { NotificationList } from "@/components/NotificationList";

export default async function FarmerNotificationsPage() {
  const user = await requireUser(["FARMER"]);
  const notifications = await getNotifications(user.id);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Notifications · सूचनाएं</h1>
      <p className="mt-1 text-ink-soft">Updates on your bookings, payments, and providers.</p>
      <NotificationList notifications={notifications} />
    </div>
  );
}
