"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BUILDINGS,
  CARS,
  type Car,
  type CarModel,
  type Input,
  LANDMARKS,
  LIGHTHOUSE,
  padAt,
  padCenter,
  type SectionId,
  SPAWN,
  type Structure,
  stepCar,
  stickInput,
  TILE,
  tileAt,
  WORLD_H,
  WORLD_W,
} from "@/workflows/driveWorld";
import {
  ACHIEVEMENTS,
  type AchievementId,
  METERS_PER_PX,
} from "../lib/achievements";
import { setMusic, sfx } from "../lib/audio";
import {
  createAssets,
  labelTop,
  renderFrame,
  SKID_LIFE,
  type Skid,
  THEMES,
  type Theme,
} from "../lib/render";
import { Icon } from "./Icon";
import { LanguagePicker } from "./LanguagePicker";
import { Panel, type PanelKind } from "./Panel";
import { TouchControls } from "./TouchControls";

const KEYS: Record<string, keyof Input> = {
  ArrowUp: "up",
  KeyW: "up",
  ArrowDown: "down",
  KeyS: "down",
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
};

const STORE = "sunset-island:v1";
type Saved = {
  achievements: AchievementId[];
  theme: Theme;
  // Was `music`, saved as true for everyone while music defaulted on; the new
  // key means only an explicit choice is remembered.
  musicOn: boolean;
  car: CarModel["id"];
};

function load(): Partial<Saved> {
  try {
    return JSON.parse(localStorage.getItem(STORE) ?? "{}");
  } catch {
    return {};
  }
}

const clampCam = (v: number, view: number, world: number) =>
  world <= view ? (world - view) / 2 : Math.min(Math.max(v, 0), world - view);

// Floating signs: the six stops, then the Milan landmarks.
const SIGNS: (Structure & { id?: SectionId; accent?: string })[] = [
  ...BUILDINGS,
  ...LANDMARKS.filter((l) => l.sign),
];

