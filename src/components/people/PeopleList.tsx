import Link from "next/link";

import { listPeople, type PeopleRole } from "@/lib/queries";
import { AddPersonDialog } from "@/components/people/AddPersonDialog";
import { Badge } from "@/components/ui/Badge";
import { AGRI_CATEGORY_LABELS, HEALTH_CATEGORY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { inputClass, labelClass } from "@/lib/ui";

type Filters = { role?: string; q?: string; status?: string };

/** Farmers & Providers list — shared by /admin/people and /coordinator/people. */
export async function PeopleList({ base, filters }: { base: string; filters: Filters }) {
  const role = filters.role === "FARMER" || filters.role === "PROVIDER" ? (filters.role as PeopleRole) : undefined;
  const status =
    filters.status === "active" || filters.status === "disabled" || filters.status === "unverified"
      ? filters.status
      : undefined;
  const people = await listPeople({ role, q: filters.q, status });

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Farmers & Providers</h1>
          <p className="mt-1 text-ink-soft">Open anyone to edit their details, reset a password, manage bookings or book for them.</p>
        </div>
        <AddPersonDialog />
      </div>

      <form className="mt-6 grid gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-[1fr_1fr_2fr_auto]">
        <div>
          <label className={labelClass}>Type</label>
          <select name="role" defaultValue={role ?? ""} className={inputClass}>
            <option value="">Farmers & Providers</option>
            <option value="FARMER">Farmers</option>
            <option value="PROVIDER">Providers</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select name="status" defaultValue={status ?? ""} className={inputClass}>
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
            <option value="unverified">Providers awaiting verification</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Search</label>
          <input name="q" defaultValue={filters.q ?? ""} placeholder="Name, phone or email" className={inputClass} />
        </div>
        <button className="self-end rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-deep">
          Search
        </button>
      </form>

      <p className="mt-4 text-sm text-ink-faint">{people.length} account(s)</p>
      <div className="mt-2 overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line bg-surface-2 text-xs uppercase tracking-wide text-ink-faint">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Bookings</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {people.map((u) => {
              const p = u.providerProfile;
              const category = p?.agriCategory
                ? AGRI_CATEGORY_LABELS[p.agriCategory]
                : p?.healthCategory
                  ? HEALTH_CATEGORY_LABELS[p.healthCategory]
                  : p
                    ? "Not set"
                    : "—";
              return (
                <tr key={u.id} className="border-b border-line-soft last:border-0 hover:bg-surface-2">
                  <td className="px-4 py-3">
                    <Link href={`${base}/${u.id}`} className="font-medium text-brand hover:text-brand-deep">
                      {u.name}
                    </Link>
                    <p className="text-xs text-ink-faint">{u.phone ?? u.email ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3">{u.role === "FARMER" ? "Farmer" : "Provider"}</td>
                  <td className="px-4 py-3 text-ink-soft">{category}</td>
                  <td className="px-4 py-3">{p ? p._count.bookings : u._count.bookings}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {u.active ? <Badge tone="active">Active</Badge> : <Badge tone="danger">Disabled</Badge>}
                      {p && !p.verified && <Badge tone="pending">Unverified</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{formatDate(u.createdAt)}</td>
                </tr>
              );
            })}
            {people.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-soft">
                  No farmers or providers match those filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
