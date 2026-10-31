import Link from "next/link";
import { notFound } from "next/navigation";

import { getAllProviders, getBookableProviders, getPerson } from "@/lib/queries";
import { setActiveAction, staffUpdateProviderProfile } from "@/actions/people";
import { verifyProvider } from "@/actions/profile";
import { AccountForm, DeletePersonButton, PasswordForm } from "@/components/people/AccountForms";
import { StaffBookingForm } from "@/components/people/StaffBookingForm";
import { ProviderProfileForm } from "@/components/provider/ProviderProfileForm";
import { QueueBookingCard } from "@/components/booking/QueueBookingCard";
import { CommissionDialog } from "@/components/admin/CommissionDialog";
import { Badge } from "@/components/ui/Badge";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { AGRI_CATEGORY_LABELS, HEALTH_CATEGORY_LABELS, SECTION_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { Role } from "@/generated/prisma/enums";

const card = "rounded-xl border border-line bg-surface p-5";
const cardTitle = "font-display text-lg font-semibold";

function categoryOf(p: { section: "AGRI" | "HEALTH"; agriCategory: string | null; healthCategory: string | null }) {
  if (p.agriCategory) return AGRI_CATEGORY_LABELS[p.agriCategory as keyof typeof AGRI_CATEGORY_LABELS];
  if (p.healthCategory) return HEALTH_CATEGORY_LABELS[p.healthCategory as keyof typeof HEALTH_CATEGORY_LABELS];
  return SECTION_LABELS[p.section];
}

/** One farmer or provider, with every staff tool — shared by admin and coordinator. */
export async function PersonDetail({
  base,
  userId,
  viewerRole,
  justCreated,
}: {
  base: string;
  userId: string;
  viewerRole: Role;
  justCreated?: boolean;
}) {
  const person = await getPerson(userId);
  if (!person) notFound();
  const { user, bookings } = person;
  const profile = user.providerProfile;
  const isFarmer = user.role === "FARMER";

  const [allProviders, bookable] = await Promise.all([getAllProviders(), isFarmer ? getBookableProviders() : []]);
  const providerOptions = allProviders.map((p) => ({ id: p.id, label: `${p.displayName} • ${categoryOf(p)}` }));
  const bookingGroups = Object.entries(
    bookable.reduce<Record<string, { id: string; label: string }[]>>((acc, p) => {
      const group = `${SECTION_LABELS[p.section]} — ${categoryOf(p)}`;
      (acc[group] ??= []).push({ id: p.id, label: `${p.displayName} (${p.location || p.serviceDistricts[0] || "—"})` });
      return acc;
    }, {}),
  ).map(([group, options]) => ({ group, options }));

  return (
    <div>
      <Link href={base} className="text-sm font-medium text-brand hover:text-brand-deep">
        ← Farmers & Providers
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <h1 className="font-display text-2xl font-bold">{user.name}</h1>
        <Badge tone="neutral">{isFarmer ? "Farmer" : "Provider"}</Badge>
        {user.active ? <Badge tone="active">Active</Badge> : <Badge tone="danger">Disabled</Badge>}
        {profile && (profile.verified ? <Badge tone="active">Verified</Badge> : <Badge tone="pending">Unverified</Badge>)}
      </div>
      <p className="mt-1 text-sm text-ink-soft">
        {user.phone ?? "no phone"} · {user.email ?? "no email"} · joined {formatDate(user.createdAt)} · {bookings.length} booking(s)
      </p>

      {justCreated && (
        <p className="mt-4 rounded-lg bg-status-active-bg px-4 py-3 text-sm text-status-active">
          Account created. Share the login and password with them
          {profile ? ", then fill in their provider profile below and verify them." : "."}
        </p>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className={card}>
          <h2 className={cardTitle}>Account</h2>
          <div className="mt-3">
            <AccountForm user={user} />
          </div>
        </section>

        <section className={card}>
          <h2 className={cardTitle}>Access</h2>
          <div className="mt-3 space-y-5">
            <PasswordForm userId={user.id} />
            <div className="flex flex-wrap items-center gap-3 border-t border-line-soft pt-4">
              <form action={setActiveAction}>
                <input type="hidden" name="userId" value={user.id} />
                <input type="hidden" name="active" value={(!user.active).toString()} />
                <SubmitButton variant={user.active ? "secondary" : "primary"} pendingText="Saving…">
                  {user.active ? "Disable Account" : "Enable Account"}
                </SubmitButton>
              </form>
              <DeletePersonButton userId={user.id} name={user.name} />
            </div>
            <p className="text-xs text-ink-faint">
              Disabling blocks login but keeps their history. Delete only works for accounts with no bookings or ratings.
            </p>
          </div>
        </section>
      </div>

      {profile && (
        <section className={`${card} mt-5`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className={cardTitle}>Provider profile</h2>
            <div className="flex flex-wrap items-center gap-2">
              {viewerRole === "ADMIN" ? (
                <CommissionDialog providerId={profile.id} currentRate={profile.commissionRate} />
              ) : (
                <span className="text-sm text-ink-soft">Commission: {profile.commissionRate}%</span>
              )}
              <form action={verifyProvider}>
                <input type="hidden" name="providerId" value={profile.id} />
                <input type="hidden" name="verified" value={(!profile.verified).toString()} />
                <SubmitButton variant={profile.verified ? "secondary" : "primary"} pendingText="Saving…">
                  {profile.verified ? "Unverify" : "Verify Provider"}
                </SubmitButton>
              </form>
            </div>
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            Edit anything the provider can — services, area, credentials, pricing, photo and payout details.
            Verify only after checking their qualifications and licences.
          </p>
          <ProviderProfileForm
            profile={profile}
            action={staffUpdateProviderProfile}
            hidden={{ userId: user.id }}
            submitLabel="Save Provider Profile"
          />
        </section>
      )}

      {isFarmer && (
        <section className={`${card} mt-5 max-w-2xl`}>
          <h2 className={cardTitle}>Book a service for {user.name}</h2>
          <div className="mt-3">
            {bookingGroups.length ? (
              <StaffBookingForm farmerId={user.id} providers={bookingGroups} />
            ) : (
              <p className="text-sm text-ink-soft">No verified providers available yet.</p>
            )}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className={cardTitle}>{isFarmer ? "Their bookings" : "Bookings assigned to them"}</h2>
        <div className="mt-3 space-y-3">
          {bookings.length === 0 ? (
            <p className="text-sm text-ink-soft">No bookings yet.</p>
          ) : (
            bookings.map((b) => <QueueBookingCard key={b.id} booking={b} providerOptions={providerOptions} />)
          )}
        </div>
      </section>
    </div>
  );
}
