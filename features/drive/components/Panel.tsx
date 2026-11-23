"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useRef } from "react";
import {
  BUILDINGS,
  CARS,
  type CarModel,
  type SectionId,
} from "@/workflows/driveWorld";
import { ACHIEVEMENTS, type AchievementId } from "../lib/achievements";
import {
  companies,
  contact,
  experience,
  profile,
  projects,
  skills,
  testimonials,
} from "../lib/content";
import { drawCarPreview } from "../lib/render";
import { PixelMe } from "./PixelMe";

const Tag = ({ children }: { children: ReactNode }) => (
  <span className="inline-block border-2 border-current/40 px-1.5 text-base leading-tight opacity-90">
    {children}
  </span>
);

const Out = ({ href, children }: { href: string; children: ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="pixel-btn inline-block"
  >
    {children}
  </a>
);

// A row of pixel segments, `filled` of `total` lit.
const Meter = ({
  label,
  value,
  max,
  segments,
  className,
}: {
  label: string;
  value: number;
  max: number;
  segments: number;
  className: string;
}) => (
  <div className="flex flex-1 gap-0.5">
    <meter
      className="sr-only"
      aria-label={label}
      value={value}
      min={0}
      max={max}
    />
    {Array.from({ length: segments }, (_, i) => i).map((i) => (
      <span
        key={i}
        aria-hidden
        className={`${className} flex-1 ${i < (value / max) * segments ? "bg-(--px-accent)" : "bg-white/10"}`}
      />
    ))}
  </div>
);

function Section({ id }: { id: SectionId }) {
  const t = useTranslations("drive");
  switch (id) {
    case "about":
      return (
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <PixelMe
              label={t("profile.portrait", { name: profile.name })}
              className="h-32 w-24 shrink-0 border-4 border-(--px-accent)"
            />
            <div>
              <p className="font-pixel text-(--px-accent) text-[10px]">
                {t("profile.available")}
              </p>
              <p className="mt-2 text-3xl leading-none">
                {t("profile.tagline")}
              </p>
              <p className="mt-2 opacity-80">
                ⚡ {t("profile.years")} · 📍 {t("profile.location")} · 🚀{" "}
                {t("profile.focus")}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {profile.stats.map((s) => (
              <div key={s.id} className="border-(--px-accent) border-2 p-2">
                {/* Numbers + symbols: keep LTR order under RTL locales. */}
                <p
                  dir="ltr"
                  className="text-(--px-accent) text-xl leading-none sm:text-3xl"
                >
                  {s.value}
                </p>
                <p className="mt-1 font-pixel text-[8px] leading-tight">
                  {t(`profile.stats.${s.id}`).toUpperCase()}
                </p>
              </div>
            ))}
          </div>
          <p>{t("profile.bio")}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {profile.pillars.map((p) => (
              <div key={p} className="border-2 border-current/30 p-2">
                <p className="font-pixel text-(--px-accent) text-[10px]">
                  {t(`profile.pillars.${p}.title`)}
                </p>
                <p className="mt-1 leading-tight">
                  {t(`profile.pillars.${p}.text`)}
                </p>
              </div>
            ))}
          </div>
          <p className="opacity-80">✨ {t("profile.funFact")}</p>
          <div className="flex flex-wrap gap-3">
            <Out href={profile.cv}>{t("profile.cv")}</Out>
            <Out href={profile.github}>GitHub</Out>
            <Out href={profile.linkedin}>LinkedIn</Out>
          </div>
        </div>
      );
    case "experience":
      return (
        <ol className="space-y-4 border-(--px-accent)/50 border-s-4 ps-4">
          {experience.map((e) => (
            <li key={e.id} className="relative">
              <span className="-start-[1.6rem] absolute top-1.5 size-3 bg-(--px-accent)" />
              <p className="font-pixel text-(--px-accent) text-[10px]">
                {t(`experience.${e.id}.years`)} ·{" "}
                {t(`experience.${e.id}.kind`).toUpperCase()}
              </p>
              <p className="text-2xl leading-tight">
                {t(`experience.${e.id}.role`)}{" "}
                <span className="opacity-70">@ {e.company}</span>
              </p>
              <p className="leading-tight">{t(`experience.${e.id}.text`)}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {e.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </li>
          ))}
        </ol>
      );
    case "projects":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <article
              key={p.id}
              className="flex flex-col gap-2 border-2 border-current/30 p-3"
            >
              <p className="font-pixel text-(--px-accent) text-[10px]">
                {t(`projects.${p.id}.badge`).toUpperCase()}
              </p>
              <h3 className="text-2xl leading-none">{p.name}</h3>
              <p className="flex-1 leading-tight">
                {t(`projects.${p.id}.text`)}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {p.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
              <Out href={p.url}>{t("projects.view")}</Out>
            </article>
          ))}
        </div>
      );
    case "skills":
      return (
        <div className="space-y-4">
          {skills.map((s) => (
            <div key={s.id}>
              <div className="flex justify-between font-pixel text-[10px]">
                <span>{t(`skills.${s.id}`)}</span>
                <span className="text-(--px-accent)">{s.level}%</span>
              </div>
              <div className="mt-1 flex">
                <Meter
                  label={t(`skills.${s.id}`)}
                  value={s.level}
                  max={100}
                  segments={20}
                  className="h-3"
                />
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {s.items.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    case "testimonials":
      return (
        <div className="space-y-4">
          {testimonials.map((x) => (
            <figure key={x.id} className="border-2 border-current/30 p-3">
              <blockquote className="text-xl leading-tight">
                “{t(`testimonials.${x.id}.quote`)}”
              </blockquote>
              <figcaption className="mt-2 font-pixel text-(--px-accent) text-[10px]">
                {x.name}{" "}
                <span className="text-current opacity-70">
                  — {t(`testimonials.${x.id}.role`)}
                </span>
              </figcaption>
            </figure>
          ))}
          <p className="font-pixel text-[10px] opacity-80">
            {t("testimonials.companies")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {companies.map((c) => (
              <Tag key={c}>{c}</Tag>
            ))}
          </div>
        </div>
      );
    case "contact":
      return (
        <div className="space-y-3">
          <p>{t("contact.intro", { location: t("profile.location") })}</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {contact.map((c) => (
              <li key={c.id}>
                <a
                  href={c.href}
                  target="_blank"
                  rel="noreferrer"
                  className="block border-2 border-current/30 p-2 hover:border-(--px-accent) hover:text-(--px-accent)"
                >
                  <span className="font-pixel text-(--px-accent) text-[10px]">
                    {t(`contact.${c.id}`).toUpperCase()}
                  </span>
                  <span className="block break-all text-xl" dir="auto">
                    {c.value ?? t(`contact.${c.id}Value`)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      );
  }
}

// Spinning stacked-sprite previews for the garage, one rAF for all cards.
function Garage({
  model,
  onPick,
}: {
  model: CarModel["id"];
  onPick: (id: CarModel["id"]) => void;
}) {
  const t = useTranslations("drive");
  const canvases = useRef<(HTMLCanvasElement | null)[]>([]);
  useEffect(() => {
    let raf = 0;
    const spin = (time: number) => {
      CARS.forEach((c, i) => {
        const el = canvases.current[i];
        if (el) drawCarPreview(el, c.id, time / 1200);
      });
      raf = requestAnimationFrame(spin);
    };
    raf = requestAnimationFrame(spin);
    return () => cancelAnimationFrame(raf);
  }, []);

  const stat = (label: string, value: number) => (
    <div className="flex items-center gap-2">
      <span className="w-16 font-pixel text-[8px]">{label}</span>
      <Meter
        label={label}
        value={value}
        max={10}
        segments={10}
        className="h-2"
      />
    </div>
  );

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {CARS.map((c, i) => {
        const active = c.id === model;
        return (
          <li
            key={c.id}
            className={`flex gap-3 border-2 p-2 ${active ? "border-(--px-accent)" : "border-current/30"}`}
          >
            <canvas
              ref={(el) => {
                canvases.current[i] = el;
              }}
              width={28}
              height={28}
              className="pixelated size-20 shrink-0 bg-black/20"
              aria-hidden
            />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-pixel text-(--px-accent) text-[10px]">
                {t(`cars.${c.id}.name`).toUpperCase()}
              </p>
              <p className="leading-tight">{t(`cars.${c.id}.desc`)}</p>
              {stat(t("garage.speed"), Math.round((c.top / 150) * 10))}
              {stat(t("garage.handling"), Math.round((c.turn / 3.5) * 10))}
              {stat(t("garage.offroad"), Math.round((c.offroad / 1.7) * 10))}
              <button
                type="button"
                onClick={() => onPick(c.id)}
                disabled={active}
                className="pixel-btn mt-1 disabled:opacity-60"
                aria-pressed={active}
              >
                {active ? t("garage.driving") : t("garage.select")}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export type PanelKind = SectionId | "intro" | "menu" | "trophies" | "garage";

type Props = {
  kind: PanelKind;
  onClose: () => void;
  onGo: (id: SectionId) => void;
  onContact: () => void;
  visited: Set<SectionId>;
  unlocked: Set<AchievementId>;
  model: CarModel["id"];
  onPickCar: (id: CarModel["id"]) => void;
};

export function Panel({
  kind,
  onClose,
  onGo,
  onContact,
  visited,
  unlocked,
  model,
  onPickCar,
}: Props) {
  const t = useTranslations("drive");
  const closeRef = useRef<HTMLButtonElement>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: refocus the close button whenever the panel changes
  useEffect(() => closeRef.current?.focus(), [kind]);
  const b = BUILDINGS.find((x) => x.id === kind);
  const accent = b?.accent ?? "#ffb36b";
  const title = b
    ? t(`signs.${b.id}`)
    : t(`panel.${kind as "intro" | "menu" | "trophies" | "garage"}`);

  return (
    // The backdrop is a mouse convenience; Esc and the close button do the same.
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop click-to-close
    // biome-ignore lint/a11y/useKeyWithClickEvents: Esc closes (handled globally)
    <div
      className="absolute inset-0 z-20 grid place-items-center bg-black/40 p-4"
      onClick={onClose}
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: only stops backdrop clicks; the contact capture tracks link opens */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ ["--px-accent" as string]: accent }}
        className="pixel-box max-h-[85dvh] w-full max-w-2xl overflow-y-auto p-5 text-xl"
        onClick={(e) => e.stopPropagation()}
        onClickCapture={(e) => {
          if (kind === "contact" && (e.target as Element).closest("a"))
            onContact();
        }}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-pixel text-(--px-accent) text-sm sm:text-base">
            {title}
          </h2>
          <button
            type="button"
            ref={closeRef}
            onClick={onClose}
            className="pixel-btn font-pixel text-[10px]"
          >
            {kind === "intro" ? t("panel.drive") : t("panel.close")}
          </button>
        </div>

        {kind === "intro" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <PixelMe
                label={t("profile.portrait", { name: profile.name })}
                className="h-24 w-18 shrink-0 border-(--px-accent) border-4"
              />
              <div className="space-y-2">
                <p className="text-3xl leading-none">{profile.name}</p>
                <p className="font-pixel text-(--px-accent) text-[10px]">
                  {t("profile.title").toUpperCase()} ·{" "}
                  {t("profile.location").toUpperCase()}
                </p>
              </div>
            </div>
            <p>{t("intro.welcome")}</p>
            <ul className="leading-tight opacity-90">
              <li>{t("intro.keys")}</li>
              <li>{t("intro.touch")}</li>
              <li>{t("intro.garage")}</li>
              <li>{t("intro.map")}</li>
              <li>{t("intro.extras", { count: ACHIEVEMENTS.length })}</li>
              <li>{t("intro.arrow")}</li>
              <li>{t("intro.wave")}</li>
              <li>{t("intro.milan")}</li>
            </ul>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onClose}
                className="pixel-btn font-pixel text-[10px]"
              >
                {t("intro.start")}
              </button>
              <button
                type="button"
                onClick={() => onGo("about")}
                className="pixel-btn font-pixel text-[10px] opacity-80"
              >
                {t("intro.skip")}
              </button>
            </div>
            <Link
              href="/desktop"
              className="inline-block underline opacity-80 hover:opacity-100"
            >
              {t("intro.classic")}
            </Link>
          </div>
        )}

        {kind === "menu" && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {BUILDINGS.map((x) => (
              <li key={x.id}>
                <button
                  type="button"
                  onClick={() => onGo(x.id)}
                  style={{ borderColor: x.accent }}
                  className="w-full border-2 p-2 text-start hover:bg-white/5"
                >
                  <span
                    className="font-pixel text-[10px]"
                    style={{ color: x.accent }}
                  >
                    {visited.has(x.id) ? "✓ " : "○ "}
                    {t(`signs.${x.id}`)}
                  </span>
                  <span className="block opacity-80">{t(`menu.${x.id}`)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {kind === "trophies" && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {ACHIEVEMENTS.map((a) => {
              const done = unlocked.has(a.id);
              return (
                <li
                  key={a.id}
                  className={`flex items-center gap-3 border-2 p-2 ${done ? "border-(--px-accent)" : "border-current/20 opacity-50"}`}
                >
                  <span className={`text-3xl ${done ? "" : "grayscale"}`}>
                    {done ? a.icon : "🔒"}
                  </span>
                  <span>
                    <span className="block font-pixel text-(--px-accent) text-[10px]">
                      {t(`achievements.${a.id}.title`).toUpperCase()}
                    </span>
                    <span className="block leading-tight">
                      {t(`achievements.${a.id}.desc`)}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {kind === "garage" && <Garage model={model} onPick={onPickCar} />}

        {kind !== "intro" &&
          kind !== "menu" &&
          kind !== "trophies" &&
          kind !== "garage" && <Section id={kind} />}
      </div>
    </div>
  );
}
