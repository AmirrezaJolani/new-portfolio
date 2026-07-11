"use client";

import {
  Accessibility,
  Image as ImageIcon,
  Languages,
  Palette,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AccessibilityPane } from "./AccessibilityPane";
import { AppearancePane } from "./AppearancePane";
import { LanguagePane } from "./LanguagePane";
import { WallpaperPane } from "./WallpaperPane";

type PaneId = "appearance" | "wallpaper" | "accessibility" | "language";

const PANES: { id: PaneId; icon: typeof Palette; labelKey: string }[] = [
  { id: "appearance", icon: Palette, labelKey: "appearance" },
  { id: "wallpaper", icon: ImageIcon, labelKey: "wallpaper" },
  { id: "accessibility", icon: Accessibility, labelKey: "accessibility" },
  { id: "language", icon: Languages, labelKey: "language" },
];

export function SettingsApp() {
  const t = useTranslations("settings");
  const [active, setActive] = useState<PaneId>("appearance");

  return (
    <div className="-m-5 flex h-[calc(100%+2.5rem)]">
      <nav className="w-48 shrink-0 border-e border-black/10 bg-black/5 p-2 dark:border-white/10 dark:bg-white/5">
        {PANES.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(p.id)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start text-sm transition ${
                active === p.id
                  ? "bg-blue-500 text-white"
                  : "hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              <Icon className="size-4" />
              {t(p.labelKey)}
            </button>
          );
        })}
      </nav>
      <div className="flex-1 overflow-auto p-6">
        {active === "appearance" && <AppearancePane />}
        {active === "wallpaper" && <WallpaperPane />}
        {active === "accessibility" && <AccessibilityPane />}
        {active === "language" && <LanguagePane />}
      </div>
    </div>
  );
}
