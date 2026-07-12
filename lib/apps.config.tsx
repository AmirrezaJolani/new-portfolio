import type { LucideIcon } from "lucide-react";
import { FolderKanban, Mail, Settings, User } from "lucide-react";
import type { AppId, Geometry } from "@/types";

export interface DesktopApp {
  id: AppId;
  /** message key under `apps.<id>` */
  titleKey: AppId;
  icon: LucideIcon;
  /** Tailwind gradient classes for the app's icon tile (dock + desktop + mobile). */
  tile: string;
  defaultGeometry: Geometry;
}

export const apps: DesktopApp[] = [
  {
    id: "about",
    titleKey: "about",
    icon: User,
    tile: "from-sky-400 to-blue-600",
    defaultGeometry: { x: 120, y: 90, width: 520, height: 380 },
  },
  {
    id: "projects",
    titleKey: "projects",
    icon: FolderKanban,
    tile: "from-amber-400 to-orange-600",
    defaultGeometry: { x: 200, y: 130, width: 640, height: 460 },
  },
  {
    id: "contact",
    titleKey: "contact",
    icon: Mail,
    tile: "from-emerald-400 to-teal-600",
    defaultGeometry: { x: 280, y: 160, width: 460, height: 480 },
  },
  {
    id: "settings",
    titleKey: "settings",
    icon: Settings,
    tile: "from-slate-400 to-slate-600",
    defaultGeometry: { x: 240, y: 110, width: 720, height: 480 },
  },
];

export function getApp(id: AppId): DesktopApp {
  const app = apps.find((a) => a.id === id);
  if (!app) throw new Error(`Unknown app: ${id}`);
  return app;
}
