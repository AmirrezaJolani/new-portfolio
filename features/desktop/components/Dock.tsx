"use client";

import { useTranslations } from "next-intl";
import { useWindowManager } from "@/context/WindowManagerContext";
import { apps } from "@/lib/apps.config";

export function Dock() {
  const t = useTranslations("apps");
  const { open, isOpen } = useWindowManager();

  return (
    <nav className="fixed inset-x-0 bottom-2 z-[9999] flex justify-center">
      <ul className="lg-panel flex items-end gap-2.5 rounded-[26px] px-2.5 py-2">
        {apps.map((app) => {
          const Icon = app.icon;
          return (
            <li
              key={app.id}
              className="group relative flex flex-col items-center"
            >
              <span className="lg-chip pointer-events-none absolute -top-10 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                {t(app.titleKey)}
              </span>
              <button
                type="button"
                aria-label={t(app.titleKey)}
                onClick={() => open(app.id, app.defaultGeometry)}
                className={`flex size-14 items-center justify-center rounded-2xl bg-gradient-to-b ${app.tile} text-white shadow-lg ring-1 ring-black/5 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.45)] transition-transform duration-200 ease-out will-change-transform group-hover:-translate-y-2 group-hover:scale-110`}
              >
                <Icon className="size-7" strokeWidth={2} />
              </button>
              <span
                className={`mt-1 size-1 rounded-full bg-slate-700/80 transition-opacity ${
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
