import { auth } from "@/lib/auth";
import { listHealthProviders } from "@/lib/queries";
import { ProviderCard } from "@/components/ProviderCard";
import { DirectoryFilters } from "@/components/directory/DirectoryFilters";
import type { AyushmanStatus, HealthCategory } from "@/generated/prisma/enums";

export default async function HealthServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; location?: string; ayushman?: string }>;
}) {
  const sp = await searchParams;
  const [session, providers] = await Promise.all([
    auth(),
    listHealthProviders({
      category: (sp.category as HealthCategory) || undefined,
      location: sp.location || undefined,
      ayushman: (sp.ayushman as AyushmanStatus) || undefined,
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold">Health Services · स्वास्थ्य सेवाएं</h1>
      <p className="mt-1 text-ink-soft">Doctors, nurses, pharmacies, labs, physiotherapists and ambulances.</p>

      <div className="mt-6">
        <DirectoryFilters section="health" action="/health-services" values={sp} />
      </div>

      {providers.length === 0 ? (
        <p className="mt-8 text-ink-soft">No providers match those filters yet.</p>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} viewerRole={session?.user.role ?? null} />
          ))}
        </div>
      )}
    </div>
  );
}
