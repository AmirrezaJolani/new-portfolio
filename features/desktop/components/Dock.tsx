"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import { useWindowManager } from "@/context/WindowManagerContext";
import { type Locale, rtlLocales } from "@/i18n/config";
import { apps } from "@/lib/apps.config";
import { appLogos } from "./appLogos";
import { DEFAULT_DOCK_MAGNIFY, dockTransforms } from "./dockMagnification";

// Resting geometry, shared with the fisheye model so the pointer→index mapping
// matches what gets painted. PAD_L mirrors the panel's `px-2.5` (10px) padding.
const { base: BASE, gap: GAP } = DEFAULT_DOCK_MAGNIFY;
const PAD_L = 10;

export function Dock() {
  const t = useTranslations("apps");
  const locale = useLocale();
  const rtl = rtlLocales.includes(locale as Locale);
  const { open, isOpen } = useWindowManager();
  const { settings } = useSettings();

  const listRef = useRef<HTMLUListElement>(null);
  // Both are *visual* left-to-right slot indices (pointer is fractional).
  const [pointer, setPointer] = useState<number | null>(null);
  const [focusSlot, setFocusSlot] = useState<number | null>(null);

  const magnify = !settings.reduceMotion;
  const active = magnify ? (pointer ?? focusSlot) : null;
  const transforms = dockTransforms(active, apps.length);
  // Logical item i → visual slot (the flex row is mirrored under RTL).
  const slotOf = (i: number) => (rtl ? apps.length - 1 - i : i);
  // Snap-track the pointer, but ease the settle on leave / keyboard focus.
  const settle = pointer !== null ? "0ms" : "165ms";

  function handleMove(e: React.MouseEvent) {
    if (!magnify || !listRef.current) return;
    const rect = listRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - PAD_L - BASE / 2;
    setPointer(x / (BASE + GAP));
  }

  return (
    <nav className="fixed inset-x-0 bottom-2 z-[9999] flex justify-center">
      <ul
        ref={listRef}
        onMouseMove={handleMove}
        onMouseLeave={() => setPointer(null)}
        className="lg-panel flex items-end gap-2.5 rounded-[26px] px-2.5 py-2"
      >
        {apps.map((app, i) => {
          const Logo = appLogos[app.id];
          const tf = transforms[slotOf(i)];
          return (
            <li
              key={app.id}
              className="group relative flex flex-col items-center transition-transform ease-out"
              style={{
                transform: `translateX(${tf.translateX}px)`,
                transitionDuration: settle,
              }}
            >
              <span className="lg-chip pointer-events-none absolute -top-12 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800 dark:text-slate-100 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                {t(app.titleKey)}
              </span>
              <button
                type="button"
                aria-label={t(app.titleKey)}
                onClick={() => open(app.id, app.defaultGeometry)}
                onFocus={() => setFocusSlot(slotOf(i))}
                onBlur={() => setFocusSlot(null)}
                className="size-14 rounded-[14px] outline-none transition-transform ease-out will-change-transform [box-shadow:0_10px_24px_-8px_rgba(2,6,23,0.55)] focus-visible:ring-2 focus-visible:ring-white/85"
                style={{
                  transform: `translateY(${tf.translateY}px) scale(${tf.scale})`,
                  transformOrigin: "bottom center",
                  transitionDuration: settle,
                }}
              >
                <Logo className="size-full" />
              </button>
              <span
                className={`mt-1 size-1 rounded-full bg-slate-700/80 dark:bg-slate-200/80 transition-opacity ${
                  isOpen(app.id) ? "opacity-100" : "opacity-0"
                }`}
              />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
