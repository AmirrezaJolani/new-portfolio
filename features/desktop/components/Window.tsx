"use client";

import { useTranslations } from "next-intl";
import { useWindowManager } from "@/context/WindowManagerContext";
import { getApp } from "@/lib/apps.config";
import type { WindowState } from "@/workflows/windowManager";
import { useDrag } from "@/features/desktop/hooks/useDrag";

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
  const { move, resize, focus, close, minimize, focusedId } = useWindowManager();
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
      resize(win.id, Math.max(MIN_W, startSize.w + dx), Math.max(MIN_H, startSize.h + dy)),
  });

  if (win.isMinimized) return null;

  return (
    <div
      role="dialog"
      aria-label={t(app.titleKey)}
      onPointerDown={() => focus(win.id)}
      style={{ left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.zIndex }}
      className={`absolute flex flex-col overflow-hidden rounded-xl border border-black/10 bg-white/90 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/90 ${
        isFocused ? "ring-1 ring-black/10" : "opacity-95"
      }`}
    >
      <div
        onPointerDown={titleDrag.onPointerDown}
        className="flex h-9 shrink-0 items-center gap-2 border-b border-black/5 bg-zinc-100/80 px-3 dark:border-white/5 dark:bg-zinc-800/80"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Close"
            onClick={() => close(win.id)}
            onPointerDown={(e) => e.stopPropagation()}
            className="size-3 rounded-full bg-red-500 transition hover:brightness-90"
          />
          <button
            type="button"
            aria-label="Minimize"
            onClick={() => minimize(win.id)}
            onPointerDown={(e) => e.stopPropagation()}
            className="size-3 rounded-full bg-yellow-500 transition hover:brightness-90"
          />
          <span className="size-3 rounded-full bg-green-500/70" />
        </div>
        <span className="pointer-events-none mx-auto pe-12 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          {t(app.titleKey)}
        </span>
      </div>

      <div className="flex-1 overflow-auto p-5 text-zinc-800 dark:text-zinc-100">
        {children}
      </div>

      <div
        onPointerDown={resizeDrag.onPointerDown}
        className="absolute bottom-0 end-0 size-4 cursor-nwse-resize"
      />
    </div>
  );
}
