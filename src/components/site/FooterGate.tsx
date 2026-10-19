"use client";

import { usePathname } from "next/navigation";

const DASHBOARD_PREFIXES = ["/admin", "/coordinator", "/farmer", "/provider", "/dashboard"];

/** Full footer on public pages; the slim one inside the role dashboards. */
export function FooterGate({ full, slim }: { full: React.ReactNode; slim: React.ReactNode }) {
  const pathname = usePathname();
  const inDashboard = DASHBOARD_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  return <>{inDashboard ? slim : full}</>;
}
