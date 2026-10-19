import Link from "next/link";

import { PageHero } from "@/components/site/PageHero";
import { SITE } from "@/lib/site";

export type LegalSection = { id: string; title: string; body: React.ReactNode };

/** Shared layout for Terms and Privacy: hero, sticky contents list, numbered sections. */
export function LegalPage({
  eyebrow,
  title,
  hindi,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  hindi: string;
  intro: React.ReactNode;
  sections: LegalSection[];
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <PageHero eyebrow={eyebrow} title={title} hindi={hindi}>
        <span className="text-base text-white/75">Last updated {SITE.legalUpdated}</span>
      </PageHero>

      <div className="mt-10 grid gap-10 lg:grid-cols-[16rem_1fr]">
        <nav aria-label="Contents" className="lg:sticky lg:top-6 lg:h-fit">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">On this page</p>
          <ol className="mt-3 space-y-1 border-l-2 border-line">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="-ml-0.5 block border-l-2 border-transparent py-1 pl-4 text-sm text-ink-soft transition-colors hover:border-brand hover:text-brand"
                >
                  {i + 1}. {s.title}
                </a>
              </li>
            ))}
          </ol>
          <div className="mt-6 rounded-2xl bg-marigold-light p-4 text-sm">
            <p className="font-semibold text-ink">Questions?</p>
            <p className="mt-1 text-ink-soft">
              Write to <a href={`mailto:${SITE.email}`} className="font-medium text-brand">{SITE.email}</a> or see{" "}
              <Link href="/contact" className="font-medium text-brand">
                Contact us
              </Link>
              .
            </p>
          </div>
        </nav>

        <article className="max-w-3xl">
          <div className="rounded-2xl border border-line bg-surface p-6 text-ink-soft leading-relaxed">{intro}</div>
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-6 border-b border-line-soft py-8 last:border-0">
              <h2 className="flex items-baseline gap-3 font-display text-xl font-bold text-ink">
                <span className="text-marigold">{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </h2>
              <div className="legal-body mt-3 space-y-3 leading-relaxed text-ink-soft">{s.body}</div>
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}

/** Bulleted list styled for legal text. */
export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
