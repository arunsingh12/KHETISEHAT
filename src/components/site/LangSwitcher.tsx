"use client";

import { useTransition } from "react";
import clsx from "clsx";
import { setLocale } from "@/actions/locale";
import type { Locale } from "@/lib/i18n/dictionaries";

export function LangSwitcher({ current }: { current: Locale }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center rounded-full border border-line bg-surface p-0.5 text-xs font-semibold">
      {(["en", "hi"] as Locale[]).map((locale) => (
        <button
          key={locale}
          disabled={pending}
          onClick={() => startTransition(() => setLocale(locale))}
          className={clsx(
            "rounded-full px-2.5 py-1 transition-colors",
            current === locale ? "bg-brand text-white" : "text-ink-soft hover:text-ink",
          )}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
