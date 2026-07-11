"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Locale } from "@/i18n/config";
import { setUserLocale } from "@/i18n/locale";

const LOCALES: { id: Locale; labelKey: string }[] = [
  { id: "en", labelKey: "english" },
  { id: "fa", labelKey: "persian" },
];

export function LanguagePane() {
  const t = useTranslations("settings");
  const tMenu = useTranslations("menu");
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
        {LOCALES.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => change(l.id)}
            className={`rounded-lg px-4 py-2 text-start text-sm transition ${
              locale === l.id
                ? "bg-blue-500 text-white"
                : "bg-black/5 dark:bg-white/10"
            }`}
          >
            {tMenu(l.labelKey)}
          </button>
        ))}
      </div>
    </section>
  );
}
