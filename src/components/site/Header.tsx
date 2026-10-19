import Image from "next/image";
import Link from "next/link";

import { auth, signOut } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { LangSwitcher } from "@/components/site/LangSwitcher";
import { ButtonLink } from "@/components/ui/Button";
import { DASHBOARD_BY_ROLE } from "@/lib/constants";

export async function Header() {
  const [session, { locale, t }] = await Promise.all([auth(), getDictionary()]);

  const navLink = "text-[0.95rem] font-medium text-ink hover:text-brand transition-colors";
  const redPill =
    "inline-flex items-center gap-2 rounded-full bg-[#d93a2b] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#d93a2b]/25 transition hover:brightness-95";
  const initial = session?.user.name?.trim()[0]?.toUpperCase() ?? "?";

  return (
    <header className="bg-surface">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center">
          <Image src="/logo.jpg" alt="Kheti Sehat" width={192} height={96} priority className="h-11 w-auto sm:h-14" />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          <Link href="/" className={navLink}>
            {t.nav.home}
          </Link>
          <Link href="/agri-services" className={navLink}>
            {t.nav.agri}
          </Link>
          <Link href="/health-services" className={navLink}>
            {t.nav.health}
          </Link>
          {session?.user.role === "FARMER" && (
            <Link href="/farmer/bookings" className={navLink}>
              {t.nav.myBookings}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <a href="tel:108" className={redPill}>
            <PhoneIcon />
            {t.nav.sos}
          </a>
          <LangSwitcher current={locale} />

          {session?.user ? (
            <div className="flex items-center gap-2">
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className={redPill}>
                  <LogoutIcon />
                  <span className="hidden sm:inline">{t.nav.logout}</span>
                </button>
              </form>
              <Link
                href={DASHBOARD_BY_ROLE[session.user.role]}
                title={`${t.nav.dashboard} — ${session.user.name ?? ""}`}
                aria-label={t.nav.dashboard}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-brand font-display text-lg font-bold text-white hover:bg-brand-deep"
              >
                {initial}
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ButtonLink href="/login" variant="secondary" size="sm">
                {t.nav.login}
              </ButtonLink>
              <ButtonLink href="/register" variant="marigold" size="sm">
                {t.nav.signup}
              </ButtonLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M14 7V4l7 7-7 7v-3.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11z" />
    </svg>
  );
}
