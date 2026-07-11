"use client";

import { useTranslations } from "next-intl";
import { skills } from "@/lib/content";

export function AboutApp() {
  const t = useTranslations("about");
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{t("role")}</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          {t("bio")}
        </p>
      </div>
      <div>
        <h3 className="text-sm font-semibold">{t("skillsTitle")}</h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {skills.map((s) => (
            <li
              key={s}
              className="rounded-full bg-zinc-200 px-3 py-1 text-xs dark:bg-zinc-700"
            >
              {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
