export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  /** matches the message key under `projects.<id>` */
  id: "p1" | "p2" | "p3";
  tags: string[];
  links: ProjectLink[];
}

export interface SocialLink {
  label: string;
  href: string;
}

/**
 * Async source for the Projects app (consumed via TanStack Query). There is no
 * backend, so this resolves the local project data after a short delay to model
 * a real fetch.
 */
export function fetchProjects(): Promise<Project[]> {
  return new Promise((resolve) => setTimeout(() => resolve(projects), 400));
}

export const projects: Project[] = [
  {
    id: "p1",
    tags: ["TypeScript", "Next.js"],
    links: [{ label: "GitHub", href: "https://github.com" }],
  },
  {
    id: "p2",
    tags: ["React", "Tailwind"],
    links: [{ label: "Live", href: "https://example.com" }],
  },
  {
    id: "p3",
    tags: ["Node", "API"],
    links: [{ label: "GitHub", href: "https://github.com" }],
  },
];

export const skills: string[] = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Tailwind CSS",
  "PostgreSQL",
];

export const socials: SocialLink[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/amirjm/" },
  { label: "GitHub", href: "https://github.com/AmirrezaJolani" },
];

export const contactEmail = "amirreza.jolani1998@gmail.com";
