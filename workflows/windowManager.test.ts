import { describe, expect, it } from "vitest";
import type { AppId, Geometry } from "@/types";
import {
  initialWindowState,
  type WindowManagerState,
  windowReducer,
} from "./windowManager";

const geo: Geometry = { x: 10, y: 10, width: 300, height: 200 };

function open(state: WindowManagerState, appId: AppId = "about") {
  return windowReducer(state, { type: "open", appId, geometry: geo });
}

describe("windowReducer", () => {
  it("opens a window, focuses it, and assigns a z-index", () => {
    const s = open(initialWindowState);
    expect(s.windows).toHaveLength(1);
    expect(s.windows[0].appId).toBe("about");
    expect(s.focusedId).toBe("about");
    expect(s.windows[0].zIndex).toBeGreaterThanOrEqual(100);
  });

  it("is single-instance: re-opening focuses and restores the existing window", () => {
    let s = open(initialWindowState);
    s = windowReducer(s, { type: "minimize", id: "about" });
    s = open(s, "about");
    expect(s.windows).toHaveLength(1);
    expect(s.windows[0].isMinimized).toBe(false);
    expect(s.focusedId).toBe("about");
  });

  it("focus raises z-index above all others and sets focusedId", () => {
    let s = open(initialWindowState, "about");
    s = open(s, "projects");
    const projectsZ = s.windows.find((w) => w.appId === "projects")!.zIndex;
    s = windowReducer(s, { type: "focus", id: "about" });
    const aboutZ = s.windows.find((w) => w.appId === "about")!.zIndex;
    expect(aboutZ).toBeGreaterThan(projectsZ);
    expect(s.focusedId).toBe("about");
  });

  it("minimize hides the window and clears focus if it was focused", () => {
    let s = open(initialWindowState, "about");
    s = windowReducer(s, { type: "minimize", id: "about" });
    expect(s.windows[0].isMinimized).toBe(true);
    expect(s.focusedId).toBeNull();
  });

  it("close removes the window", () => {
    let s = open(initialWindowState, "about");
    s = windowReducer(s, { type: "close", id: "about" });
    expect(s.windows).toHaveLength(0);
    expect(s.focusedId).toBeNull();
  });

  it("move and resize update geometry", () => {
    let s = open(initialWindowState, "about");
    s = windowReducer(s, { type: "move", id: "about", x: 50, y: 60 });
    s = windowReducer(s, {
      type: "resize",
      id: "about",
      width: 400,
      height: 300,
    });
    const w = s.windows[0];
    expect([w.x, w.y, w.width, w.height]).toEqual([50, 60, 400, 300]);
  });

  it("closing a non-focused window leaves focusedId intact", () => {
    let s = open(initialWindowState, "about");
    s = open(s, "projects");
    expect(s.focusedId).toBe("projects");
    s = windowReducer(s, { type: "close", id: "about" });
    expect(s.focusedId).toBe("projects");
    expect(s.windows).toHaveLength(1);
  });

  it("minimizing a non-focused window leaves focusedId intact", () => {
    let s = open(initialWindowState, "about");
    s = open(s, "projects");
    expect(s.focusedId).toBe("projects");
    s = windowReducer(s, { type: "minimize", id: "about" });
    expect(s.focusedId).toBe("projects");
    const about = s.windows.find((w) => w.appId === "about")!;
    expect(about.isMinimized).toBe(true);
  });

  it("keeps z-index bounded below the reserved UI layer (9999) after many focus ops", () => {
    let s = open(initialWindowState, "about");
    s = open(s, "projects");
    // Far more operations than it takes to reach the compaction ceiling.
    for (let i = 0; i < 11000; i++) {
      s = windowReducer(s, {
        type: "focus",
        id: i % 2 === 0 ? "about" : "projects",
      });
    }
    for (const w of s.windows) {
      expect(w.zIndex).toBeLessThan(9999);
      expect(w.zIndex).toBeGreaterThanOrEqual(100);
    }
    // Stacking order still holds: the last-focused window (projects) is on top.
    const about = s.windows.find((w) => w.appId === "about")!;
    const projects = s.windows.find((w) => w.appId === "projects")!;
    expect(projects.zIndex).toBeGreaterThan(about.zIndex);
  });
});
