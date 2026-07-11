import type { LucideIcon } from "lucide-react";
import { FolderKanban, Mail, User } from "lucide-react";
import type { AppId, Geometry } from "@/types";

export interface DesktopApp {
  id: AppId;
  /** message key under `apps.<id>` */
  titleKey: AppId;
  icon: LucideIcon;
  defaultGeometry: Geometry;
}

export const apps: DesktopApp[] = [
  {
    id: "about",
    titleKey: "about",
    icon: User,
    defaultGeometry: { x: 120, y: 90, width: 520, height: 380 },
  },
  {
    id: "projects",
    titleKey: "projects",
    icon: FolderKanban,
    defaultGeometry: { x: 200, y: 130, width: 640, height: 460 },
  },
  {
    id: "contact",
    titleKey: "contact",
    icon: Mail,
    defaultGeometry: { x: 280, y: 160, width: 460, height: 480 },
  },
];

export function getApp(id: AppId): DesktopApp {
  const app = apps.find((a) => a.id === id);
  if (!app) throw new Error(`Unknown app: ${id}`);
  return app;
}
