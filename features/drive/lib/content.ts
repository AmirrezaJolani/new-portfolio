// Pixel-drive portfolio data. Prose lives in messages/<locale>.json under
// `drive.*`, keyed by the ids below; this file holds only what doesn't
// translate (names, tags, links, numbers).

export const profile = {
  name: "Amirreza Jolani Mameghani",
  /** Canonical origin (the apex domain 308s here): metadataBase, sitemap, robots, JSON-LD. */
  site: "https://www.amirrezajolani.app",
  cv: "/Amirreza_Jolani_CV.pdf",
  github: "https://github.com/AmirrezaJolani",
  linkedin: "https://www.linkedin.com/in/amirjm/",
  /** drive.profile.stats.<id> */
  stats: [
    { id: "arr", value: "1M€→5M€" },
    { id: "years", value: "5+" },
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
      "Mastra",
      "Braintrust",
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
    id: "portfolio",
    name: "Pixel Drive Portfolio",
    tags: [
      "Next.js 16",
      "TypeScript",
      "Canvas",
      "next-intl",
      "Vitest",
      "Docker",
    ],
    url: "https://github.com/AmirrezaJolani/new-portfolio",
  },
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
    items: ["Docker", "GitHub Actions", "Vercel", "pnpm monorepos", "Biome"],
  },
  {
    id: "ai",
    level: 80,
    items: [
      "Mastra",
      "Braintrust",
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

/**
 * Label: drive.contact.<id>. `value` null = translated drive.contact.<id>Value.
 * `encoded`: value/href are base64 and decoded in the browser after hydration
 * (Panel's ContactLink), so the email and phone number are not plain text in
 * the HTML or the JS bundle.
 * ponytail: stops regex scrapers, not ones that run JS; a contact form if spam persists.
 */
export const contact = [
  {
    id: "email",
    value: "YW1pcnJlemEuam9sYW5pMTk5OEBnbWFpbC5jb20=",
    href: "bWFpbHRvOmFtaXJyZXphLmpvbGFuaTE5OThAZ21haWwuY29t",
    encoded: true,
  },
  { id: "telegram", value: "@JooliAR", href: "https://t.me/JooliAR" },
  {
    id: "whatsapp",
    value: null,
    href: "aHR0cHM6Ly93YS5tZS8zOTM3MTY3NjkwOTQ=",
    encoded: true,
  },
  { id: "linkedin", value: "in/amirjm", href: profile.linkedin },
  { id: "github", value: "AmirrezaJolani", href: profile.github },
  { id: "github2", value: "AmirrezaJM", href: "https://github.com/AmirrezaJM" },
] as const;
