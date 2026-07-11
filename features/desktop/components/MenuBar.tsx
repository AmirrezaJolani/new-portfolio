"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Apple } from "lucide-react";
import { setUserLocale } from "@/i18n/locale";
import type { Locale } from "@/i18n/config";
import { useClock } from "@/features/desktop/hooks/useClock";
import { useWindowManager } from "@/context/WindowManagerContext";
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
    : "Finder";

  function changeLocale(next: string) {
    startTransition(async () => {
      await setUserLocale(next as Locale);
      router.refresh();
    });
  }

  return (
    <header className="fixed inset-x-0 top-0 z-[9999] flex h-7 items-center justify-between bg-black/20 px-4 text-sm text-white backdrop-blur-md">
      <div className="flex items-center gap-4">
        <Apple className="size-4" />
        <span className="font-semibold">{activeTitle}</span>
      </div>
      <div className="flex items-center gap-4">
        <label className="sr-only" htmlFor="lang">{tMenu("language")}</label>
        <select
          id="lang"
          value={locale}
          onChange={(e) => changeLocale(e.target.value)}
          className="bg-transparent text-white outline-none"
        >
          <option className="text-black" value="en">{tMenu("english")}</option>
          <option className="text-black" value="fa">{tMenu("persian")}</option>
        </select>
        <span>{clock}</span>
      </div>
    </header>
  );
}
