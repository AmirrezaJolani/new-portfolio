"use client";

import { Minus, Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useWindowManager } from "@/context/WindowManagerContext";
import { useDrag } from "@/features/desktop/hooks/useDrag";
import { getApp } from "@/lib/apps.config";
import type { WindowState } from "@/workflows/windowManager";

const MIN_W = 320;
const MIN_H = 240;

export function Window({
  win,
  children,
}: {
  win: WindowState;
  children: React.ReactNode;
}) {
  const t = useTranslations("apps");
  const tWindow = useTranslations("window");
  const { move, resize, focus, close, minimize, focusedId } =
    useWindowManager();
  const app = getApp(win.appId);
  const isFocused = focusedId === win.id;

  const startPos = { x: win.x, y: win.y };
  const startSize = { w: win.width, h: win.height };

  const titleDrag = useDrag({
    onStart: () => focus(win.id),
    onDrag: (dx, dy) => {
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 40;
      const x = Math.min(Math.max(startPos.x + dx, -win.width + 120), maxX);
      const y = Math.min(Math.max(startPos.y + dy, 28), maxY);
      move(win.id, x, y);
    },
  });

  const resizeDrag = useDrag({
    onStart: () => focus(win.id),
    onDrag: (dx, dy) =>
      resize(
        win.id,
        Math.max(MIN_W, startSize.w + dx),
        Math.max(MIN_H, startSize.h + dy),
      ),
  });

  if (win.isMinimized) return null;

  return (
    <div
      role="dialog"
      aria-label={t(app.titleKey)}
      onPointerDown={() => focus(win.id)}
      style={{
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.height,
        zIndex: win.zIndex,
      }}
      className={`lg-glass absolute flex flex-col overflow-hidden rounded-2xl transition-[opacity,filter] duration-150 ${
        isFocused ? "" : "opacity-95 saturate-[0.92]"
      }`}
    >
      <div
        onPointerDown={titleDrag.onPointerDown}
        className="lg-titlebar flex h-9 shrink-0 items-center px-3.5"
      >
        <div className="group/tl flex items-center gap-2">
          <button
            type="button"
            aria-label={tWindow("close")}
            onClick={() => close(win.id)}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex size-3 items-center justify-center rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.15)] transition hover:brightness-95"
          >
            <X
              className="size-2 text-black/55 opacity-0 group-hover/tl:opacity-100"
              strokeWidth={3.5}
            />
          </button>
          <button
            type="button"
            aria-label={tWindow("minimize")}
            onClick={() => minimize(win.id)}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex size-3 items-center justify-center rounded-full bg-[#febc2e] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.15)] transition hover:brightness-95"
          >
            <Minus
              className="size-2 text-black/55 opacity-0 group-hover/tl:opacity-100"
              strokeWidth={3.5}
            />
          </button>
          <span
            role="img"
            aria-label={tWindow("maximize")}
            className="flex size-3 items-center justify-center rounded-full bg-[#28c840] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.15)]"
          >
            <Plus
              className="size-2 text-black/45 opacity-0 group-hover/tl:opacity-100"
              strokeWidth={3.5}
            />
          </span>
        </div>
        <span className="pointer-events-none mx-auto pe-12 text-[13px] font-semibold text-slate-700">
          {t(app.titleKey)}
        </span>
      </div>

      <div className="lg-scroll flex-1 overflow-auto bg-white/45 p-5 text-slate-800">
        {children}
      </div>

      <div
        onPointerDown={resizeDrag.onPointerDown}
        className="absolute bottom-0 end-0 size-4 cursor-nwse-resize"
      />
    </div>
  );
}
