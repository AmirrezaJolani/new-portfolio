/**
 * Generated macOS Tahoe-style scenic wallpaper — no copyrighted asset.
 * A layered SVG: graded sky, soft sun, three hazy mountain ranges (far ones
 * lighter for atmospheric depth), a lake with a sun reflection, plus a grain
 * and vignette overlay so it reads photographic rather than flat.
 */
export function Wallpaper() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <svg
        aria-hidden="true"
        className="h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4aa3e6" />
            <stop offset="42%" stopColor="#8fc9f0" />
            <stop offset="72%" stopColor="#cfe9f8" />
            <stop offset="100%" stopColor="#eaf5fc" />
          </linearGradient>
          <radialGradient id="sun" cx="78%" cy="20%" r="26%">
            <stop offset="0%" stopColor="#fffdf4" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#fff4d6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#fff4d6" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="lake" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bfe6f2" />
            <stop offset="18%" stopColor="#79c1de" />
            <stop offset="60%" stopColor="#3f9ac6" />
            <stop offset="100%" stopColor="#2b6f96" />
          </linearGradient>
          <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#eaf5fc" stopOpacity="0" />
            <stop offset="100%" stopColor="#eaf5fc" stopOpacity="0.9" />
          </linearGradient>
          <radialGradient id="vignette" cx="50%" cy="42%" r="75%">
            <stop offset="60%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#0b2540" stopOpacity="0.28" />
          </radialGradient>
          <filter id="grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="2"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>

        {/* Sky + sun */}
        <rect width="1440" height="640" fill="url(#sky)" />
        <rect width="1440" height="640" fill="url(#sun)" />

        {/* Far range — lightest (atmospheric depth) */}
        <path
          d="M0 470 L150 430 L320 468 L470 410 L640 460 L820 405 L1010 458 L1200 415 L1440 452 L1440 640 L0 640 Z"
          fill="#9dc4e0"
          opacity="0.65"
        />
        {/* Mid range with snow line */}
        <path
          d="M0 520 L180 452 L330 512 L520 440 L700 516 L900 448 L1120 520 L1320 462 L1440 500 L1440 660 L0 660 Z"
          fill="#6fa0c4"
          opacity="0.85"
        />
        <path
          d="M520 440 L560 470 L600 452 L640 486 L700 516 L520 516 Z M900 448 L940 478 L985 458 L1030 492 L900 500 Z M180 452 L214 480 L250 462 L286 492 L180 500 Z"
          fill="#eef6fb"
          opacity="0.9"
        />
        {/* Near ridge — darkest, forested */}
        <path
          d="M0 596 L220 540 L430 598 L640 548 L860 602 L1080 552 L1300 606 L1440 566 L1440 640 L0 640 Z"
          fill="#4f7f79"
          opacity="0.92"
        />

        {/* Horizon haze band */}
        <rect y="470" width="1440" height="170" fill="url(#haze)" />

        {/* Lake */}
        <rect y="612" width="1440" height="288" fill="url(#lake)" />
        {/* Sun reflection + ripples */}
        <ellipse
          cx="1123"
          cy="700"
          rx="150"
          ry="16"
          fill="#fff6da"
          opacity="0.35"
        />
        <ellipse
          cx="1123"
          cy="760"
          rx="220"
          ry="10"
          fill="#ffffff"
          opacity="0.12"
        />
        <rect y="612" width="1440" height="3" fill="#ffffff" opacity="0.35" />

        {/* Grain + vignette for a photographic finish */}
        <rect
          width="1440"
          height="900"
          filter="url(#grain)"
          opacity="0.05"
          style={{ mixBlendMode: "overlay" }}
        />
        <rect width="1440" height="900" fill="url(#vignette)" />
      </svg>
    </div>
  );
}
