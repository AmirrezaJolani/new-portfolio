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

function bringToFront(
  state: WindowManagerState,
  id: string,
): WindowManagerState {
  const z = state.nextZIndex;
  return {
    ...state,
    focusedId: id,
    nextZIndex: z + 1,
    windows: state.windows.map((w) =>
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
      const win: WindowState = {
        id: action.appId,
        appId: action.appId,
        ...action.geometry,
        zIndex: state.nextZIndex,
        isMinimized: false,
      };
      return {
        windows: [...state.windows, win],
        focusedId: win.id,
        nextZIndex: state.nextZIndex + 1,
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
