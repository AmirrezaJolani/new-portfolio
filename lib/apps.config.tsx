import type { AppId, Geometry } from "@/types";

export interface DesktopApp {
  id: AppId;
  /** message key under `apps.<id>` */
  titleKey: AppId;
  defaultGeometry: Geometry;
}

// Icon artwork lives in `features/desktop/components/appLogos.tsx`, keyed by
// `id` — presentation stays in the feature layer; this config owns the app list.
export const apps: DesktopApp[] = [
  {
    id: "about",
    titleKey: "about",
    defaultGeometry: { x: 120, y: 90, width: 520, height: 380 },
  },
  {
    id: "projects",
    titleKey: "projects",
    defaultGeometry: { x: 200, y: 130, width: 640, height: 460 },
  },
  {
    id: "contact",
    titleKey: "contact",
    defaultGeometry: { x: 280, y: 160, width: 460, height: 480 },
  },
  {
    id: "settings",
    titleKey: "settings",
    defaultGeometry: { x: 240, y: 110, width: 720, height: 480 },
  },
];

export function getApp(id: AppId): DesktopApp {
  const app = apps.find((a) => a.id === id);
  if (!app) throw new Error(`Unknown app: ${id}`);
  return app;
}