export function Game() {
  const t = useTranslations("drive");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const input = useRef<Input>({
    up: false,
    down: false,
    left: false,
    right: false,
  });
  const stick = useRef({ x: 0, y: 0 }); // touch joystick, -1..1
  const speedRef = useRef<HTMLSpanElement>(null);
  const car = useRef<Car>({ ...SPAWN, speed: 0 });
  const lastPad = useRef<SectionId | null>(null); // the pad the car is on now
  const skids = useRef<Skid[]>([]);
  const [zone, setZone] = useState<SectionId | null>(null); // mirrors lastPad for the prompt
  const [panel, setPanel] = useState<PanelKind | null>("intro");
  const [visited, setVisited] = useState<Set<SectionId>>(new Set());
  const [theme, setTheme] = useState<Theme>("sunset");
  const [music, setMusicOn] = useState(false); // opt-in: no surprise sound at work
  const [unlocked, setUnlocked] = useState<Set<AchievementId>>(new Set());
  const [model, setModel] = useState<CarModel["id"]>("coupe");
  const [toasts, setToasts] = useState<{ key: number; id: AchievementId }[]>(
    [],
  );

  // The rAF loop reads these through refs so it never needs restarting.
  const panelRef = useRef(panel);
  const themeRef = useRef(theme);
  const visitedRef = useRef(visited);
  const unlockedRef = useRef(unlocked);
  const modelRef = useRef(model);
  const musicRef = useRef(music);
  useEffect(() => {
    panelRef.current = panel;
    themeRef.current = theme;
    modelRef.current = model;
    musicRef.current = music;
  }, [panel, theme, model, music]);

  // Restore progress + preferences once on mount (localStorage is client-only).
  useEffect(() => {
    const s = load();
    unlockedRef.current = new Set(s.achievements ?? []);
    setUnlocked(unlockedRef.current);
    if (s.theme && THEMES.includes(s.theme)) setTheme(s.theme);
    if (s.musicOn) setMusicOn(true);
    if (CARS.some((c) => c.id === s.car)) setModel(s.car!);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORE,
        JSON.stringify({
          achievements: [...unlocked],
          theme,
          musicOn: music,
          car: model,
        } satisfies Saved),
      );
    } catch {}
  }, [unlocked, theme, music, model]);

  const unlock = useCallback((id: AchievementId) => {
    if (unlockedRef.current.has(id)) return;
    unlockedRef.current = new Set(unlockedRef.current).add(id);
    setUnlocked(unlockedRef.current);
    const key = Date.now() + Math.random();
    setToasts((t) => [...t, { key, id }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.key !== key)), 3500);
    sfx("unlock");
  }, []);

  const open = useCallback(
    (id: SectionId) => {
      setPanel(id);
      sfx("arrive");
      if (!visitedRef.current.has(id)) {
        visitedRef.current = new Set(visitedRef.current).add(id);
        setVisited(visitedRef.current);
        unlock("first-stop");
        if (visitedRef.current.size === BUILDINGS.length) unlock("grand-tour");
      }
    },
    [unlock],
  );

  // Fast travel: drop the car on the pad, facing the building, and open it.
  const go = useCallback(
    (id: SectionId) => {
      const b = BUILDINGS.find((x) => x.id === id)!;
      car.current = { ...padCenter(b), angle: 0, speed: 0 };
      lastPad.current = id;
      setZone(id);
      open(id);
    },
    [open],
  );

  const toggleMusic = () => {
    setMusic(!music);
    setMusicOn(!music);
    if (!music) unlock("dj");
  };

  const cycleTheme = () => {
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    setTheme(next);
    if (next === "night") unlock("night-owl");
  };

  const pickCar = (id: CarModel["id"]) => {
    setModel(id);
    if (id !== "coupe") unlock("test-drive");
  };

  const closePanel = () => {
    if (panel === "intro" && music) setMusic(true); // first user gesture → audio may start
    setPanel(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const g = canvas.getContext("2d")!;
    let assets = createAssets(themeRef.current);
    let scale = 3;
    let vw = 0;
    let vh = 0;
    let meters = 0;
    const cam = { x: SPAWN.x, y: SPAWN.y };

    const resize = () => {
      // Aim for ~460 world px across (~300 on phones). Each world pixel is a
      // whole number of *device* pixels, so it stays crisp on 2×/3× screens.
      const dpr = window.devicePixelRatio || 1;
      const target = window.innerWidth < 700 ? 300 : 460;
      const k = Math.max(1, Math.round((window.innerWidth * dpr) / target));
      vw = Math.ceil((window.innerWidth * dpr) / k);
      vh = Math.ceil((window.innerHeight * dpr) / k);
      scale = k / dpr; // CSS px per world px (used to place the DOM signs)
      canvas.width = vw;
      canvas.height = vh;
      canvas.style.width = `${vw * scale}px`;
      canvas.style.height = `${vh * scale}px`;
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (assets.theme !== themeRef.current)
        assets = createAssets(themeRef.current);

      const paused = panelRef.current !== null;
      const prev = car.current;
      const spec = CARS.find((m) => m.id === modelRef.current)!;
      // Keyboard and joystick combine; braking always wins over the stick's throttle.
      const k = input.current;
      const st = stickInput(stick.current.x, stick.current.y, prev.angle);
      const inp = {
        up: (k.up || st.up) && !k.down,
        down: k.down,
        left: k.left || st.left,
        right: k.right || st.right,
      };
      const c = paused
        ? { ...prev, speed: 0, side: 0 }
        : stepCar(prev, inp, dt, spec);
      car.current = c;
      // Tyres leave marks while the car slides sideways; oldest fade first.
      if (Math.abs(c.side ?? 0) > 22) {
        skids.current.push({ x: c.x, y: c.y, a: c.angle, t: now / 1000 });
      }
      while (skids.current[0]?.t < now / 1000 - SKID_LIFE)
        skids.current.shift();

      // km/h with 1px = 0.25 m: px/s × 0.25 × 3.6.
      const kmh = `${c.speed < -1 ? "R " : ""}${Math.round(Math.abs(c.speed) * 0.9)}`;
      if (speedRef.current && speedRef.current.textContent !== kmh)
        speedRef.current.textContent = kmh;

      if (!paused) {
        if (inp.up) unlock("ignition");
        if (c.speed >= spec.top - 1) unlock("speed");
        if (prev.speed > 40 && c.speed <= 0 && !inp.down) {
          sfx("bump");
          if (prev.speed > 90) unlock("bump");
        }
        const here = tileAt(Math.floor(c.x / TILE), Math.floor(c.y / TILE));
        if (here === "sand") unlock("beach");
        if (here === "plaza") unlock("milano");
        if (
          Math.hypot(
            c.x - (LIGHTHOUSE.tx + 0.5) * TILE,
            c.y - (LIGHTHOUSE.ty + 0.5) * TILE,
          ) < 48
        )
          unlock("lighthouse");
        meters += Math.hypot(c.x - prev.x, c.y - prev.y) * METERS_PER_PX;
        if (meters >= 1000) unlock("road-trip");
      }

      // Rolling onto a pad only offers the stop; Enter or the prompt opens it.
      const pad = padAt(c.x, c.y);
      if (pad !== lastPad.current) {
        lastPad.current = pad;
        setZone(pad);
      }

      // Smooth follow camera with a little look-ahead.
      const lookX = c.x + Math.sin(c.angle) * c.speed * 0.25 - vw / 2;
      const lookY = c.y - Math.cos(c.angle) * c.speed * 0.25 - vh / 2;
      cam.x += (clampCam(lookX, vw, WORLD_W) - cam.x) * Math.min(1, dt * 5);
      cam.y += (clampCam(lookY, vh, WORLD_H) - cam.y) * Math.min(1, dt * 5);

      let target = null;
      let best = Infinity;
      for (const b of BUILDINGS) {
        if (visitedRef.current.has(b.id)) continue;
        const p = padCenter(b);
        const d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2;
        if (d < best) [best, target] = [d, p];
      }

      renderFrame(
        g,
        assets,
        {
          car: c,
          model: spec.id,
          cam,
          t: now / 1000,
          target,
          pad,
          skids: skids.current,
        },
        vw,
        vh,
      );

      // Floating building signs are DOM so the pixel font stays razor sharp.
      SIGNS.forEach((b, i) => {
        const el = labelRefs.current[i];
        if (!el) return;
        const x = ((b.x + b.w / 2) * TILE - Math.round(cam.x)) * scale;
        const y = (labelTop(b) - Math.round(cam.y)) * scale;
        el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
      });

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [unlock]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = KEYS[e.code];
      if (k) {
        input.current[k] = e.type === "keydown";
        if (panelRef.current === null) e.preventDefault();
      }
      if (e.type !== "keydown") return;
      if (e.code === "Escape") {
        if (panelRef.current === "intro" && musicRef.current) setMusic(true);
        setPanel(null);
      }
      if (e.code === "KeyM") setPanel((p) => (p === "menu" ? null : "menu"));
      if (e.code === "KeyG")
        setPanel((p) => (p === "garage" ? null : "garage"));
      // Enter on a pad opens that stop, unless Enter is pressing a focused control.
      const onControl =
        e.target instanceof Element &&
        e.target.closest("button, a, select, input, textarea");
      if (
        (e.code === "Enter" || e.code === "NumpadEnter") &&
        !e.repeat &&
        !onControl &&
        panelRef.current === null &&
        lastPad.current
      ) {
        e.preventDefault();
        open(lastPad.current);
      }
    };
    const reset = () => {
      input.current = { up: false, down: false, left: false, right: false };
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    // A mouse click leaves its HUD button focused, which would swallow Enter on
    // the next pad. Keyboard activation (detail 0) keeps its focus.
    const onClick = (e: MouseEvent) => {
      if (e.detail > 0 && e.target instanceof Element)
        e.target.closest<HTMLElement>("header button")?.blur();
    };
    window.addEventListener("blur", reset);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      window.removeEventListener("blur", reset);
      window.removeEventListener("click", onClick);
    };
  }, [open]);

  useEffect(() => () => setMusic(false), []);

  return (
    <main className="drive-root fixed inset-0 overflow-hidden bg-(--px-sky) select-none touch-none">
      {/* World layer: physical (canvas) coordinates, so it stays LTR under RTL locales. */}
      <div dir="ltr" className="absolute inset-0">
        <canvas
          ref={canvasRef}
          className="pixelated block"
          aria-label={t("hud.canvas")}
        />
        <div className={`grade grade-${theme}`} aria-hidden />

        {SIGNS.map((b, i) => (
          <div
            key={b.id ?? b.kind}
            ref={(el) => {
              labelRefs.current[i] = el;
            }}
            className="absolute start-0 top-0 font-pixel text-[9px] sm:text-[10px] px-1.5 py-1 whitespace-nowrap pointer-events-none text-(--px-ink)"
            style={{
              background: b.accent ?? "var(--px-paper)",
              boxShadow: "0 3px 0 var(--px-ink)",
            }}
          >
            {b.id && visited.has(b.id) && (
              <Icon name="check" className="me-1" label={t("status.visited")} />
            )}
            <span dir="auto">{t(`signs.${b.id ?? (b.kind as "duomo")}`)}</span>
          </div>
        ))}
      </div>

      <header className="absolute top-3 inset-x-3 flex justify-between items-start gap-3 z-10">
        <div className="pixel-box px-2 py-1.5 sm:px-3 sm:py-2 shrink-0">
          <p className="font-pixel text-[8px] sm:text-[10px] text-(--px-amber)">
            {t("hud.brand")}
          </p>
          <p className="text-base sm:text-lg leading-none mt-1">
            <span className="sr-only sm:not-sr-only">
              {t("hud.stopsVisited")}{" "}
            </span>
            <Icon name="pin" /> {visited.size}/{BUILDINGS.length}
          </p>
        </div>
        {/* Icons only on phones; labels from sm up. */}
        <nav
          className="flex flex-wrap justify-end gap-2"
          aria-label={t("hud.options")}
        >
          <button
            type="button"
            onClick={() => setPanel("menu")}
            className="pixel-btn"
            aria-label={t("hud.mapAria")}
          >
            <Icon name="map" />
            <span className="hidden sm:inline"> {t("hud.map")}</span>
          </button>
          <button
            type="button"
            onClick={() => setPanel("garage")}
            className="pixel-btn"
            aria-label={t("hud.garageAria")}
          >
            <Icon name="car" />
            <span className="hidden sm:inline"> {t("hud.garage")}</span>
          </button>
          <button
            type="button"
            onClick={() => setPanel("trophies")}
            className="pixel-btn"
            aria-label={t("hud.trophiesAria", {
              count: unlocked.size,
              total: ACHIEVEMENTS.length,
            })}
          >
            <Icon name="trophy" />
            <span className="hidden sm:inline">
              {" "}
              {unlocked.size}/{ACHIEVEMENTS.length}
            </span>
          </button>
          <button
            type="button"
            onClick={cycleTheme}
            className="pixel-btn"
            aria-label={t("hud.themeAria", { theme: t(`themes.${theme}`) })}
          >
            <Icon
              name={
                theme === "day" ? "sun" : theme === "night" ? "moon" : "sunset"
              }
            />
            <span className="hidden sm:inline"> {t(`themes.${theme}`)}</span>
          </button>
          <button
            type="button"
            onClick={toggleMusic}
            className="pixel-btn"
            aria-pressed={music}
            aria-label={t("hud.music")}
          >
            <Icon name={music ? "note" : "mute"} />
            <span className="hidden sm:inline">
              {" "}
              {music ? t("hud.on") : t("hud.off")}
            </span>
          </button>
          <LanguagePicker />
        </nav>
      </header>

      <ol
        className="absolute top-20 inset-x-0 flex flex-col items-center gap-2 z-30 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map(({ key, id }) => {
          const a = ACHIEVEMENTS.find((x) => x.id === id);
          if (!a) return null;
          return (
            <li
              key={key}
              className="pixel-box toast flex items-center gap-3 px-3 py-2"
            >
              <Icon name={a.icon} size={32} />
              <span>
                <span className="block font-pixel text-[9px] text-(--px-gold)">
                  {t("hud.unlocked")}
                </span>
                <span className="block text-xl leading-none">
                  {t(`achievements.${a.id}.title`)}
                </span>
              </span>
            </li>
          );
        })}
      </ol>

      <p className="absolute bottom-3 inset-x-0 text-center text-lg text-(--px-cream) drop-shadow-[2px_2px_0_var(--px-ink)] pointer-coarse:hidden">
        {t("hud.hint")}
      </p>

      {/* Pad prompt: Enter on a keyboard, or tap/click this button. */}
      <div
        aria-live="polite"
        className="absolute inset-x-0 bottom-14 pointer-coarse:bottom-44 flex justify-center z-10 pointer-events-none"
      >
        {zone && panel === null && (
          <button
            type="button"
            onClick={() => open(zone)}
            className="pixel-btn toast pointer-events-auto flex items-center gap-2 pointer-coarse:min-h-11 pointer-coarse:px-5"
            style={{
              ["--px-accent" as string]: BUILDINGS.find((b) => b.id === zone)
                ?.accent,
            }}
          >
            <kbd className="pointer-coarse:hidden bg-(--px-ink) text-(--px-cream) px-1.5 py-0.5">
              ⏎ {t("hud.enterKey")}
            </kbd>
            <span>{t("hud.visit", { place: t(`signs.${zone}`) })}</span>
          </button>
        )}
      </div>

      {/* Speedometer: bottom-start on desktop, bottom-centre between the thumbs on touch. */}
      <div
        className="pixel-box absolute bottom-4 start-4 pointer-coarse:inset-x-0 pointer-coarse:mx-auto pointer-coarse:w-fit pointer-coarse:bottom-8 px-3 py-1 text-center z-10"
        aria-hidden
      >
        <span
          ref={speedRef}
          className="block text-4xl leading-none tabular-nums"
        >
          0
        </span>
        <span className="block font-pixel text-[8px] text-(--px-amber)">
          {t("hud.kmh")}
        </span>
      </div>

      <TouchControls
        onStick={(x, y) => {
          stick.current = { x, y };
        }}
        onBrake={(on) => {
          input.current.down = on;
        }}
      />

      {panel && (
        <Panel
          kind={panel}
          visited={visited}
          unlocked={unlocked}
          model={model}
          onPickCar={pickCar}
          onClose={closePanel}
          onGo={(id) => {
            if (panel === "menu") unlock("teleport");
            if (panel === "intro" && music) setMusic(true);
            go(id);
          }}
          onContact={() => unlock("hello")}
        />
      )}
    </main>
  );
}
