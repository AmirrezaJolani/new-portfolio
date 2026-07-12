"use client";

import { useTranslations } from "next-intl";
import { useSettings } from "@/context/SettingsContext";
import { Toggle } from "./Toggle";

export function AccessibilityPane() {
  const t = useTranslations("settings");
  const { settings, setSetting } = useSettings();
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{t("accessibility")}</h2>
      <div className="divide-y divide-black/10 dark:divide-white/10">
        <Toggle
          label={t("reduceTransparency")}
          checked={settings.reduceTransparency}
          onChange={(v) => setSetting("reduceTransparency", v)}
        />
        <Toggle
          label={t("reduceMotion")}
          checked={settings.reduceMotion}
          onChange={(v) => setSetting("reduceMotion", v)}
        />
        <Toggle
          label={t("largerText")}
          checked={settings.largerText}
          onChange={(v) => setSetting("largerText", v)}
        />
      </div>
    </section>
  );
}
