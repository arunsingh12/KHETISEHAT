import { ActionForm } from "@/components/ui/ActionForm";
import { inputClass, labelClass } from "@/lib/ui";
import { AYUSHMAN_LABELS } from "@/lib/constants";
import { DELIVERY_METHOD_HINTS, DELIVERY_METHOD_LABELS, INDIAN_STATES } from "@/lib/agri-catalog";
import { ServiceFields } from "@/components/provider/ServiceFields";
import { PhotoUpload } from "@/components/provider/PhotoUpload";
import type { DeliveryMethod } from "@/generated/prisma/enums";
import type { ProviderProfileModel } from "@/generated/prisma/models";
import type { ActionResult } from "@/lib/types";

const sectionTitle = "border-t border-line-soft pt-5 font-display text-lg font-semibold text-ink";

/**
 * The full provider profile form — used by the provider on Account Settings
 * and by admins/coordinators editing a provider from Farmers & Providers.
 * `hidden` carries extra fields such as the target userId for staff edits.
 */
export function ProviderProfileForm({
  profile,
  action,
  hidden,
  submitLabel = "Save Profile",
}: {
  profile: ProviderProfileModel;
  action: (prevState: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  hidden?: Record<string, string>;
  submitLabel?: string;
}) {
  return (
    <ActionForm
      action={action}
      submitLabel={submitLabel}
      pendingLabel="Saving…"
      resetOnSuccess={false}
      successMessage="Profile saved"
      className="mt-6 max-w-2xl space-y-4 rounded-xl border border-line bg-surface p-5"
    >
      {hidden && Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
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
      <PhotoUpload initialUrl={profile.photoUrl} name={profile.displayName} />
      <div>
        <label className={labelClass}>Description</label>
        <textarea name="bio" defaultValue={profile.bio ?? ""} rows={6} className={inputClass} />
        <p className="mt-1 text-xs text-ink-faint">Line breaks, headings and bullet points are kept on your profile.</p>
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
        <textarea
          name="pricingNote"
          defaultValue={profile.pricingNote ?? ""}
          maxLength={1000}
          rows={4}
          placeholder={"e.g.\nDrone spraying — ₹500 per acre\nSoil test — ₹300 per sample"}
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
  );
}
