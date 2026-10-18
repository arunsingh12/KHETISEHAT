import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

import { auth } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { listAgriProviders, listHealthProviders } from "@/lib/queries";
import { ProviderCard } from "@/components/ProviderCard";
import { DirectoryFilters } from "@/components/directory/DirectoryFilters";
import { HeroArt } from "@/components/directory/HeroArt";
import type { AgriCategory, AyushmanStatus, HealthCategory } from "@/generated/prisma/enums";

// A real photo at public/hero.jpg replaces the illustrated stand-in.
const HAS_HERO_PHOTO = fs.existsSync(path.join(process.cwd(), "public", "hero.jpg"));

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; category?: string; location?: string; ayushman?: string }>;
}) {
  const sp = await searchParams;
  const tab = sp.tab === "health" ? "health" : "agri";

  const [{ t }, session, providers] = await Promise.all([
    getDictionary(),
    auth(),
    tab === "health"
      ? listHealthProviders({
          category: (sp.category as HealthCategory) || undefined,
          location: sp.location || undefined,
          ayushman: (sp.ayushman as AyushmanStatus) || undefined,
        })
      : listAgriProviders({
          category: (sp.category as AgriCategory) || undefined,
          location: sp.location || undefined,
        }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <section className="grid items-center gap-8 overflow-hidden rounded-[1.75rem] bg-brand p-6 text-white sm:p-10 md:grid-cols-[1.35fr_1fr] md:gap-10">
        <div>
          {/* The greeting stays in Hindi in both languages, as on the original site. */}
          <h1 className="font-display text-3xl font-bold leading-tight sm:text-5xl">{dictionaries.hi.home.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-white/95 sm:text-2xl">{t.home.subtitle}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full bg-[#f29c11] px-4 py-1.5 text-sm font-semibold text-ink">
              {dictionaries.hi.home.badgeVerified}
            </span>
            <span className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-ink">
              {t.home.badgeAyushman}
            </span>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl bg-white/10">
          {HAS_HERO_PHOTO ? (
            <Image
              src="/hero.jpg"
              alt="Farm fields"
              width={1200}
              height={680}
              priority
              className="aspect-[16/9] h-full w-full object-cover"
            />
          ) : (
            <HeroArt className="aspect-[16/9] h-full w-full" />
          )}
        </div>
      </section>

      <section id="providers" className="mt-10 scroll-mt-4">
        <div className="flex flex-wrap gap-3">
          <TabLink href="/?tab=agri#providers" active={tab === "agri"}>
            Agri Services / कृषि सेवाएं
          </TabLink>
          <TabLink href="/?tab=health#providers" active={tab === "health"}>
            Health Services / स्वास्थ्य सेवाएं
          </TabLink>
        </div>

        <div className="mt-8">
          <DirectoryFilters
            key={tab}
            section={tab}
            action="/#providers"
            values={sp}
            hidden={{ tab }}
          />
        </div>

        {providers.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-line bg-surface p-6 text-ink-soft">
            No providers match those filters yet — try another category or location.
          </p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} viewerRole={session?.user.role ?? null} />
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-sm text-ink-soft">
          Looking for a hospital?{" "}
          <Link href="/hospitals" className="font-medium text-brand hover:text-brand-deep">
            Find nearby hospitals &amp; Ayushman empanelment →
          </Link>
        </p>
      </section>
    </div>
  );
}

function TabLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={clsx(
        "rounded-full border px-6 py-3 text-base font-medium transition-colors sm:text-lg",
        active
          ? "border-brand bg-brand text-white shadow-sm"
          : "border-line bg-surface-2 text-ink-soft hover:border-brand hover:text-brand",
      )}
    >
      {children}
    </Link>
  );
}
