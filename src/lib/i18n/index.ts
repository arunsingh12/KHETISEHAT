import { cookies } from "next/headers";
import { type Locale, dictionaries, locales } from "./dictionaries";

export const LOCALE_COOKIE = "kheti-sehat-locale";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return (locales as readonly string[]).includes(value ?? "")
    ? (value as Locale)
    : "en";
}

export async function getDictionary() {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}

export { dictionaries, locales };
export type { Locale };
