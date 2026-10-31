import { requireUser } from "@/lib/authz";
import { getProviderProfileForUser } from "@/lib/queries";
import { updateProviderProfile } from "@/actions/profile";
import { StatTile } from "@/components/dashboard/DashboardShell";
import { ProviderProfileForm } from "@/components/provider/ProviderProfileForm";

export default async function ProviderSettingsPage() {
  const user = await requireUser(["PROVIDER"]);
  const profile = await getProviderProfileForUser(user.id);
  if (!profile) return <p className="text-ink-soft">No profile found.</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Account Setting · प्रोफ़ाइल संपादित करें</h1>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile label="Account Status" value={profile.verified ? "Verified" : "Pending Review"} />
        <StatTile label="Commission Rate" value={`${profile.commissionRate}%`} />
        <StatTile label="Payout Details" value={profile.payoutKycComplete ? "Complete" : "Incomplete"} />
      </div>

      <ProviderProfileForm profile={profile} action={updateProviderProfile} />
    </div>
  );
}
