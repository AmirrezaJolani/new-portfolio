"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { fetchProjects } from "@/lib/content";

export function ProjectsApp() {
  const t = useTranslations("projects");
  const {
    data: projects,
    isPending,
    isError,
  } = useQuery({ queryKey: ["projects"], queryFn: fetchProjects });

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("intro")}</p>

      {isPending && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {t("loading")}
        </p>
      )}
      {isError && <p className="text-sm text-red-600">{t("error")}</p>}

      {projects && (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <article
              key={p.id}
              className="rounded-lg border border-black/10 p-4 dark:border-white/10"
            >
              <h3 className="font-semibold">{t(`${p.id}.title`)}</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                {t(`${p.id}.description`)}
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {p.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-3 text-sm">
                {p.links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
