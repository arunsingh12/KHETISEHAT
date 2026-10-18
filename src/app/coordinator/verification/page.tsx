import { getLowRatedProviders, getUnverifiedProviders } from "@/lib/queries";
import { verifyProvider } from "@/actions/profile";
import { RatingStars } from "@/components/RatingStars";
import { Badge } from "@/components/ui/Badge";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { AGRI_CATEGORY_LABELS, HEALTH_CATEGORY_LABELS } from "@/lib/constants";

export default async function ProviderVerificationPage() {
  const [unverified, lowRated] = await Promise.all([getUnverifiedProviders(), getLowRatedProviders()]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Provider Verification Queue</h1>

      <h2 className="mt-6 font-display text-lg font-semibold">Pending Verification</h2>
      {unverified.length === 0 ? (
        <p className="mt-2 text-ink-soft">Nothing waiting on review.</p>
      ) : (
        <div className="mt-2 space-y-2">
          {unverified.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-line bg-surface p-4">
              <div>
                <p className="font-medium">{p.displayName}</p>
                <p className="text-sm text-ink-soft">
                  {p.agriCategory ? AGRI_CATEGORY_LABELS[p.agriCategory] : p.healthCategory ? HEALTH_CATEGORY_LABELS[p.healthCategory] : ""} · {p.location}
                </p>
              </div>
              <form action={verifyProvider}>
                <input type="hidden" name="providerId" value={p.id} />
                <input type="hidden" name="verified" value="true" />
                <SubmitButton variant="primary" pendingText="Verifying…">
                  Verify
                </SubmitButton>
              </form>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-8 font-display text-lg font-semibold">Low-Rated Providers</h2>
      {lowRated.length === 0 ? (
        <p className="mt-2 text-ink-soft">No providers currently flagged.</p>
      ) : (
        <div className="mt-2 space-y-2">
          {lowRated.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-line bg-surface p-4">
              <div>
                <p className="font-medium">{p.displayName}</p>
                <p className="text-sm text-ink-soft">
                  {p.agriCategory ? AGRI_CATEGORY_LABELS[p.agriCategory] : p.healthCategory ? HEALTH_CATEGORY_LABELS[p.healthCategory] : ""} · {p.location}
                </p>
                <RatingStars value={p.ratingAvg} count={p.ratingCount} size="sm" />
              </div>
              <Badge tone="danger">Low-Rated</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
