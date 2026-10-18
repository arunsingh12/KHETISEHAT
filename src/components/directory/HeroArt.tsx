/**
 * Stand-in for the hero photo: a simple farm-field scene. Drop a real photo
 * at public/hero.jpg and the home page uses that instead.
 */
export function HeroArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 340" role="img" aria-label="Green fields under a morning sky" className={className}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3f6ef" />
          <stop offset="1" stopColor="#dfe8d6" />
        </linearGradient>
        <linearGradient id="field" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fa35a" />
          <stop offset="1" stopColor="#4f7a37" />
        </linearGradient>
      </defs>
      <rect width="600" height="340" fill="url(#sky)" />
      <circle cx="470" cy="80" r="34" fill="#f3c46b" opacity="0.85" />
      <path d="M0 175 Q120 140 240 168 T480 160 T600 165 V340 H0Z" fill="#a9c18a" />
      <path d="M0 200 Q150 175 300 195 T600 190 V340 H0Z" fill="url(#field)" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <path
          key={i}
          d={`M${-40 + i * 90} 340 L${250 + i * 18} 205`}
          stroke="#3f6a2c"
          strokeWidth="3"
          opacity="0.35"
        />
      ))}
      {[
        [90, 205],
        [175, 212],
        [330, 208],
        [420, 214],
        [520, 206],
      ].map(([x, y]) => (
        <path key={`${x}`} d={`M${x - 16} ${y} Q${x} ${y - 24} ${x + 16} ${y}Z`} fill="#8a6a3a" opacity="0.8" />
      ))}
      <g fill="#355e2a">
        <circle cx="60" cy="150" r="22" />
        <rect x="57" y="160" width="6" height="30" fill="#5b4632" />
        <circle cx="560" cy="140" r="26" />
        <rect x="557" y="152" width="6" height="34" fill="#5b4632" />
      </g>
    </svg>
  );
}
