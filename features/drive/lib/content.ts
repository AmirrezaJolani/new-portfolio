// Pixel-drive portfolio data. Prose lives in messages/<locale>.json under
// `drive.*`, keyed by the ids below; this file holds only what doesn't
// translate (names, tags, links, numbers).

export const profile = {
  name: "Amirreza Jolani Mameghani",
  cv: "/Amirreza_Jolani_CV.pdf",
  github: "https://github.com/AmirrezaJolani",
  linkedin: "https://www.linkedin.com/in/amirjm/",
  /** drive.profile.stats.<id> */
  stats: [
    { id: "arr", value: "1M€→4M€" },
    { id: "years", value: "6+" },
    { id: "build", value: "−45%" },
  ],
  /** drive.profile.pillars.<id> */
  pillars: ["product", "fullstack", "ai"],
} as const;

/** drive.experience.<id> */
export const experience = [
  {
    id: "pillar",
    company: "Pillar",
    tags: [
      "Next.js",
      "TypeScript",
      "Supabase",
      "Stripe",
      "PostHog",
      "Playwright",
    ],
  },
  {
    id: "ofoundation",
    company: "OFoundation",
    tags: ["React", "TypeScript", "Sentry", "Docker", "WCAG AA"],
  },
  {
    id: "karhuno",
    company: "Karhuno AI",
    tags: ["Next.js", "Zod", "Playwright"],
  },
  {
    id: "padua",
    company: "University of Padua",
    tags: ["Padua", "Adaptive UX", "Accessibility"],
  },
  {
    id: "pap",
    company: "PAP Group",
    tags: ["Vue.js", "Django", "Tailwind CSS", "VitePress"],
  },
  {
    id: "zharfa",
    company: "Zharfa Academy",
    tags: ["Vue.js", "Python", "Django"],
  },
  {
    id: "almas",
    company: "Almas-Teb-Rayan",
    tags: ["JavaScript", "SCSS", "Chart.js"],
  },
] as const;

/** drive.projects.<id> */
export const projects = [
  {
    id: "appversion",
    name: "AppVersion",
    tags: ["Node.js", "Agent Skills", "SemVer", "GitHub"],
    url: "https://github.com/AmirrezaJolani/appversion-skill",
  },
  {
    id: "nodebase",
    name: "Nodebase",
    tags: ["React Flow", "tRPC", "Prisma", "PostgreSQL", "Better Auth"],
    url: "https://github.com/AmirrezaJolani/nodebase",
  },
  {
    id: "prompter",
    name: "Prompter",
    tags: ["TypeScript", "Django", "PostgreSQL", "Zod", "Docker"],
    url: "https://github.com/AmirrezaJolani/prompter",
  },
  {
    id: "marketplace",
    name: "E-commerce Marketplace",
    tags: ["Python", "Django", "REST API", "Clean Architecture"],
    url: "https://github.com/AmirrezaJolani/ecommerce-marketplace",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs TTS App",
    tags: ["React", "ElevenLabs API", "LangChain", "RAG"],
    url: "https://github.com/AmirrezaJolani/elevenlabs",
  },
] as const;

/** drive.skills.<id> */
export const skills = [
  {
    id: "frontend",
    level: 95,
    items: [
      "React",
      "Next.js",
      "TypeScript",
      "TanStack Query",
      "Zustand",
      "Tailwind",
      "shadcn/ui",
      "Vue / Nuxt",
    ],
  },
  {
    id: "backend",
    level: 85,
    items: [
      "Node.js",
      "Deno",
      "Nest.js",
      "tRPC",
      "Zod",
      "Django",
      "PostgreSQL",
      "Redis",
      "Prisma",
      "Drizzle",
      "Supabase",
    ],
  },
  {
    id: "testing",
    level: 85,
    items: [
      "Playwright",
      "Cypress",
      "Vitest",
      "Sentry",
      "Datadog",
      "PostHog",
      "WCAG AA",
      "Lighthouse",
    ],
  },
  {
    id: "devops",
    level: 75,
    items: [
      "Docker",
      "GitHub Actions",
      "AWS",
      "Vercel",
      "Kubernetes",
      "pnpm monorepos",
      "Biome",
    ],
  },
  {
    id: "ai",
    level: 80,
    items: [
      "Claude Code",
      "Agent Skills",
      "MCP",
      "LangChain",
      "LangGraph.js",
      "Anthropic & OpenAI APIs",
    ],
  },
] as const;

/** drive.testimonials.<id> */
export const testimonials = [
  { id: "clara", name: "Clara Shushunov" },
  { id: "massy", name: "Massy Wahab" },
  { id: "mohammad", name: "Mohammad Baghanbari" },
] as const;

export const companies = [
  "Pillar",
  "OFoundation",
  "Karhuno AI",
  "PAP Group",
  "Zharfa Academy",
  "Almas Teb Rayan",
  "Pody",
];

/** Label: drive.contact.<id>. `value` null = translated drive.contact.<id>Value. */
export const contact = [
  {
    id: "email",
    value: "amirreza.jolani1998@gmail.com",
    href: "mailto:amirreza.jolani1998@gmail.com",
  },
  { id: "telegram", value: "@AmirrezaJMM", href: "https://t.me/AmirrezaJMM" },
  { id: "whatsapp", value: null, href: "https://wa.me/393716769094" },
  { id: "linkedin", value: "in/amirjm", href: profile.linkedin },
  { id: "github", value: "AmirrezaJolani", href: profile.github },
] as const;
