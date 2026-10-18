import { auth } from "@/lib/auth";
import { listAgriProviders } from "@/lib/queries";
import { ProviderCard } from "@/components/ProviderCard";
import { DirectoryFilters } from "@/components/directory/DirectoryFilters";
import type { AgriCategory } from "@/generated/prisma/enums";

export default async function AgriServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; location?: string }>;
}) {
  const sp = await searchParams;
  const [session, providers] = await Promise.all([
    auth(),
    listAgriProviders({
      category: (sp.category as AgriCategory) || undefined,
      location: sp.location || undefined,
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold">Agri Services · कृषि सेवाएं</h1>
      <p className="mt-1 text-ink-soft">Verified drone, equipment, agronomy, soil testing and solar providers.</p>

      <div className="mt-6">
        <DirectoryFilters section="agri" action="/agri-services" values={sp} />
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
