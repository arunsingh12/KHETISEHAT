import { requireUser } from "@/lib/authz";

export default async function CoordinatorSettingsPage() {
  const user = await requireUser(["COORDINATOR"]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Account Setting</h1>
      <div className="mt-5 max-w-md space-y-3 rounded-xl border border-line bg-surface p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Name</p>
          <p className="text-sm">{user.name}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Phone / Email</p>
          <p className="text-sm">{user.email ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Role</p>
          <p className="text-sm">Coordinator</p>
        </div>
      </div>
    </div>
  );
}
