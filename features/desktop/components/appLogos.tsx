import { useId } from "react";
import type { AppId } from "@/types";

/**
 * Custom app-icon logos for the dock / home screen. Each renders a complete
 * macOS-Tahoe-style tile — a dark "glass" squircle plus a dimensional, metallic
 * glyph — so the icon and its background ship as one self-contained SVG.
 *
 * Gradient ids are namespaced per instance with `useId()` because the same logo
 * can mount more than once (dock + mobile home), and duplicate SVG gradient ids
 * would otherwise resolve to whichever painted first.
 */
export interface LogoProps {
  className?: string;
}

/** Shared dark squircle tile with a top sheen and a hairline rim. */
function Tile({
  uid,
  from,
  to,
  children,
}: {
  uid: string;
  from: string;
  to: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-tile`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
        <linearGradient id={`${uid}-sheen`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect
        x="1"
        y="1"
        width="62"
        height="62"
        rx="15"
        fill={`url(#${uid}-tile)`}
      />
      <rect
        x="1"
        y="1"
        width="62"
        height="30"
        rx="15"
        fill={`url(#${uid}-sheen)`}
      />
      {children}
      <rect
        x="1.5"
        y="1.5"
        width="61"
        height="61"
        rx="14.5"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.12"
      />
    </>
  );
}

function svgProps(className?: string) {
  return {
    viewBox: "0 0 64 64",
    className,
    role: "img" as const,
    "aria-hidden": true,
    focusable: false as const,
    xmlns: "http://www.w3.org/2000/svg",
  };
}

/** About — "AJ" monogram in brushed steel-blue. */
function AboutLogo({ className }: LogoProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg {...svgProps(className)}>
      <Tile uid={uid} from="#3a4152" to="#191c26">
        <defs>
          <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#cfe4ff" />
            <stop offset="1" stopColor="#4f8bff" />
          </linearGradient>
        </defs>
        <text
          x="32"
          y="43"
          textAnchor="middle"
          fill={`url(#${uid}-g)`}
          style={{
            font: "800 26px var(--font-geist-sans), system-ui, sans-serif",
            letterSpacing: "-1.5px",
          }}
        >
          AJ
        </text>
      </Tile>
    </svg>
  );
}

/** Projects — isometric silver cube (three shaded faces). */
function ProjectsLogo({ className }: LogoProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg {...svgProps(className)}>
      <Tile uid={uid} from="#41454e" to="#1b1d23">
        <defs>
          <linearGradient id={`${uid}-top`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f2f5f9" />
            <stop offset="1" stopColor="#d2d9e2" />
          </linearGradient>
          <linearGradient id={`${uid}-left`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c4ccd8" />
            <stop offset="1" stopColor="#98a3b3" />
          </linearGradient>
          <linearGradient id={`${uid}-right`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#aab4c2" />
            <stop offset="1" stopColor="#7c8797" />
          </linearGradient>
        </defs>
        {/* top face */}
        <path d="M32 13 L49 22.5 L32 32 L15 22.5 Z" fill={`url(#${uid}-top)`} />
        {/* left face */}
        <path
          d="M15 22.5 L32 32 L32 51 L15 41.5 Z"
          fill={`url(#${uid}-left)`}
        />
        {/* right face */}
        <path
          d="M49 22.5 L32 32 L32 51 L49 41.5 Z"
          fill={`url(#${uid}-right)`}
        />
        {/* top edge highlights */}
        <path
          d="M15 22.5 L32 13 L49 22.5"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.5"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
      </Tile>
    </svg>
  );
}

/** Contact — origami paper plane in emerald-teal. */
function ContactLogo({ className }: LogoProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg {...svgProps(className)}>
      <Tile uid={uid} from="#2f4a44" to="#161f1c">
        <defs>
          <linearGradient id={`${uid}-wing`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#b6f5d8" />
            <stop offset="1" stopColor="#10b981" />
          </linearGradient>
          <linearGradient id={`${uid}-fin`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0f9d78" />
            <stop offset="1" stopColor="#0a6a54" />
          </linearGradient>
        </defs>
        {/* main wing */}
        <path d="M54 12 L11 30 L31 38 Z" fill={`url(#${uid}-wing)`} />
        {/* tail fin (folded underside) */}
        <path d="M54 12 L31 38 L38 53 Z" fill={`url(#${uid}-fin)`} />
        {/* leading-edge highlight */}
        <path
          d="M54 12 L11 30"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.55"
          strokeWidth="0.75"
          strokeLinecap="round"
        />
      </Tile>
    </svg>
  );
}

/** Build a cog silhouette path with `teeth` trapezoidal teeth. */
function cogPath(
  cx: number,
  cy: number,
  rOut: number,
  rIn: number,
  teeth: number,
): string {
  const step = (Math.PI * 2) / teeth;
  const half = step * 0.28; // angular half-width of a tooth top
  const pt = (r: number, a: number) =>
    `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  let d = "";
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    d += `${i === 0 ? "M" : "L"}${pt(rIn, a - step / 2 + half)}`;
    d += `L${pt(rOut, a - half)}`;
    d += `L${pt(rOut, a + half)}`;
    d += `L${pt(rIn, a + step / 2 - half)}`;
  }
  return `${d}Z`;
}

/** Settings — brushed-graphite gear. */
function SettingsLogo({ className }: LogoProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg {...svgProps(className)}>
      <Tile uid={uid} from="#40434b" to="#1a1c21">
        <defs>
          <linearGradient id={`${uid}-metal`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e2e8f0" />
            <stop offset="1" stopColor="#7c8593" />
          </linearGradient>
        </defs>
        <path d={cogPath(32, 32, 21, 15.5, 8)} fill={`url(#${uid}-metal)`} />
        <circle cx="32" cy="32" r="7.5" fill="#20232a" />
        <circle
          cx="32"
          cy="32"
          r="7.5"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.15"
        />
      </Tile>
    </svg>
  );
}

export const appLogos: Record<AppId, React.FC<LogoProps>> = {
  about: AboutLogo,
  projects: ProjectsLogo,
  contact: ContactLogo,
  settings: SettingsLogo,
};
