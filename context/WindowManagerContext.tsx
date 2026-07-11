"use client";

import { createContext, useContext, useMemo, useReducer } from "react";
import type { AppId, Geometry } from "@/types";
import {
  initialWindowState,
  type WindowState,
  windowReducer,
} from "@/workflows/windowManager";

interface WindowManagerValue {
  windows: WindowState[];
  focusedId: string | null;
  open: (appId: AppId, geometry: Geometry) => void;
  close: (id: string) => void;
  minimize: (id: string) => void;
  focus: (id: string) => void;
  move: (id: string, x: number, y: number) => void;
  resize: (id: string, width: number, height: number) => void;
  isOpen: (appId: AppId) => boolean;
}

const WindowManagerContext = createContext<WindowManagerValue | null>(null);

export function WindowManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(windowReducer, initialWindowState);

  const value = useMemo<WindowManagerValue>(
    () => ({
      windows: state.windows,
      focusedId: state.focusedId,
      open: (appId, geometry) => dispatch({ type: "open", appId, geometry }),
      close: (id) => dispatch({ type: "close", id }),
      minimize: (id) => dispatch({ type: "minimize", id }),
      focus: (id) => dispatch({ type: "focus", id }),
      move: (id, x, y) => dispatch({ type: "move", id, x, y }),
      resize: (id, width, height) =>
        dispatch({ type: "resize", id, width, height }),
      isOpen: (appId) => state.windows.some((w) => w.id === appId),
    }),
    [state],
  );

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  );
}

export function useWindowManager(): WindowManagerValue {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) {
    throw new Error(
      "useWindowManager must be used within WindowManagerProvider",
    );
  }
  return ctx;
}
