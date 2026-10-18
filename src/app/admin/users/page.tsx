import { requireUser } from "@/lib/authz";
import { getAllUsers } from "@/lib/queries";
import { UserRow } from "@/components/admin/UserRow";
import { ROLE_LABELS } from "@/lib/constants";
import { inputClass, labelClass } from "@/lib/ui";
import type { Role } from "@/generated/prisma/enums";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string }>;
}) {
  const admin = await requireUser(["ADMIN"]);
  const sp = await searchParams;
  const users = await getAllUsers({ role: (sp.role as Role) || undefined, q: sp.q });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Users</h1>
      <p className="mt-1 text-ink-soft">Every account on the platform, across all four roles.</p>

      <form className="mt-6 grid gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-[1fr_1fr_auto]">
        <div>
          <label className={labelClass}>Role</label>
          <select name="role" defaultValue={sp.role ?? ""} className={inputClass}>
            <option value="">All roles</option>
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Search</label>
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Name, phone, or email" className={inputClass} />
        </div>
        <button className="self-end rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-deep">
          Search
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-line bg-surface-2 text-xs uppercase tracking-wide text-ink-faint">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserRow key={user.id} user={user} isSelf={user.id === admin.id} />
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-ink-soft">
                  No users match those filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
