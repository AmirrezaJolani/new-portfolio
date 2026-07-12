"use client";

import { useTranslations } from "next-intl";
import { useSettings } from "@/context/SettingsContext";
import type { Theme } from "@/settings/config";

const OPTIONS: Theme[] = ["light", "dark", "auto"];

export function AppearancePane() {
  const t = useTranslations("settings");
  const { settings, setSetting } = useSettings();
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{t("appearance")}</h2>
      <div className="inline-flex rounded-xl bg-black/10 p-1 dark:bg-white/10">
        {OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setSetting("theme", opt)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
              settings.theme === opt
                ? "bg-white text-slate-900 shadow dark:bg-slate-200"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            {t(`theme_${opt}`)}
          </button>
        ))}
      </div>
    </section>
  );
}
