import { requireUser } from "@/lib/authz";
import { getProviderProfileForUser } from "@/lib/queries";
import { ActionForm } from "@/components/ui/ActionForm";
import { updateProviderProfile } from "@/actions/profile";
import { inputClass, labelClass } from "@/lib/ui";
import { AYUSHMAN_LABELS } from "@/lib/constants";
import { DELIVERY_METHOD_HINTS, DELIVERY_METHOD_LABELS, INDIAN_STATES } from "@/lib/agri-catalog";
import { StatTile } from "@/components/dashboard/DashboardShell";
import { ServiceFields } from "@/components/provider/ServiceFields";
import type { DeliveryMethod } from "@/generated/prisma/enums";

const sectionTitle = "border-t border-line-soft pt-5 font-display text-lg font-semibold text-ink";

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
        className="mt-6 max-w-2xl space-y-4 rounded-xl border border-line bg-surface p-5"
      >
        <div>
          <label className={labelClass}>Display Name</label>
          <input name="displayName" defaultValue={profile.displayName} required className={inputClass} />
        </div>

        <h2 className="font-display text-lg font-semibold text-ink">What you offer · आपकी सेवाएं</h2>
        <ServiceFields
          section={profile.section}
          agriCategory={profile.agriCategory}
          agriServices={profile.agriServices}
          otherService={profile.otherService}
          healthCategory={profile.healthCategory}
        />

        <h2 className={sectionTitle}>Where you work · सेवा क्षेत्र</h2>
        <div>
          <label className={labelClass}>Base location (village or town) *</label>
          <input name="location" defaultValue={profile.location} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>State *</label>
          <select name="serviceState" defaultValue={profile.serviceState ?? ""} required className={inputClass}>
            <option value="">Select state</option>
            {INDIAN_STATES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Districts you serve *</label>
          <input
            name="serviceDistricts"
            defaultValue={
              profile.serviceDistricts.length ? profile.serviceDistricts.join(", ") : (profile.district ?? "")
            }
            required
            placeholder="e.g. Gorakhpur, Deoria"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-ink-faint">Separate districts with commas.</p>
        </div>
        <div>
          <label className={labelClass}>Villages or pincodes served (optional)</label>
          <textarea
            name="serviceVillages"
            defaultValue={profile.serviceVillages.join(", ")}
            rows={2}
            placeholder="e.g. Campierganj, 273158, Pipraich"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-ink-faint">Separate with commas. Farmers can search by village or pincode.</p>
        </div>

        <fieldset>
          <legend className={labelClass}>How you deliver your service *</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(DELIVERY_METHOD_LABELS) as DeliveryMethod[]).map((m) => (
              <label
                key={m}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-line p-3 text-sm hover:bg-surface-2"
              >
                <input
                  type="checkbox"
                  name="deliveryMethods"
                  value={m}
                  defaultChecked={profile.deliveryMethods.includes(m)}
                  className="mt-0.5 h-4 w-4 accent-brand"
                />
                <span>
                  <span className="block font-medium text-ink">{DELIVERY_METHOD_LABELS[m]}</span>
                  <span className="text-xs text-ink-faint">{DELIVERY_METHOD_HINTS[m]}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <h2 className={sectionTitle}>Contact & profile</h2>
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

        <h2 className={sectionTitle}>Qualifications, licences & pricing</h2>
        <p className="-mt-2 text-xs text-ink-faint">
          Self-declared — shown to coordinators when they review your profile. Your verification status is set only
          by Kheti Sehat.
        </p>
        <div>
          <label className={labelClass}>Qualifications & experience</label>
          <textarea
            name="qualifications"
            defaultValue={profile.qualifications ?? ""}
            rows={2}
            maxLength={500}
            placeholder="e.g. B.Sc. Agriculture, 8 years in crop advisory; DGCA-certified drone pilot"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Licences / registration numbers</label>
          <textarea
            name="licences"
            defaultValue={profile.licences ?? ""}
            rows={2}
            maxLength={500}
            placeholder="e.g. Fertiliser dealer licence no., pesticide licence no., veterinary council registration"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Pricing</label>
          <input
            name="pricingNote"
            defaultValue={profile.pricingNote ?? ""}
            maxLength={300}
            placeholder="e.g. ₹500 per acre for drone spraying; soil test ₹300 per sample"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-ink-faint">Shown on your directory card as a guide. You still set the final price on each booking.</p>
        </div>
        <div className="rounded-lg border border-line bg-surface-2 p-3 text-sm">
          <span className="font-medium text-ink">Verification status: </span>
          {profile.verified ? (
            <span className="font-semibold text-status-active">Verified by Kheti Sehat</span>
          ) : (
            <span className="font-semibold text-status-pending">Pending review by a coordinator</span>
          )}
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
