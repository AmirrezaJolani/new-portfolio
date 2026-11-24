---
name: editing-portfolio-content
description: Use when changing what the portfolio says about Amirreza — a job, project, skill, testimonial, stat, bio line, contact link or the CV PDF — in the Pixel Drive game.
---

# Editing portfolio content

## Overview

Content is split in two: **data that doesn't translate** lives in TypeScript, **prose** lives in
`messages/{en,fa,de,it}.json`, joined by an `id`. Changing one side without the other renders
a raw key like `drive.experience.acme.role` on screen, or fails the parity test.

## Where things live

Data: `features/drive/lib/content.ts`. Prose: the `drive.*` namespace.

| What | Data (ids, tags, links, numbers) | Prose |
|------|----------------------------------|-------|
| Experience entry | `experience[]` `{ id, company, tags }` | `drive.experience.<id>.{years,kind,role,text}` |
| Project | `projects[]` `{ id, name, tags, url }` | `drive.projects.<id>.{badge,text}` |
| Skill group | `skills[]` `{ id, level, items }` | `drive.skills.<id>` |
| Testimonial | `testimonials[]` `{ id, name }` | `drive.testimonials.<id>.{quote,role}` |
| Stat / pillar | `profile.stats[]` / `profile.pillars` | `drive.profile.stats.<id>` / `.pillars.<id>` |
| Contact row | `contact[]` (`value: null` = translated) | `drive.contact.<id>` (+ `<id>Value`) |
| CV download | `public/Amirreza_Jolani_CV.pdf` (path in `profile.cv`) | — |

Copy an existing entry's exact key shape from `messages/en.json` before adding a new one.

## Steps

1. Add/edit the entry in the `.ts` file (keep `as const`; the id is the message key).
2. Add the same keys to **all four** catalogs. de/it/fa follow en's key order.
   Persian prose is RTL; keep numbers, money and handles as-is (the UI forces `dir="ltr"` on them).
3. Removing an entry? Delete its keys from all four catalogs too.
4. `npm test` — `i18n/messages.test.ts` fails on any missing or extra key.
5. Look at it: **REQUIRED SUB-SKILL:** use `verifying-a-change` (open the matching panel in
   at least `en` and `fa`).

## Common mistakes

- Putting a company name or tag into messages: names and tags are data, not copy.
- Translating only `en` "for now": the parity test fails CI.
- Gendered job titles in de/it: prefer a neutral form ("Projektmanagement") unless the person's
  own title is known.
- Personal data: only public contact details go in; never a work email.
