import { RequestServiceButton } from "@/components/RequestServiceDialog";
import {
  AGRI_CATEGORY_LABELS,
  AYUSHMAN_LABELS,
  HEALTH_CATEGORY_LABELS,
} from "@/lib/constants";
import type { Role } from "@/generated/prisma/enums";
import type { ProviderProfileModel } from "@/generated/prisma/models";

export function ProviderCard({
  provider,
  viewerRole,
}: {
  provider: ProviderProfileModel;
  viewerRole: Role | null;
}) {
  const categoryLabel = provider.agriCategory
    ? AGRI_CATEGORY_LABELS[provider.agriCategory]
    : provider.healthCategory
      ? HEALTH_CATEGORY_LABELS[provider.healthCategory]
      : "General";

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <ProviderPhoto provider={provider} />

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-display text-xl font-bold leading-tight text-ink">{provider.displayName}</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-ink-soft">{categoryLabel}</span>
          {provider.ayushmanStatus === "EMPANELLED" && (
            <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-medium text-brand-deep">
              {AYUSHMAN_LABELS.EMPANELLED}
            </span>
          )}
        </div>

        {provider.bio && <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">{provider.bio}</p>}

        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-soft">{provider.location}</span>
            <span className="font-medium text-ink">
              {provider.ratingCount > 0 ? (
                <>
                  {provider.ratingAvg.toFixed(1)} <span className="text-marigold">★</span> ({provider.ratingCount})
                </>
              ) : (
                <span className="text-ink-faint">New provider</span>
              )}
            </span>
          </div>
          <div className="mt-4">
            <RequestServiceButton
              providerId={provider.id}
              providerName={provider.displayName}
              categoryLabel={categoryLabel}
              isHealth={provider.section === "HEALTH"}
              viewerRole={viewerRole}
              className="w-full rounded-lg bg-[#f29c11] px-4 py-3 text-base font-medium text-ink transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[#f29c11]/40"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** The provider's photo, or an initials tile until they've added one. */
function ProviderPhoto({ provider }: { provider: ProviderProfileModel }) {
  const box = "aspect-[16/10] w-full";
  if (provider.photoUrl) {
    return (
      // Provider photos come from arbitrary hosts, so a plain <img> rather than next/image.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={provider.photoUrl} alt={provider.displayName} loading="lazy" className={`${box} object-cover object-top`} />
    );
  }
  const initials = provider.displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const tone = provider.section === "HEALTH" ? "bg-marigold-light text-marigold" : "bg-brand-light text-brand";
  return (
    <div className={`${box} ${tone} flex items-center justify-center font-display text-5xl font-bold`} aria-hidden>
      {initials}
    </div>
  );
}
