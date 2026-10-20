import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/site/PageHero";
import { AUTO_CONFIRM_HOURS } from "@/lib/constants";
import { SITE, digits } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact · Kheti Sehat",
  description: "Call, WhatsApp or email the Kheti Sehat team for help with bookings, payments or joining as a provider.",
};

const CHANNELS = [
  {
    icon: "📞",
    title: "Call us",
    hindi: "फ़ोन करें",
    value: SITE.phone,
    href: `tel:+${digits(SITE.phone)}`,
    note: SITE.hours,
  },
  {
    icon: "💬",
    title: "WhatsApp",
    hindi: "व्हाट्सऐप",
    value: SITE.whatsapp,
    href: `https://wa.me/${digits(SITE.whatsapp)}`,
    note: "Send a message or a voice note any time",
  },
  {
    icon: "✉️",
    title: "Email",
    hindi: "ईमेल",
    value: SITE.email,
    href: `mailto:${SITE.email}`,
    note: "We reply within one working day",
  },
];

const HELP_TOPICS = [
  {
    title: "Help with a booking",
    hindi: "बुकिंग में मदद",
    body: "Open your dashboard to see every booking, its price and its payment status.",
    link: { href: "/farmer/bookings", label: "My bookings" },
  },
  {
    title: "The work isn't right",
    hindi: "काम ठीक नहीं है",
    body: `Use Raise Concern on the booking — it goes straight to your provider to fix. You have ${AUTO_CONFIRM_HOURS} hours after they mark it done.`,
    link: { href: "/terms#concerns", label: "How concerns work" },
  },
  {
    title: "I want a refund",
    hindi: "पैसे वापस चाहिए",
    body: "Use Request Refund on the booking. A coordinator will call you and the provider and decide a fair refund.",
    link: { href: "/terms#payments", label: "Refund rules" },
  },
  {
    title: "Become a provider",
    hindi: "सेवा प्रदाता बनें",
    body: "Sign up as a Service Provider, add your services and payout details, and a coordinator will verify you.",
    link: { href: "/register?role=PROVIDER", label: "Sign up as a provider" },
  },
];

const FAQS = [
  {
    q: "Do I pay the provider directly?",
    a: "No. You pay Kheti Sehat online by UPI or card. We hold the money and pay the provider only after you confirm the work is done.",
  },
  {
    q: "What if I don't respond after the job is marked done?",
    a: `If you neither confirm, raise a concern, nor request a refund within ${AUTO_CONFIRM_HOURS} hours, the job is confirmed automatically and the provider is paid.`,
  },
  {
    q: "Is it free to use?",
    a: "Yes — browsing, requesting a service and creating an account are free for farmers. Providers pay a small platform fee on each completed job.",
  },
  {
    q: "Does Kheti Sehat handle emergencies?",
    a: "No. In a medical emergency, call 108 for a free government ambulance straight away.",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <PageHero eyebrow="Contact us · संपर्क करें" title="We're here to help" hindi="हम आपकी मदद के लिए हैं">
        Call, WhatsApp or email us — in Hindi or English. For anything about a specific booking, the fastest route is
        usually the buttons on the booking itself.
      </PageHero>

      {/* Channels */}
      <section className="relative z-10 -mt-8 grid gap-4 px-2 sm:px-6 md:grid-cols-3">
        {CHANNELS.map((c) => (
          <a
            key={c.title}
            href={c.href}
            className="group rounded-2xl border border-line bg-surface p-6 shadow-lg shadow-ink/5 transition hover:-translate-y-0.5 hover:border-brand"
          >
            <span className="text-3xl">{c.icon}</span>
            <p className="mt-3 font-display text-lg font-semibold text-brand-deep">{c.title}</p>
            <p className="text-xs text-marigold">{c.hindi}</p>
            <p className="mt-3 break-all font-semibold text-ink group-hover:text-brand">{c.value}</p>
            <p className="mt-1 text-sm text-ink-soft">{c.note}</p>
          </a>
        ))}
      </section>

      {/* Emergency */}
      <a
        href="tel:108"
        className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-status-danger bg-status-danger-bg px-6 py-4 transition-colors hover:bg-status-danger hover:text-white"
      >
        <span>
          <span className="font-display text-lg font-bold">Medical emergency? Call 108</span>
          <span className="block text-sm">आपातकाल में तुरंत 108 पर फ़ोन करें — free government ambulance</span>
        </span>
        <span className="rounded-full bg-[#d93a2b] px-5 py-2 font-semibold text-white">Call 108</span>
      </a>

      {/* What do you need? */}
      <section className="mt-14">
        <p className="text-xs font-semibold uppercase tracking-wide text-marigold">Quick help · जल्दी मदद</p>
        <h2 className="mt-2 font-display text-3xl font-bold">What do you need help with?</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {HELP_TOPICS.map((t) => (
            <div key={t.title} className="flex flex-col rounded-2xl border border-line bg-surface p-6">
              <p className="font-display text-lg font-semibold text-brand-deep">{t.title}</p>
              <p className="text-xs text-marigold">{t.hindi}</p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{t.body}</p>
              <Link href={t.link.href} className="mt-4 text-sm font-semibold text-brand hover:text-brand-deep">
                {t.link.label} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Office + FAQ */}
      <section className="mt-14 grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <div className="rounded-[1.75rem] bg-brand-deep p-8 text-white sm:p-10">
          <h2 className="font-display text-2xl font-bold">Visit or write to us</h2>
          <p className="text-sm text-[#ffd9a0]">कार्यालय</p>
          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="text-white/60">Office</dt>
              <dd className="mt-0.5 text-base">{SITE.address}</dd>
            </div>
            <div>
              <dt className="text-white/60">Hours</dt>
              <dd className="mt-0.5 text-base">{SITE.hours}</dd>
            </div>
            <div>
              <dt className="text-white/60">Districts we cover</dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {SITE.serviceArea.map((d) => (
                  <span key={d} className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/20">
                    {d}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold">Common questions</h2>
          <div className="mt-4 divide-y divide-line rounded-2xl border border-line bg-surface">
            {FAQS.map((f) => (
              <details key={f.q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {f.q}
                  <span className="text-xl text-brand transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
