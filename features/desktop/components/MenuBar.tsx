"use client";

import { Apple } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { useWindowManager } from "@/context/WindowManagerContext";
import { useClock } from "@/features/desktop/hooks/useClock";
import { type Locale, localeNames, locales } from "@/i18n/config";
import { setUserLocale } from "@/i18n/locale";
import { getApp } from "@/lib/apps.config";
import type { AppId } from "@/types";

export function MenuBar() {
  const locale = useLocale();
  const tApps = useTranslations("apps");
  const tMenu = useTranslations("menu");
  const clock = useClock(locale);
  const router = useRouter();
  const [, startTransition] = useTransition();
  const { focusedId } = useWindowManager();

  const activeTitle = focusedId
    ? tApps(getApp(focusedId as AppId).titleKey)
    : tMenu("finder");

  function changeLocale(next: string) {
    startTransition(async () => {
      await setUserLocale(next as Locale);
      router.refresh();
    });
  }

  return (
    <header className="fixed inset-x-0 top-0 z-[9999] flex h-7 items-center justify-between border-b border-white/25 dark:border-white/10 bg-white/15 dark:bg-black/25 px-3 text-[13px] text-slate-800 dark:text-slate-100 shadow-[0_1px_0_0_rgba(255,255,255,0.35)] backdrop-blur-2xl backdrop-saturate-150">
      <div className="flex items-center gap-4">
        <Apple className="size-4" fill="currentColor" strokeWidth={0} />
        <span className="font-semibold">{activeTitle}</span>
      </div>
      <div className="flex items-center gap-3.5">
        <span className="font-semibold">{tMenu("name")}</span>
        <label className="sr-only" htmlFor="lang">
          {tMenu("language")}
        </label>
        <select
          id="lang"
          value={locale}
          onChange={(e) => changeLocale(e.target.value)}
          className="cursor-pointer rounded bg-transparent font-medium text-slate-800 dark:text-slate-100 outline-none hover:bg-white/25"
        >
          {locales.map((l) => (
            <option key={l} className="text-black" value={l}>
              {localeNames[l]}
            </option>
          ))}
        </select>
        <span className="tabular-nums font-medium">{clock}</span>
      </div>
    </header>
  );
}
