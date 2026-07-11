import type { WallpaperId } from "@/settings/config";

export function Wallpaper({ id = "day" }: { id?: WallpaperId }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {id === "aurora" ? (
        <Aurora />
      ) : (
        <Scene palette={id === "night" ? NIGHT : DAY} />
      )}
    </div>
  );
}

interface Palette {
  sky: [string, string, string, string];
  sun: string;
  lake: [string, string, string, string];
  far: string;
  mid: string;
  snow: string;
  near: string;
  vignette: string;
  vignetteOpacity: number;
}

const DAY: Palette = {
  sky: ["#4aa3e6", "#8fc9f0", "#cfe9f8", "#eaf5fc"],
  sun: "#fff4d6",
  lake: ["#bfe6f2", "#79c1de", "#3f9ac6", "#2b6f96"],
  far: "#9dc4e0",
  mid: "#6fa0c4",
  snow: "#eef6fb",
  near: "#4f7f79",
  vignette: "#0b2540",
  vignetteOpacity: 0.28,
};

const NIGHT: Palette = {
  sky: ["#0a1430", "#122247", "#1c2d54", "#243a63"],
  sun: "#2a3a66",
  lake: ["#1b2c4a", "#152640", "#0f1d32", "#0a1424"],
  far: "#26385d",
  mid: "#1c2b4a",
  snow: "#c9d6ec",
  near: "#16233b",
  vignette: "#000008",
  vignetteOpacity: 0.55,
};

function Scene({ palette: p }: { palette: Palette }) {
  return (
    <svg
      aria-hidden="true"
      className="h-full w-full"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="wp-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.sky[0]} />
          <stop offset="42%" stopColor={p.sky[1]} />
          <stop offset="72%" stopColor={p.sky[2]} />
          <stop offset="100%" stopColor={p.sky[3]} />
        </linearGradient>
        <radialGradient id="wp-sun" cx="78%" cy="20%" r="26%">
          <stop offset="0%" stopColor={p.sun} stopOpacity="0.9" />
          <stop offset="100%" stopColor={p.sun} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="wp-lake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.lake[0]} />
          <stop offset="18%" stopColor={p.lake[1]} />
          <stop offset="60%" stopColor={p.lake[2]} />
          <stop offset="100%" stopColor={p.lake[3]} />
        </linearGradient>
        <radialGradient id="wp-vig" cx="50%" cy="42%" r="75%">
          <stop offset="60%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor={p.vignette} stopOpacity={p.vignetteOpacity} />
        </radialGradient>
      </defs>
      <rect width="1440" height="640" fill="url(#wp-sky)" />
      <rect width="1440" height="640" fill="url(#wp-sun)" />
      <path d="M0 470 L150 430 L320 468 L470 410 L640 460 L820 405 L1010 458 L1200 415 L1440 452 L1440 640 L0 640 Z" fill={p.far} opacity="0.65" />
      <path d="M0 520 L180 452 L330 512 L520 440 L700 516 L900 448 L1120 520 L1320 462 L1440 500 L1440 660 L0 660 Z" fill={p.mid} opacity="0.85" />
      <path d="M520 440 L560 470 L600 452 L640 486 L700 516 L520 516 Z M900 448 L940 478 L985 458 L1030 492 L900 500 Z M180 452 L214 480 L250 462 L286 492 L180 500 Z" fill={p.snow} opacity="0.9" />
      <path d="M0 596 L220 540 L430 598 L640 548 L860 602 L1080 552 L1300 606 L1440 566 L1440 640 L0 640 Z" fill={p.near} opacity="0.92" />
      <rect y="612" width="1440" height="288" fill="url(#wp-lake)" />
      <rect y="612" width="1440" height="3" fill="#ffffff" opacity="0.25" />
      <rect width="1440" height="900" fill="url(#wp-vig)" />
    </svg>
  );
}

function Aurora() {
  return (
    <div className="h-full w-full bg-[#0b1026]">
      <div
        className="h-full w-full"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 20%, rgba(56,189,248,0.55), transparent 60%)," +
            "radial-gradient(55% 45% at 80% 25%, rgba(168,85,247,0.5), transparent 60%)," +
            "radial-gradient(65% 55% at 60% 85%, rgba(16,185,129,0.45), transparent 60%)," +
            "radial-gradient(50% 45% at 30% 80%, rgba(236,72,153,0.4), transparent 60%)",
        }}
      />
    </div>
  );
}
