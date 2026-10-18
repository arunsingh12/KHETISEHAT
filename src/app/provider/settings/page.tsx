import { requireUser } from "@/lib/authz";
import { getProviderProfileForUser } from "@/lib/queries";
import { ActionForm } from "@/components/ui/ActionForm";
import { updateProviderProfile } from "@/actions/profile";
import { inputClass, labelClass } from "@/lib/ui";
import {
  AYUSHMAN_LABELS,
  SECTION_LABELS,
  agriCategoryOptions,
  healthCategoryOptions,
} from "@/lib/constants";
import { StatTile } from "@/components/dashboard/DashboardShell";

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

      <ActionForm
        action={updateProviderProfile}
        submitLabel="Save Profile"
        pendingLabel="Saving…"
        resetOnSuccess={false}
        className="mt-6 max-w-xl space-y-4 rounded-xl border border-line bg-surface p-5"
      >
        <div>
          <label className={labelClass}>Display Name</label>
          <input name="displayName" defaultValue={profile.displayName} required className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Service Section</label>
          <select name="section" defaultValue={profile.section} className={inputClass}>
            {Object.entries(SECTION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Agri Category</label>
          <select name="agriCategory" defaultValue={profile.agriCategory ?? ""} className={inputClass}>
            <option value="">Select agri category</option>
            {agriCategoryOptions().map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Health Category</label>
          <select name="healthCategory" defaultValue={profile.healthCategory ?? ""} className={inputClass}>
            <option value="">Select health category</option>
            {healthCategoryOptions().map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Location</label>
          <input name="location" defaultValue={profile.location} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Service Area / District</label>
          <input name="district" defaultValue={profile.district ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Availability</label>
          <input
            name="availability"
            defaultValue={profile.availability ?? ""}
            placeholder="e.g. Mon-Sat 9am-6pm"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Contact Details</label>
          <input name="phone" defaultValue={profile.phone} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Photo link</label>
          <input
            name="photoUrl"
            type="url"
            defaultValue={profile.photoUrl ?? ""}
            placeholder="https://… (a photo of you or your equipment)"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-ink-faint">Shown at the top of your card in the service directory.</p>
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea name="bio" defaultValue={profile.bio ?? ""} rows={3} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Ayushman Empanelment (Health Providers)</label>
          <select name="ayushmanStatus" defaultValue={profile.ayushmanStatus ?? ""} className={inputClass}>
            <option value="">Not applicable</option>
            {Object.entries(AYUSHMAN_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="border-t border-line-soft pt-4">
          <p className="mb-2 text-sm font-semibold text-ink">Payout details — where Kheti Sehat sends your payments (UPI or bank)</p>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Bank Account Number</label>
              <input name="bankAccountNumber" defaultValue={profile.bankAccountNumber ?? ""} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Bank IFSC</label>
              <input name="bankIfsc" defaultValue={profile.bankIfsc ?? ""} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>UPI ID</label>
              <input name="upiId" defaultValue={profile.upiId ?? ""} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>PAN Number</label>
              <input name="panNumber" defaultValue={profile.panNumber ?? ""} className={inputClass} />
            </div>
          </div>
        </div>
      </ActionForm>
    </div>
  );
}
