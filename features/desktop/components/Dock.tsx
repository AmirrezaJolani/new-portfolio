"use client";

import { useTranslations } from "next-intl";
import { useWindowManager } from "@/context/WindowManagerContext";
import { apps } from "@/lib/apps.config";

export function Dock() {
  const t = useTranslations("apps");
  const { open, isOpen } = useWindowManager();

  return (
    <nav className="fixed inset-x-0 bottom-3 z-[9999] flex justify-center">
      <ul className="flex items-end gap-3 rounded-2xl border border-white/20 bg-white/20 px-3 py-2 shadow-xl backdrop-blur-2xl">
        {apps.map((app) => {
          const Icon = app.icon;
          return (
            <li key={app.id} className="group relative">
              <button
                type="button"
                aria-label={t(app.titleKey)}
                onClick={() => open(app.id, app.defaultGeometry)}
                className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-b from-white/80 to-white/50 text-zinc-800 shadow transition-transform duration-150 group-hover:-translate-y-1 group-hover:scale-110"
              >
                <Icon className="size-6" />
              </button>
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/70 px-2 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100">
                {t(app.titleKey)}
              </span>
              {isOpen(app.id) && (
                <span className="absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-zinc-800" />
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
