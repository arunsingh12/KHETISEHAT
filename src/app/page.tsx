import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

import { auth } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { listAgriProviders, listHealthProviders } from "@/lib/queries";
import { AUTO_CONFIRM_HOURS, DEFAULT_COMMISSION_RATE } from "@/lib/constants";
import { ProviderCard } from "@/components/ProviderCard";
import { DirectoryFilters } from "@/components/directory/DirectoryFilters";
import { HeroArt } from "@/components/directory/HeroArt";
import { WorkflowTabs } from "@/components/home/WorkflowTabs";
import type { AgriCategory, AyushmanStatus, HealthCategory } from "@/generated/prisma/enums";

// A real photo at public/hero.jpg replaces the illustrated stand-in.
const HAS_HERO_PHOTO = fs.existsSync(path.join(process.cwd(), "public", "hero.jpg"));

const TRUST_POINTS = [
  { title: "Verified providers", hindi: "सत्यापित सेवा प्रदाता", body: "Every provider is checked by a Kheti Sehat coordinator before they appear here." },
  { title: "Your money is safe", hindi: "आपका पैसा सुरक्षित", body: "You pay Kheti Sehat, not the provider. They're paid only after you confirm the work." },
  { title: `${AUTO_CONFIRM_HOURS}-hour window`, hindi: "जाँचने का समय", body: `You get ${AUTO_CONFIRM_HOURS} hours to check the work, raise a concern, or ask for a refund.` },
  { title: "Ayushman Bharat", hindi: "आयुष्मान भारत", body: "Find health providers who accept Ayushman cards, and tell them your card status." },
];

const FARMER_STEPS = [
  { title: "Find a provider", hindi: "सेवा खोजें", body: "Browse verified Agri and Health providers below. Filter by service, location, or Ayushman card." },
  { title: "Request the service", hindi: "अनुरोध भेजें", body: "Tap Request Service, describe what you need and pick a preferred date. Free to ask." },
  { title: "Get a price", hindi: "कीमत पाएं", body: "The provider (or a coordinator) reviews your request and sets a fair price. You'll get an SMS." },
  { title: "Pay Kheti Sehat", hindi: "सुरक्षित भुगतान", body: "Pay online by UPI or card. Kheti Sehat holds the money — the provider is told to start.", tag: "Money held safely" },
  { title: "Check the work", hindi: "काम जाँचें", body: "When the provider marks the job done: confirm it, raise a concern so they fix it, or request a refund.", tag: `${AUTO_CONFIRM_HOURS}h to respond` },
  { title: "Done & rate", hindi: "पूरा करें, रेटिंग दें", body: "Kheti Sehat pays the provider and you rate them — helping every farmer choose well." },
];

const PROVIDER_STEPS = [
  { title: "Sign up as a provider", hindi: "पंजीकरण करें", body: "Create a free account, choose Service Provider, and fill in your services, area and availability." },
  { title: "Get verified", hindi: "सत्यापन", body: "A coordinator verifies you. Add your UPI ID or bank details so we can pay you.", tag: "Shown publicly once verified" },
  { title: "Receive requests", hindi: "अनुरोध पाएं", body: "Farmers request your service from your card. You get an SMS and see it on your dashboard." },
  { title: "Set your price", hindi: "कीमत तय करें", body: "Review the job and set your charge. Start only once the farmer has paid — the app tells you." },
  { title: "Do the work", hindi: "काम पूरा करें", body: "Mark it In Progress, then Work Complete. If the farmer raises a concern, fix it and resubmit." },
  { title: "Get paid", hindi: "भुगतान पाएं", body: `Once the farmer confirms, Kheti Sehat sends your payout by UPI or bank, minus a ${DEFAULT_COMMISSION_RATE}% platform fee.`, tag: "Direct to your account" },
];

