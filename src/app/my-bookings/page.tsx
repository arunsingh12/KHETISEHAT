import { redirect } from "next/navigation";

// The farmer's booking list now lives inside the farmer dashboard.
export default function MyBookingsRedirectPage() {
  redirect("/farmer/bookings");
}
