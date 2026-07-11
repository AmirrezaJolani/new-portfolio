"use client";

import {
  Apple,
  BatteryMedium,
  Search,
  SlidersHorizontal,
  Wifi,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { useWindowManager } from "@/context/WindowManagerContext";
import { useClock } from "@/features/desktop/hooks/useClock";
import type { Locale } from "@/i18n/config";
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
    <header className="fixed inset-x-0 top-0 z-[9999] flex h-7 items-center justify-between border-b border-white/25 bg-white/15 px-3 text-[13px] text-slate-800 shadow-[0_1px_0_0_rgba(255,255,255,0.35)] backdrop-blur-2xl backdrop-saturate-150">
      <div className="flex items-center gap-4">
        <Apple className="size-4" fill="currentColor" strokeWidth={0} />
        <span className="font-semibold">{activeTitle}</span>
      </div>
      <div className="flex items-center gap-3.5">
        <Wifi className="size-[15px]" strokeWidth={2} />
        <BatteryMedium className="size-[18px]" strokeWidth={2} />
        <SlidersHorizontal className="size-[15px]" strokeWidth={2} />
        <Search className="size-[15px]" strokeWidth={2} />
        <label className="sr-only" htmlFor="lang">
          {tMenu("language")}
        </label>
        <select
          id="lang"
          value={locale}
          onChange={(e) => changeLocale(e.target.value)}
          className="cursor-pointer rounded bg-transparent font-medium text-slate-800 outline-none hover:bg-white/25"
        >
          <option className="text-black" value="en">
            {tMenu("english")}
          </option>
          <option className="text-black" value="fa">
            {tMenu("persian")}
          </option>
        </select>
        <span className="tabular-nums font-medium">{clock}</span>
      </div>
    </header>
  );
}
