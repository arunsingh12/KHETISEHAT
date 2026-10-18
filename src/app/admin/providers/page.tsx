import { getAllProviders } from "@/lib/queries";
import { verifyProvider } from "@/actions/profile";
import { RatingStars } from "@/components/RatingStars";
import { Badge } from "@/components/ui/Badge";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { CommissionDialog } from "@/components/admin/CommissionDialog";
import { AGRI_CATEGORY_LABELS, HEALTH_CATEGORY_LABELS, SECTION_LABELS } from "@/lib/constants";

export default async function AdminProvidersPage() {
  const providers = await getAllProviders();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Providers</h1>
      <p className="mt-1 text-ink-soft">Verify providers and set each one&apos;s platform commission rate.</p>

      <div className="mt-5 space-y-2">
        {providers.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{p.displayName}</p>
                {p.verified ? <Badge tone="active">Verified</Badge> : <Badge tone="pending">Unverified</Badge>}
                {p.ratingCount > 0 && p.ratingAvg < 3 && <Badge tone="danger">Low-Rated</Badge>}
              </div>
              <p className="text-sm text-ink-soft">
                {SECTION_LABELS[p.section]} ·{" "}
                {p.agriCategory ? AGRI_CATEGORY_LABELS[p.agriCategory] : p.healthCategory ? HEALTH_CATEGORY_LABELS[p.healthCategory] : ""}{" "}
                · {p.location}
              </p>
              <RatingStars value={p.ratingAvg} count={p.ratingCount} size="sm" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CommissionDialog providerId={p.id} currentRate={p.commissionRate} />
              <form action={verifyProvider}>
                <input type="hidden" name="providerId" value={p.id} />
                <input type="hidden" name="verified" value={(!p.verified).toString()} />
                <SubmitButton variant={p.verified ? "secondary" : "primary"} pendingText="Saving…">
                  {p.verified ? "Unverify" : "Verify"}
                </SubmitButton>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
