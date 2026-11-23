"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { type Locale, localeOptions } from "@/i18n/config";
import { setUserLocale } from "@/i18n/locale";

// Same cookie switch as the desktop menu bar: set NEXT_LOCALE, then refresh
// the server tree. The game keeps running; only its copy changes.
export function LanguagePicker() {
  const t = useTranslations("menu");
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={locale}
      disabled={pending}
      aria-label={t("language")}
      onChange={(e) =>
        startTransition(async () => {
          await setUserLocale(e.target.value as Locale);
          router.refresh();
        })
      }
      className="pixel-btn appearance-none text-center"
    >
      {localeOptions.map((l) => (
        <option key={l.id} value={l.id}>
          🌐 {t(l.labelKey)}
        </option>
      ))}
    </select>
  );
}
