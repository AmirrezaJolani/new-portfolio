"use client";

import { Sun } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

/** A reference Monday (2024-01-01) for building locale-aware weekday headers. */
const REFERENCE_MONDAY = new Date(2024, 0, 1);
const WEEKDAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

function CalendarWidget({ locale }: { locale: string }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long" }).format(
    now,
  );
  const narrowWeekday = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
  const weekdays = WEEKDAY_KEYS.map((key, i) => {
    const d = new Date(REFERENCE_MONDAY);
    d.setDate(REFERENCE_MONDAY.getDate() + i);
    return { key, label: narrowWeekday.format(d) };
  });
  const num = new Intl.NumberFormat(locale);

  const firstOfMonth = new Date(year, month, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: { id: string; day: number | null }[] = [
    ...Array.from({ length: startOffset }, (_, i) => ({
      id: `blank-${i}`,
      day: null,
    })),
    ...Array.from({ length: daysInMonth }, (_, i) => ({
      id: `day-${i + 1}`,
      day: i + 1,
    })),
  ];

  return (
    <div className="lg-chip w-44 rounded-3xl p-4 text-slate-800 dark:text-slate-100">
      <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-red-500">
        {monthLabel}
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] font-medium text-slate-500 dark:text-slate-400">
        {weekdays.map((w) => (
          <span key={w.key}>{w.label}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-y-1 text-center text-[11px] font-semibold text-slate-700 dark:text-slate-300">
        {cells.map((cell) =>
          cell.day === null ? (
            <span key={cell.id} />
          ) : (
            <span
              key={cell.id}
              className={
                cell.day === today
                  ? "mx-auto flex size-5 items-center justify-center rounded-full bg-red-500 text-white"
                  : "flex h-5 items-center justify-center"
              }
            >
              {num.format(cell.day)}
            </span>
          ),
        )}
      </div>
    </div>
  );
}

function WeatherWidget({ locale }: { locale: string }) {
  const t = useTranslations("widgets");
  const num = new Intl.NumberFormat(locale);
  return (
    <div className="lg-chip flex w-44 flex-col justify-between rounded-3xl bg-gradient-to-br from-sky-400/50 to-blue-500/40 p-4 text-slate-800 dark:text-slate-100">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold">{t("weatherCity")}</div>
          <div className="text-3xl font-light leading-tight">
            {num.format(33)}°
          </div>
        </div>
        <Sun className="size-7 text-amber-400" strokeWidth={2.2} />
      </div>
      <div className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-400">
        {t("weatherCondition")}
        <div className="mt-0.5 text-slate-500 dark:text-slate-400">
          {t("high")}:{num.format(34)}° {t("low")}:{num.format(19)}°
        </div>
      </div>
    </div>
  );
}

export function Widgets() {
  const locale = useLocale();
  return (
    <div className="absolute top-10 start-4 z-10 flex gap-4">
      <CalendarWidget locale={locale} />
      <WeatherWidget locale={locale} />
    </div>
  );
}
