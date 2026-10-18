import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DASHBOARD_BY_ROLE } from "@/lib/constants";

export default async function DashboardRedirectPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  redirect(DASHBOARD_BY_ROLE[session.user.role]);
}
