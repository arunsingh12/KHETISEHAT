import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/site/PageHero";
import { AUTO_CONFIRM_HOURS } from "@/lib/constants";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About · Kheti Sehat",
  description: "Why Kheti Sehat exists and how it keeps agri and health services in rural Uttar Pradesh fair and safe.",
};

const HALVES = [
  {
    word: "खेती",
    title: "Kheti — for the farm",
    tone: "bg-brand text-white",
    accent: "text-[#bfe3a0]",
    body: "Drone spraying, tractor and equipment rental, soil testing, agronomist visits and solar pump services — booked from your phone, from people who are verified.",
    items: ["Drone services", "Equipment rental", "Soil testing", "Agronomists", "Solar services"],
  },
  {
    word: "सेहत",
    title: "Sehat — for the family",
    tone: "bg-marigold-light text-ink",
    accent: "text-marigold",
    body: "Doctors and nurses for home visits, pathology labs, pharmacies, physiotherapists and ambulances — with Ayushman Bharat card status made clear up front.",
    items: ["Doctors & nurses", "Pathology labs", "Pharmacy", "Physiotherapy", "Ambulance"],
  },
];

const PROMISES = [
  {
    title: "Every provider is verified",
    hindi: "हर प्रदाता सत्यापित",
    body: "A Kheti Sehat coordinator checks each provider before they appear in the directory.",
  },
  {
    title: "Your money waits with us",
    hindi: "पैसा हमारे पास सुरक्षित",
    body: "You pay Kheti Sehat, not the provider. The provider is paid only after you confirm the work.",
  },
  {
    title: "Time to check the work",
    hindi: "काम जाँचने का समय",
    body: `You get ${AUTO_CONFIRM_HOURS} hours to confirm, ask the provider to fix something, or request a refund.`,
  },
  {
    title: "A real person in the middle",
    hindi: "बीच में एक भरोसेमंद व्यक्ति",
    body: "If something goes wrong, a coordinator calls both sides and settles it fairly — full, partial or no refund.",
  },
];

const VALUES = [
  { title: "Fair prices", body: "Prices are agreed before you pay, and our fee is shown openly to providers." },
  { title: "Bilingual by default", body: "Hindi and English side by side, so nobody is left out by language." },
  { title: "Phone-first", body: "Built for basic smartphones and patchy networks, with SMS updates at every step." },
  { title: "Local first", body: "We grow district by district, with coordinators who know the villages they serve." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <PageHero eyebrow="About us · हमारे बारे में" title="One trusted friend for the farm and the family" hindi="खेत और परिवार — दोनों के लिए एक भरोसेमंद साथी">
        Kheti Sehat connects families in rural Uttar Pradesh with verified agri and health service providers — and
        holds the payment safely until the job is done right.
      </PageHero>

      {/* Why */}
      <section className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-marigold">Why we started · क्यों</p>
          <h2 className="mt-2 font-display text-3xl font-bold">Good help shouldn&apos;t be hard to find</h2>
        </div>
        <div className="space-y-4 text-lg leading-relaxed text-ink-soft">
          <p>
            In much of rural India, finding a drone operator for spraying, a soil test before sowing, or a doctor who
            will visit an elderly parent still means asking around, travelling far, and paying in advance to someone
            you&apos;ve never met.
          </p>
          <p>
            Kheti Sehat puts verified providers in one place, agrees the price before any money moves, and keeps that
            money safe with us until you say the work is done. Farm and health — <em>kheti</em> and <em>sehat</em> —
            are the two things every rural household depends on, so we look after both.
          </p>
        </div>
      </section>

      {/* Two halves */}
      <section className="mt-14 grid overflow-hidden rounded-[1.75rem] md:grid-cols-2">
        {HALVES.map((h) => (
          <div key={h.word} className={`${h.tone} p-8 sm:p-10`}>
            <p className={`font-display text-5xl font-bold ${h.accent}`}>{h.word}</p>
            <h3 className="mt-3 font-display text-xl font-semibold">{h.title}</h3>
            <p className="mt-2 leading-relaxed opacity-90">{h.body}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {h.items.map((item) => (
                <li key={item} className="rounded-full bg-white/80 px-3 py-1 text-sm font-medium text-ink">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Promises */}
      <section className="mt-14">
        <p className="text-xs font-semibold uppercase tracking-wide text-marigold">Our promise · हमारा वादा</p>
        <h2 className="mt-2 font-display text-3xl font-bold">How we keep every booking safe</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map((p, i) => (
            <div key={p.title} className="rounded-2xl border border-line bg-surface p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand font-display font-bold text-white">
                {i + 1}
              </span>
              <p className="mt-4 font-display text-lg font-semibold text-brand-deep">{p.title}</p>
              <p className="text-xs text-marigold">{p.hindi}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values + where */}
      <section className="mt-14 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[1.75rem] bg-surface-2 p-8 sm:p-10">
          <h2 className="font-display text-2xl font-bold">What we care about</h2>
          <dl className="mt-6 grid gap-6 sm:grid-cols-2">
            {VALUES.map((v) => (
              <div key={v.title}>
                <dt className="font-display font-semibold text-brand-deep">{v.title}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-ink-soft">{v.body}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="rounded-[1.75rem] border border-line bg-surface p-8 sm:p-10">
          <h2 className="font-display text-2xl font-bold">Where we work</h2>
          <p className="text-sm text-marigold">हमारा सेवा क्षेत्र</p>
          <ul className="mt-5 space-y-2">
            {SITE.serviceArea.map((d) => (
              <li key={d} className="flex items-center gap-3 text-ink">
                <span className="h-2.5 w-2.5 rounded-full bg-brand" />
                {d}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-ink-soft">More districts are coming. Want us in yours? Tell us.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-14 grid gap-4 rounded-[1.75rem] bg-brand-deep p-8 text-white sm:p-10 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h2 className="font-display text-2xl font-bold">Ready to book, or to offer your services?</h2>
          <p className="mt-1 text-white/80">Joining is free for farmers and providers.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/#providers" className="rounded-full bg-[#f3b94d] px-6 py-3 font-semibold text-ink hover:bg-[#f7c868]">
            Find a service
          </Link>
          <Link href="/contact" className="rounded-full border border-white/60 px-6 py-3 font-semibold hover:bg-white/10">
            Contact us
          </Link>
        </div>
      </section>
    </div>
  );
}
