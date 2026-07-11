import { AboutApp } from "@/features/about";
import { ProjectsApp } from "@/features/projects";
import { ContactApp } from "@/features/contact";
import type { AppId } from "@/types";

export const appComponents: Record<AppId, React.ComponentType> = {
  about: AboutApp,
  projects: ProjectsApp,
  contact: ContactApp,
};
