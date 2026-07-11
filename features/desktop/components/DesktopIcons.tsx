"use client";

import { Folder } from "lucide-react";
import { useTranslations } from "next-intl";
import { useWindowManager } from "@/context/WindowManagerContext";
import { apps } from "@/lib/apps.config";

/**
 * Right-edge desktop folder shortcuts (like a real macOS desktop). Each folder
 * opens its app window. Labels get a soft shadow so they stay legible over the
 * bright wallpaper.
 */
export function DesktopIcons() {
  const t = useTranslations("apps");
  const { open } = useWindowManager();

  return (
    <div className="absolute top-12 end-4 z-10 flex flex-col items-center gap-5">
      {apps.map((app) => (
        <button
          key={app.id}
          type="button"
          aria-label={t(app.titleKey)}
          onClick={() => open(app.id, app.defaultGeometry)}
          className="group flex w-20 flex-col items-center gap-1 rounded-lg p-1 outline-none focus-visible:bg-white/25"
        >
          <Folder
            className="size-12 text-sky-300 drop-shadow-[0_2px_6px_rgba(2,32,64,0.45)] transition-transform group-hover:scale-105 group-active:scale-95"
            fill="currentColor"
            strokeWidth={1.25}
          />
          <span className="rounded px-1 text-center text-xs font-medium text-white [text-shadow:0_1px_3px_rgba(2,32,64,0.7)] group-hover:bg-blue-500/70">
            {t(app.titleKey)}
          </span>
        </button>
      ))}
    </div>
  );
}
