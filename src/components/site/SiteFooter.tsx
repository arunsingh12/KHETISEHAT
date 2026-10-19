import Image from "next/image";
import Link from "next/link";

import { SITE, digits } from "@/lib/site";

const COLUMNS = [
  {
    title: "Services",
    hindi: "सेवाएं",
    links: [
      { href: "/agri-services", label: "Agri services" },
      { href: "/health-services", label: "Health services" },
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#providers", label: "Find a provider" },
    ],
  },
  {
    title: "Company",
    hindi: "कंपनी",
    links: [
      { href: "/about", label: "About us" },
      { href: "/contact", label: "Contact us" },
      { href: "/register?role=PROVIDER", label: "Become a provider" },
      { href: "/login", label: "Log in" },
    ],
  },
  {
    title: "Legal",
    hindi: "नियम",
    links: [
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms#payments", label: "Payments & refunds" },
    ],
  },
];

/** Full footer for public pages. Dashboards get the slim line instead (see FooterGate). */
export function SiteFooter() {
  return (
    <footer className="mt-16 bg-brand-deep text-white">
      {/* The two halves of the name, as in the home banner */}
      <div className="grid h-1.5 grid-cols-2" aria-hidden>
        <span className="bg-[#7fae5c]" />
        <span className="bg-[#f3b94d]" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-flex rounded-xl bg-white p-2">
            <Image src="/logo.jpg" alt="Kheti Sehat" width={192} height={96} className="h-12 w-auto" />
          </Link>
          <p className="mt-4 font-display text-xl font-bold">
            <span className="text-[#bfe3a0]">खेती</span> <span className="text-[#f3b94d]">+</span>{" "}
            <span className="text-[#ffd9a0]">सेहत</span>
          </p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/75">
            {SITE.tagline}. Verified providers, payments held safely until you confirm the work.
          </p>
          <div className="mt-5 space-y-1.5 text-sm">
            <a href={`tel:${digits(SITE.phone)}`} className="block text-white/90 hover:text-white">
              📞 {SITE.phone}
            </a>
            <a href={`mailto:${SITE.email}`} className="block text-white/90 hover:text-white">
              ✉️ {SITE.email}
            </a>
            <p className="text-white/70">📍 {SITE.address}</p>
          </div>
          <a
            href="tel:108"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#d93a2b] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:brightness-95"
          >
            Emergency ambulance · 108
          </a>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="font-display text-base font-semibold">{col.title}</p>
            <p className="text-xs text-[#f3b94d]">{col.hindi}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/75 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} {SITE.name} · {SITE.nameHindi}. All rights reserved.
          </p>
          <p>Serving {SITE.serviceArea.join(" · ")}</p>
        </div>
      </div>
    </footer>
  );
}
