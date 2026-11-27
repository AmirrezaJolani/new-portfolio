import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BUILDINGS } from "@/workflows/driveWorld";
import { profile } from "../lib/content";
import { fontVars } from "./DrivePage";
import { LanguagePicker } from "./LanguagePicker";
import { Section } from "./Panel";

// The whole portfolio as one plain, server-rendered page: same sections and
// copy as the game's panels, no driving required.
export async function CvPage() {
  const t = await getTranslations("drive");
  return (
    <main
      className={`${fontVars} drive-root min-h-dvh bg-(--px-sky) px-4 py-8 text-xl`}
    >
      <div className="mx-auto max-w-3xl space-y-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl leading-none">{profile.name}</h1>
            <p className="mt-2 font-pixel text-(--px-amber) text-[10px]">
              {t("profile.title").toUpperCase()} ·{" "}
              {t("profile.location").toUpperCase()}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <LanguagePicker />
            <Link href="/" className="pixel-btn">
              {t("cv.play")}
            </Link>
          </div>
        </header>
        {BUILDINGS.map((b) => (
          <section
            key={b.id}
            aria-labelledby={`cv-${b.id}`}
            style={{ ["--px-accent" as string]: b.accent }}
            className="pixel-box p-5"
          >
            <h2
              id={`cv-${b.id}`}
              className="mb-4 font-pixel text-(--px-accent) text-sm sm:text-base"
            >
              {t(`menu.${b.id}`)}
            </h2>
            <Section id={b.id} />
          </section>
        ))}
      </div>
    </main>
  );
}
