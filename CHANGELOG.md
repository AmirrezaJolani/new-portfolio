# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.7] - 2026-11-27

### Added
- **Link previews**: sharing the site on LinkedIn, Telegram, Slack or X now shows a 1200×630 card,
  a screenshot of the pixel-art island with the name, job title and domain in the game's pixel
  font. Both `/` and `/cv` have it.
- `robots.txt` and `sitemap.xml` (`/` and `/cv`), so search engines can find both pages.
- schema.org `Person` structured data (name, job title, Milan, GitHub and LinkedIn), so search
  engines and AI tools know whose site this is.
- Canonical URLs on `www.amirrezajolani.app`, so preview deployments and the bare domain don't
  compete with the real site in search results.

## [1.1.5] - 2026-11-27

### Added
- **Quick view at `/cv`**: the whole portfolio (about, experience, projects, skills,
  testimonials, contact) as one plain, server-rendered page, so recruiters can read it without
  playing the game and search engines can index it. Reuses the game's panel content, with a
  language picker and a "Play the game" link back to `/`.
- "No time to drive? Quick view →" link in the game's intro panel, in all four languages.

### Changed
- Music is now off by default. Returning visitors start with it off too, unless they turn it on;
  achievements, theme and car are still remembered.
- The email address and WhatsApp number are no longer plain text in the page HTML or the JS
  bundle; they are decoded in the browser, which keeps them away from simple spam scrapers.

### Fixed
- Pressing Esc on the intro panel started the music even when it was switched off.

## [1.1.0] - 2026-11-25

### Added
- Pixel-art favicon of the game's car (SVG, ICO and Apple touch icon), replacing the
  Create Next App default.

### Changed
- CV and content: AWS removed from the bio, AI text and skills in all four languages; new CV PDF.
- README live link now points to amirrezajolani.app.

## [1.0.0] - 2026-11-24

### ⚠ Breaking Changes
- The macOS-style `/desktop` portfolio has been removed; `/desktop` now returns 404. Pixel Drive
  at `/` is the only page (#12).

### Added
- **Pixel Drive** homepage: a pixel-art driving game where each building is a portfolio chapter
  (about, experience, projects, skills, testimonials, contact), with achievements, a map with fast
  travel, a garage of cars, day/sunset/night themes and touch controls (#11).
- Drift physics: the car keeps momentum and slides in fast turns, more on grass and sand, and
  leaves fading skid marks (#12).
- Stops open on demand: driving onto a pad shows a prompt; press Enter or tap the button to open
  it (#12).
- German and Italian, alongside English and Persian (RTL) (#11).
- Pixel design system (`--px-*` tokens, `DESIGN.md`) and project skills for agents (#11).
- Contact: second GitHub account (AmirrezaJM); Telegram is now @JooliAR.
- Content synced with the latest CV: 5+ years, Pillar ARR 1M€→5M€, AI engineering (Mastra,
  Braintrust, AWS), this portfolio as a project (replacing E-commerce Marketplace), new CV PDF.
- Pixel-art SVG icons (`public/icons/`) replace every emoji in the HUD, panels, achievements and
  touch controls, with tests that keep the folder and the icon list in sync.

### Fixed
- Enter no longer gets swallowed by a HUD button focused by a mouse click (#12).
- `npm ci` on npm 10 (restored a missing lockfile entry) (#12).

[Unreleased]: https://github.com/AmirrezaJolani/new-portfolio/compare/v1.1.7...HEAD
[1.1.7]: https://github.com/AmirrezaJolani/new-portfolio/compare/v1.1.5...v1.1.7
[1.1.5]: https://github.com/AmirrezaJolani/new-portfolio/compare/v1.1.0...v1.1.5
[1.1.0]: https://github.com/AmirrezaJolani/new-portfolio/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/AmirrezaJolani/new-portfolio/releases/tag/v1.0.0