const ROLES = [
  { title: "Farmer / Requester", hindi: "किसान", body: "Books agri and health services, pays safely, confirms the work." },
  { title: "Service Provider", hindi: "सेवा प्रदाता", body: "Drone operators, agronomists, doctors, labs, ambulances and more." },
  { title: "Coordinator", hindi: "समन्वयक", body: "Verifies providers, helps with bookings, and settles refund requests fairly." },
  { title: "Kheti Sehat Admin", hindi: "प्रशासक", body: "Holds payments, pays providers, and keeps the platform running." },
];

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
  const loggedIn = Boolean(session?.user);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {/* ---------- Hero ---------- */}
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
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#providers"
              className="rounded-full bg-white px-6 py-3 font-semibold text-brand-deep transition-colors hover:bg-brand-light"
            >
              Find a service
            </Link>
            <Link
              href="#how-it-works"
              className="rounded-full border border-white/70 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
            >
              How it works
            </Link>
            {!loggedIn && (
              <Link
                href="/register?role=PROVIDER"
                className="rounded-full px-2 py-3 font-semibold text-white underline-offset-4 hover:underline"
              >
                Join as a provider →
              </Link>
            )}
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

      {/* ---------- Trust strip ---------- */}
      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_POINTS.map((p) => (
          <div key={p.title} className="rounded-2xl border border-line bg-surface p-5">
            <p className="font-display text-base font-semibold text-brand-deep">{p.title}</p>
            <p className="text-xs text-marigold">{p.hindi}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{p.body}</p>
          </div>
        ))}
      </section>

      {/* ---------- How it works ---------- */}
      <section id="how-it-works" className="mt-16 scroll-mt-4">
        <SectionHeading eyebrow="How Kheti Sehat works · यह कैसे काम करता है" title="From request to payment, step by step" />
        <div className="mt-6">
          <WorkflowTabs
            journeys={[
              {
                key: "farmer",
                label: "For Farmers",
                hindi: "किसानों के लिए",
                intro:
                  "Book a trusted provider for your farm or your family's health. You only pay once there's a price, and the provider is only paid once you're happy.",
                steps: FARMER_STEPS,
                cta: loggedIn
                  ? { href: "#providers", label: "Find a provider now" }
                  : { href: "/register?role=FARMER", label: "Sign up as a farmer" },
              },
              {
                key: "provider",
                label: "For Providers",
                hindi: "सेवा प्रदाताओं के लिए",
                intro:
                  "Reach farmers across your district. Kheti Sehat brings you requests, collects payment up front, and pays you directly when the job is confirmed.",
                steps: PROVIDER_STEPS,
                cta: loggedIn
                  ? { href: "/dashboard", label: "Go to your dashboard" }
                  : { href: "/register?role=PROVIDER", label: "Sign up as a provider" },
              },
            ]}
          />
        </div>
      </section>

      {/* ---------- Money flow ---------- */}
      <section className="mt-16 rounded-[1.75rem] bg-surface-2 p-6 sm:p-10">
        <SectionHeading eyebrow="Safe payments · सुरक्षित भुगतान" title="Where your money goes" />

        <div className="mt-8 grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <FlowNode step="1" title="Farmer pays" body="Pays the agreed price online to Kheti Sehat." />
          <FlowArrow />
          <FlowNode
            step="2"
            title="Kheti Sehat holds it"
            body="The money waits safely while the provider does the work."
            highlight
          />
          <FlowArrow />
          <FlowNode
            step="3"
            title="Provider is paid"
            body={`After the farmer confirms (or ${AUTO_CONFIRM_HOURS}h pass), the provider gets the price minus the ${DEFAULT_COMMISSION_RATE}% platform fee.`}
          />
        </div>

        <p className="mt-8 font-display text-lg font-semibold">Not happy with the work? You have two options:</p>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <span className="rounded-full bg-status-pending-bg px-3 py-1 text-xs font-semibold text-status-pending">
              Raise Concern · शिकायत करें
            </span>
            <p className="mt-3 font-medium">Goes straight to the provider</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              Tell the provider what needs fixing. They check the work, fix it and resubmit — then you confirm again.
              Your payment stays on hold the whole time.
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-5">
            <span className="rounded-full bg-status-danger-bg px-3 py-1 text-xs font-semibold text-status-danger">
              Request Refund · रिफंड माँगें
            </span>
            <p className="mt-3 font-medium">Goes to a Kheti Sehat coordinator</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              A coordinator calls you and the provider, hears both sides, and decides a fair split — full refund,
              partial refund, or full payment to the provider.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Who's involved ---------- */}
      <section className="mt-16">
        <SectionHeading eyebrow="Who's involved · कौन-कौन" title="Four roles, one trusted platform" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((r) => (
            <div key={r.title} className="rounded-2xl border border-line bg-surface p-5">
              <p className="font-display text-base font-semibold">{r.title}</p>
              <p className="text-xs text-marigold">{r.hindi}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Provider directory ---------- */}
      <section id="providers" className="mt-16 scroll-mt-4">
        <SectionHeading eyebrow="Find a provider · सेवा प्रदाता खोजें" title="Verified providers near you" />
        <div className="mt-6 flex flex-wrap gap-3">
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
      </section>

      {/* ---------- Closing CTA ---------- */}
      {!loggedIn && (
        <section className="mt-16 grid gap-4 rounded-[1.75rem] bg-brand-deep p-6 text-white sm:p-10 md:grid-cols-2">
          <div>
            <p className="font-display text-2xl font-bold">Need a service?</p>
            <p className="mt-2 text-white/85">Sign up free and book a verified provider in minutes.</p>
            <Link
              href="/register?role=FARMER"
              className="mt-5 inline-block rounded-full bg-white px-6 py-3 font-semibold text-brand-deep hover:bg-brand-light"
            >
              Sign up as a farmer
            </Link>
          </div>
          <div className="md:border-l md:border-white/20 md:pl-8">
            <p className="font-display text-2xl font-bold">Offer a service?</p>
            <p className="mt-2 text-white/85">Get verified, receive requests, and get paid safely through Kheti Sehat.</p>
            <Link
              href="/register?role=PROVIDER"
              className="mt-5 inline-block rounded-full bg-marigold px-6 py-3 font-semibold text-white hover:bg-[#b06812]"
            >
              Sign up as a provider
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-marigold">{eyebrow}</p>
      <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">{title}</h2>
    </div>
  );
}

function FlowNode({
  step,
  title,
  body,
  highlight,
}: {
  step: string;
  title: string;
  body: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl border p-5",
        highlight ? "border-brand bg-brand text-white" : "border-line bg-surface",
      )}
    >
      <p className={clsx("text-xs font-semibold uppercase tracking-wide", highlight ? "text-white/80" : "text-marigold")}>
        Step {step}
      </p>
      <p className="mt-1 font-display text-lg font-semibold">{title}</p>
      <p className={clsx("mt-1 text-sm leading-relaxed", highlight ? "text-white/90" : "text-ink-soft")}>{body}</p>
    </div>
  );
}

function FlowArrow() {
  return (
    <div aria-hidden className="flex items-center justify-center text-2xl text-brand">
      <span className="md:hidden">↓</span>
      <span className="hidden md:inline">→</span>
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
