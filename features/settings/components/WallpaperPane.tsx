"use client";

import { useTranslations } from "next-intl";
import { useSettings } from "@/context/SettingsContext";
import { Wallpaper } from "@/features/desktop/components/Wallpaper";
import type { WallpaperId } from "@/settings/config";

const WALLPAPERS: WallpaperId[] = ["day", "night", "aurora", "sunset"];

export function WallpaperPane() {
  const t = useTranslations("settings");
  const { settings, setSetting } = useSettings();
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{t("wallpaper")}</h2>
      <div className="grid grid-cols-2 gap-3">
        {WALLPAPERS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setSetting("wallpaper", id)}
            className={`overflow-hidden rounded-xl ring-2 transition ${
              settings.wallpaper === id ? "ring-blue-500" : "ring-transparent"
            }`}
          >
            <span className="relative block aspect-video">
              <Wallpaper id={id} />
            </span>
            <span className="block py-1.5 text-center text-xs font-medium">
              {t(`wallpaper_${id}`)}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
