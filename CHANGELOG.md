# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
- Pixel-art SVG icons (`public/icons/`) replace every emoji in the HUD, panels, achievements and
  touch controls, with tests that keep the folder and the icon list in sync.

### Fixed
- Enter no longer gets swallowed by a HUD button focused by a mouse click (#12).
- `npm ci` on npm 10 (restored a missing lockfile entry) (#12).

[Unreleased]: https://github.com/AmirrezaJolani/new-portfolio/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/AmirrezaJolani/new-portfolio/releases/tag/v1.0.0
