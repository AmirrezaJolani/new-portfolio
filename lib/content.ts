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
  { label: "GitHub", href: "https://github.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
];

export const contactEmail = "you@example.com";
