import Link from "next/link";

/** `badge` shows a count bubble (e.g. unread notifications); hidden when 0. */
export type NavItem = { href: string; label: string; badge?: number };
export type NavGroup = { title?: string; items: NavItem[] };

export function DashboardShell({
  title,
  groups,
  children,
}: {
  title: string;
  groups: NavGroup[];
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="grid gap-6 md:grid-cols-[14rem_1fr]">
        <aside className="md:sticky md:top-6 md:h-fit">
          <div className="rounded-xl border border-line bg-surface p-4">
            <p className="font-display text-lg font-bold text-brand-deep">{title}</p>
            <nav className="mt-4 space-y-4">
              {groups.map((group, i) => (
                <div key={i}>
                  {group.title && (
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                      {group.title}
                    </p>
                  )}
                  <ul className="space-y-1">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:bg-surface-2 hover:text-ink"
                        >
                          {item.label}
                          {item.badge ? (
                            <span className="min-w-5 rounded-full bg-marigold px-1.5 py-0.5 text-center text-xs font-semibold text-white">
                              {item.badge > 99 ? "99+" : item.badge}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

export function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="font-display text-2xl font-bold">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{label}</p>
    </div>
  );
}
