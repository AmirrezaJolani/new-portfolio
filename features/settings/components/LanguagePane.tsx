"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { type Locale, localeNames, locales } from "@/i18n/config";
import { setUserLocale } from "@/i18n/locale";

export function LanguagePane() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const router = useRouter();
  const [, startTransition] = useTransition();

  function change(next: Locale) {
    startTransition(async () => {
      await setUserLocale(next);
      router.refresh();
    });
  }

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{t("language")}</h2>
      <div className="flex flex-col gap-2">
        {locales.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => change(id)}
            className={`rounded-lg px-4 py-2 text-start text-sm transition ${
              locale === id
                ? "bg-blue-500 text-white"
                : "bg-black/5 dark:bg-white/10"
            }`}
          >
            {localeNames[id]}
          </button>
        ))}
      </div>
    </section>
  );
}
