/** Smaller cousin of the home banner, for the About / Contact / legal pages. */
export function PageHero({
  eyebrow,
  title,
  hindi,
  children,
}: {
  eyebrow: string;
  title: string;
  hindi: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-[1.75rem] bg-brand-deep px-6 py-10 text-white sm:px-10 sm:py-14">
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]">
        <defs>
          <pattern id="page-furrows" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)">
            <path d="M0 14 H28" stroke="#ffffff" strokeWidth="2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#page-furrows)" />
      </svg>
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#f3b94d]/20" />
      <div className="relative max-w-3xl">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white/90 ring-1 ring-white/20">
          <span className="h-2 w-2 rounded-full bg-[#f3b94d]" />
          {eyebrow}
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-5xl">{title}</h1>
        <p className="mt-1 font-display text-xl text-[#ffd9a0] sm:text-2xl">{hindi}</p>
        {children && <div className="mt-5 text-lg leading-relaxed text-white/90">{children}</div>}
      </div>
      <div className="absolute inset-x-0 bottom-0 grid h-1.5 grid-cols-2" aria-hidden>
        <span className="bg-[#7fae5c]" />
        <span className="bg-[#f3b94d]" />
      </div>
    </section>
  );
}
