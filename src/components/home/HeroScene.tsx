/**
 * Home hero illustration: the two halves of "Kheti Sehat" in one scene —
 * a drone spraying fields (खेती) on the left, a village clinic and
 * ambulance (सेहत) on the right, joined by one road to the Kheti Sehat pin.
 */
export function HeroScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 420"
      role="img"
      aria-label="A drone spraying fields on the left and a village clinic with an ambulance on the right, joined by a road"
      className={className}
    >
      <defs>
        <linearGradient id="hs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdf1d6" />
          <stop offset="1" stopColor="#eef3e4" />
        </linearGradient>
        <linearGradient id="hs-field" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fae5c" />
          <stop offset="1" stopColor="#3f7a3c" />
        </linearGradient>
        <linearGradient id="hs-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3dfb4" />
          <stop offset="1" stopColor="#e7c98d" />
        </linearGradient>
        <clipPath id="hs-left">
          <path d="M0 0 H330 Q300 210 336 420 H0Z" />
        </clipPath>
        <clipPath id="hs-right">
          <path d="M330 0 H640 V420 H336 Q300 210 330 0Z" />
        </clipPath>
      </defs>

      <rect width="640" height="420" fill="url(#hs-sky)" />

      {/* Sun on the seam, rising over both halves */}
      <g transform="translate(330 118)">
        {Array.from({ length: 12 }, (_, i) => (
          <rect
            key={i}
            x="-3"
            y="-82"
            width="6"
            height="18"
            rx="3"
            fill="#f0a93a"
            opacity="0.55"
            transform={`rotate(${i * 30})`}
          />
        ))}
        <circle r="50" fill="#f3b94d" />
        <circle r="50" fill="none" stroke="#fff6e2" strokeWidth="6" opacity="0.6" />
      </g>

      {/* ---- खेती: fields + drone ---- */}
      <g clipPath="url(#hs-left)">
        <path d="M0 200 Q110 160 230 190 T420 185 V420 H0Z" fill="#b5cf8f" />
        <path d="M0 232 Q140 205 340 228 V420 H0Z" fill="url(#hs-field)" />
        {Array.from({ length: 9 }, (_, i) => (
          <path
            key={i}
            d={`M${-80 + i * 52} 420 L${150 + i * 16} 236`}
            stroke="#2f5e2c"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.3"
          />
        ))}
        {/* crop tufts */}
        {[
          [60, 300],
          [118, 340],
          [40, 380],
          [190, 296],
          [230, 360],
          [150, 395],
        ].map(([x, y]) => (
          <path
            key={`${x}-${y}`}
            d={`M${x} ${y} q-6 -16 -14 -20 M${x} ${y} q0 -18 0 -24 M${x} ${y} q6 -16 14 -20`}
            stroke="#d9ecb0"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        ))}
        {/* tree */}
        <rect x="38" y="178" width="8" height="34" rx="3" fill="#6b4f33" />
        <circle cx="42" cy="168" r="26" fill="#2f6a3a" />
        <circle cx="58" cy="182" r="16" fill="#3c7d45" />

        {/* drone + spray */}
        <g transform="translate(150 118)">
          <path d="M-34 30 L-58 128 M-14 30 L-24 132 M14 30 L24 132 M34 30 L58 128" stroke="#9fd0e8" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" />
          <path d="M-40 -6 H40" stroke="#1e3b2a" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="-44" cy="-12" rx="20" ry="4" fill="#1e3b2a" opacity="0.75" />
          <ellipse cx="44" cy="-12" rx="20" ry="4" fill="#1e3b2a" opacity="0.75" />
          <rect x="-4" y="-12" width="8" height="8" fill="#1e3b2a" />
          <rect x="-24" y="-4" width="48" height="22" rx="9" fill="#ffffff" stroke="#1e3b2a" strokeWidth="3" />
          <circle cx="0" cy="7" r="5" fill="#c9781a" />
          <path d="M-14 18 L-22 30 M14 18 L22 30" stroke="#1e3b2a" strokeWidth="3" strokeLinecap="round" />
        </g>
      </g>

      {/* ---- सेहत: clinic + ambulance ---- */}
      <g clipPath="url(#hs-right)">
        <path d="M300 205 Q440 170 640 196 V420 H300Z" fill="#cfe0b0" />
        <path d="M300 240 Q470 222 640 236 V420 H300Z" fill="url(#hs-ground)" />
        {/* clinic */}
        <g transform="translate(470 150)">
          <rect x="-78" y="40" width="156" height="92" rx="6" fill="#fffaf0" stroke="#c9a46a" strokeWidth="2" />
          <path d="M-92 46 L0 -4 L92 46Z" fill="#c9781a" />
          <rect x="-18" y="86" width="36" height="46" rx="4" fill="#2e6b43" />
          <rect x="-62" y="64" width="28" height="24" rx="3" fill="#bfe0ef" />
          <rect x="34" y="64" width="28" height="24" rx="3" fill="#bfe0ef" />
          <circle cx="0" cy="26" r="17" fill="#ffffff" stroke="#c0392b" strokeWidth="3" />
          <path d="M-8 26 H8 M0 18 V34" stroke="#c0392b" strokeWidth="5" strokeLinecap="round" />
        </g>
        {/* tree */}
        <rect x="604" y="206" width="8" height="34" rx="3" fill="#6b4f33" />
        <circle cx="608" cy="196" r="24" fill="#3c7d45" />
        {/* ambulance */}
        <g transform="translate(520 330)">
          <rect x="-56" y="-34" width="74" height="40" rx="6" fill="#ffffff" stroke="#9e3b26" strokeWidth="3" />
          <path d="M18 -24 H40 L56 -6 V6 H18Z" fill="#ffffff" stroke="#9e3b26" strokeWidth="3" strokeLinejoin="round" />
          <path d="M24 -18 H38 L48 -6 H24Z" fill="#bfe0ef" />
          <path d="M-26 -14 H-10 M-18 -22 V-6" stroke="#c0392b" strokeWidth="5" strokeLinecap="round" />
          <rect x="-56" y="-6" width="112" height="5" fill="#c0392b" opacity="0.8" />
          <circle cx="-34" cy="8" r="10" fill="#1e3b2a" />
          <circle cx="34" cy="8" r="10" fill="#1e3b2a" />
          <circle cx="-34" cy="8" r="4" fill="#d9d9d9" />
          <circle cx="34" cy="8" r="4" fill="#d9d9d9" />
          <rect x="-10" y="-42" width="14" height="8" rx="3" fill="#e74c3c" />
        </g>
      </g>

      {/* The seam — one stitched line between the two worlds */}
      <path d="M330 0 Q300 210 336 420" fill="none" stroke="#ffffff" strokeWidth="3" strokeDasharray="10 8" opacity="0.8" />

      {/* One road joins both halves at the Kheti Sehat pin */}
      <path
        d="M70 420 C140 360 250 360 320 330 C390 300 430 300 470 282"
        fill="none"
        stroke="#f6ead5"
        strokeWidth="22"
        strokeLinecap="round"
        opacity="0.95"
      />
      <path
        d="M70 420 C140 360 250 360 320 330 C390 300 430 300 470 282"
        fill="none"
        stroke="#c9a46a"
        strokeWidth="2"
        strokeDasharray="10 10"
      />
      <g transform="translate(320 318)">
        <ellipse cx="0" cy="14" rx="18" ry="5" fill="#000000" opacity="0.15" />
        <path d="M0 12 C-22 -10 -24 -22 -24 -32 A24 24 0 0 1 24 -32 C24 -22 22 -10 0 12Z" fill="#1e4a2e" />
        <circle cx="0" cy="-32" r="14" fill="#ffffff" />
        <path d="M-6 -32 H6 M0 -38 V-26" stroke="#c9781a" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
}
