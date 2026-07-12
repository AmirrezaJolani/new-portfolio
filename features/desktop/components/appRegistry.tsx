import { AboutApp } from "@/features/about";
import { ContactApp } from "@/features/contact";
import { ProjectsApp } from "@/features/projects";
import { SettingsApp } from "@/features/settings";
import type { AppId } from "@/types";

export const appComponents: Record<AppId, React.ComponentType> = {
  about: AboutApp,
  projects: ProjectsApp,
  contact: ContactApp,
  settings: SettingsApp,
};
