import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

export default async function FarmerSettingsPage() {
  const sessionUser = await requireUser(["FARMER"]);
  // The session only carries name/email — most farmers sign up by phone, so read the record.
  const user = await prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id } });

  const fields = [
    { label: "Name", value: user.name },
    { label: "Phone", value: user.phone ?? "—" },
    { label: "Email", value: user.email ?? "—" },
    { label: "Role", value: "Farmer" },
    { label: "Member Since", value: formatDate(user.createdAt) },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Account Setting</h1>
      <div className="mt-5 max-w-md space-y-3 rounded-xl border border-line bg-surface p-5">
        {fields.map((f) => (
          <div key={f.label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{f.label}</p>
            <p className="text-sm">{f.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
