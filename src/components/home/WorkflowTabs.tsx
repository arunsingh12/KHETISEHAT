"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";

export type WorkflowStep = { title: string; hindi: string; body: string; tag?: string };

type Journey = {
  key: "farmer" | "provider";
  label: string;
  hindi: string;
  intro: string;
  steps: WorkflowStep[];
  cta: { href: string; label: string };
};

/** "How it works" with a Farmer / Provider switch — each a numbered journey. */
export function WorkflowTabs({ journeys }: { journeys: Journey[] }) {
  const [active, setActive] = useState(journeys[0].key);
  const journey = journeys.find((j) => j.key === active) ?? journeys[0];

  return (
    <div>
      <div role="tablist" aria-label="Choose your journey" className="inline-flex rounded-full border border-line bg-surface-2 p-1">
        {journeys.map((j) => (
          <button
            key={j.key}
            role="tab"
            type="button"
            aria-selected={active === j.key}
            onClick={() => setActive(j.key)}
            className={clsx(
              "rounded-full px-5 py-2 text-sm font-semibold transition-colors sm:px-7 sm:text-base",
              active === j.key ? "bg-brand text-white shadow-sm" : "text-ink-soft hover:text-brand",
            )}
          >
            {j.label} <span className="font-normal opacity-80">· {j.hindi}</span>
          </button>
        ))}
      </div>

      <p className="mt-4 max-w-2xl text-ink-soft">{journey.intro}</p>

      <ol role="tabpanel" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {journey.steps.map((step, i) => (
          <li
            key={step.title}
            className="relative rounded-2xl border border-line bg-surface p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand font-display text-lg font-bold text-white">
                {i + 1}
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold leading-tight">{step.title}</h3>
                <p className="text-xs text-marigold">{step.hindi}</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{step.body}</p>
            {step.tag && (
              <span className="mt-3 inline-block rounded-full bg-brand-light px-3 py-1 text-xs font-medium text-brand-deep">
                {step.tag}
              </span>
            )}
          </li>
        ))}
      </ol>

      <Link
        href={journey.cta.href}
        className="mt-8 inline-block rounded-full bg-marigold px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-deep"
      >
        {journey.cta.label} →
      </Link>
    </div>
  );
}
