import type { AppId, Geometry } from "@/types";

export interface WindowState extends Geometry {
  /** instance id — equals appId (single instance per app) */
  id: string;
  appId: AppId;
  zIndex: number;
  isMinimized: boolean;
}

export interface WindowManagerState {
  windows: WindowState[];
  focusedId: string | null;
  nextZIndex: number;
}

/** Windows start at z-index 100 so they always sit above desktop widgets and
 *  icons (z-10) while staying below the menu bar / dock (z-9999). The value
 *  still increments per focus/open to preserve stacking order. */
export const initialWindowState: WindowManagerState = {
  windows: [],
  focusedId: null,
  nextZIndex: 100,
};

export type WindowAction =
  | { type: "open"; appId: AppId; geometry: Geometry }
  | { type: "close"; id: string }
  | { type: "minimize"; id: string }
  | { type: "restore"; id: string }
  | { type: "focus"; id: string }
  | { type: "move"; id: string; x: number; y: number }
  | { type: "resize"; id: string; width: number; height: number };

const BASE_Z = 100;
/** Compact well before z reaches the reserved menu-bar/dock layer (z-9999). */
const Z_CEILING = 9000;

/**
 * Renumber the (single-instance, so few) windows into a compact `BASE_Z..`
 * range, preserving stacking order, once the counter climbs toward the reserved
 * UI layer. This keeps window z-indices permanently bounded below z-9999 no
 * matter how many open/focus operations occur.
 */
function compact(state: WindowManagerState): WindowManagerState {
  if (state.nextZIndex < Z_CEILING) return state;
  const order = [...state.windows]
    .sort((a, b) => a.zIndex - b.zIndex)
    .map((w) => w.id);
  return {
    ...state,
    windows: state.windows.map((w) => ({
      ...w,
      zIndex: BASE_Z + order.indexOf(w.id),
    })),
    nextZIndex: BASE_Z + order.length,
  };
}

function bringToFront(
  state: WindowManagerState,
  id: string,
): WindowManagerState {
  const s = compact(state);
  const z = s.nextZIndex;
  return {
    ...s,
    focusedId: id,
    nextZIndex: z + 1,
    windows: s.windows.map((w) =>
      w.id === id ? { ...w, zIndex: z, isMinimized: false } : w,
    ),
  };
}

export function windowReducer(
  state: WindowManagerState,
  action: WindowAction,
): WindowManagerState {
  switch (action.type) {
    case "open": {
      const existing = state.windows.find((w) => w.id === action.appId);
      if (existing) return bringToFront(state, action.appId);
      const s = compact(state);
      const win: WindowState = {
        id: action.appId,
        appId: action.appId,
        ...action.geometry,
        zIndex: s.nextZIndex,
        isMinimized: false,
      };
      return {
        windows: [...s.windows, win],
        focusedId: win.id,
        nextZIndex: s.nextZIndex + 1,
      };
    }
    case "close": {
      const windows = state.windows.filter((w) => w.id !== action.id);
      return {
        ...state,
        windows,
        focusedId: state.focusedId === action.id ? null : state.focusedId,
      };
    }
    case "minimize":
      return {
        ...state,
        focusedId: state.focusedId === action.id ? null : state.focusedId,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, isMinimized: true } : w,
        ),
      };
    case "restore":
    case "focus":
      return bringToFront(state, action.id);
    case "move":
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, x: action.x, y: action.y } : w,
        ),
      };
    case "resize":
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id
            ? { ...w, width: action.width, height: action.height }
            : w,
        ),
      };
    default:
      return state;
  }
}
