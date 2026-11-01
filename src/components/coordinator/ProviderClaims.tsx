import { AGRI_CATEGORY_LABELS, HEALTH_CATEGORY_LABELS } from "@/lib/constants";
import { DELIVERY_METHOD_LABELS, OTHER_SERVICE_ID, agriServiceLabel } from "@/lib/agri-catalog";
import type { ProviderProfileModel } from "@/generated/prisma/models";

/**
 * Everything a provider has declared about themselves — what a coordinator
 * checks before verifying. Shown as claims, not as verified facts.
 */
export function ProviderClaims({ provider: p }: { provider: ProviderProfileModel }) {
  const category = p.agriCategory
    ? AGRI_CATEGORY_LABELS[p.agriCategory]
    : p.healthCategory
      ? HEALTH_CATEGORY_LABELS[p.healthCategory]
      : "No category yet";
  const services = p.agriServices.map((id) =>
    id === OTHER_SERVICE_ID ? `Other: ${p.otherService ?? "—"}` : agriServiceLabel(id),
  );
  const rows: [string, string][] = [
    ["Category", category],
    ["Services", services.join(", ") || "—"],
    ["Base location", p.location || "—"],
    ["Area", [p.serviceDistricts.join(", "), p.serviceState].filter(Boolean).join(" · ") || "—"],
    ["Villages / pincodes", p.serviceVillages.join(", ") || "—"],
    ["Delivery", p.deliveryMethods.map((m) => DELIVERY_METHOD_LABELS[m]).join(", ") || "—"],
    ["Qualifications", p.qualifications ?? "—"],
    ["Licences", p.licences ?? "—"],
    ["Pricing", p.pricingNote ?? "—"],
    ["Phone", p.phone || "—"],
  ];

  return (
    <dl className="mt-2 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[9rem_1fr]">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-ink-faint">{label}</dt>
          <dd className="whitespace-pre-line text-ink-soft">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
