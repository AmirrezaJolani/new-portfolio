"use client";

import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { createElement, useState } from "react";
import { apps, getApp } from "@/lib/apps.config";
import type { AppId } from "@/types";
import { appLogos } from "./appLogos";
import { appComponents } from "./appRegistry";

export function MobileHome() {
  const t = useTranslations("apps");
  const [active, setActive] = useState<AppId | null>(null);

  if (active) {
    const app = getApp(active);
    return (
      <div className="relative z-10 flex min-h-dvh flex-col">
        <div className="lg-panel flex h-14 items-center gap-2 px-4">
          <button
            type="button"
            onClick={() => setActive(null)}
            aria-label={t(app.titleKey)}
            className="flex items-center text-blue-600"
          >
            <ChevronLeft className="size-6 rtl:rotate-180" />
          </button>
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            {t(app.titleKey)}
          </span>
        </div>
        <div className="lg-scroll flex-1 overflow-auto bg-white/60 dark:bg-black/40 p-5 text-slate-800 dark:text-slate-100 backdrop-blur-xl">
          {createElement(appComponents[active])}
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 grid min-h-dvh grid-cols-3 content-start gap-6 p-8 pt-16">
      {apps.map((app) => {
        const Logo = appLogos[app.id];
        return (
          <button
            key={app.id}
            type="button"
            onClick={() => setActive(app.id)}
            className="flex flex-col items-center gap-2"
          >
            <span className="rounded-[1.15rem] shadow-lg [box-shadow:0_12px_26px_-10px_rgba(2,6,23,0.55)] transition-transform active:scale-95">
              <Logo className="size-16" />
            </span>
            <span className="text-xs font-medium text-white [text-shadow:0_1px_3px_rgba(2,32,64,0.7)]">
              {t(app.titleKey)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
