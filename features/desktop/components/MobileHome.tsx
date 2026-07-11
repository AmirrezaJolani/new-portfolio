"use client";

import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { createElement, useState } from "react";
import { apps, getApp } from "@/lib/apps.config";
import type { AppId } from "@/types";
import { appComponents } from "./appRegistry";

export function MobileHome() {
  const t = useTranslations("apps");
  const [active, setActive] = useState<AppId | null>(null);

  if (active) {
    const app = getApp(active);
    return (
      <div className="flex min-h-dvh flex-col bg-white dark:bg-zinc-900">
        <div className="flex h-12 items-center gap-2 border-b border-black/10 px-3 dark:border-white/10">
          <button
            type="button"
            onClick={() => setActive(null)}
            className="flex items-center gap-1 text-blue-600"
          >
            <ChevronLeft className="size-5" />
          </button>
          <span className="font-medium">{t(app.titleKey)}</span>
        </div>
        <div className="flex-1 overflow-auto p-5">
          {createElement(appComponents[active])}
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-dvh grid-cols-3 content-start gap-6 p-8 pt-16">
      {apps.map((app) => {
        const Icon = app.icon;
        return (
          <button
            key={app.id}
            type="button"
            onClick={() => setActive(app.id)}
            className="flex flex-col items-center gap-2"
          >
            <span className="flex size-16 items-center justify-center rounded-2xl bg-white/80 text-zinc-800 shadow">
              <Icon className="size-8" />
            </span>
            <span className="text-xs text-white">{t(app.titleKey)}</span>
          </button>
        );
      })}
    </div>
  );
}
