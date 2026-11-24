# Design system

One visual language: **Pixel**, a 16-bit sunset arcade. Chunky, hard-edged, stepped motion.

| | |
|---|---|
| Scope | Everything under `.drive-root` (the game's `<main>`) |
| Tokens | `--px-*` custom properties on `.drive-root` |
| Fonts | Press Start 2P (`--font-pixel`), VT323 (`--font-body`), loaded in `DrivePage.tsx` |
| Corners | Square. Notches come from shadows, never `border-radius` |
| Depth | Hard 0-blur drop (`0 4px 0 var(--px-drop)`) |
| Motion | `steps(n)` animations, 3px press-down on buttons |

Source of truth for every value below: [`app/globals.css`](app/globals.css). Change a value there,
not by hardcoding it in a component.

## Foundations

- **Direction:** logical properties only (`ps/pe/ms/me/start/end/text-start`). Persian flips the
  page through `<html dir>`. Numbers, money, handles and units get `dir="ltr"`. The canvas layer
  is always `dir="ltr"`; RTL text inside it goes in an inner `<span dir="auto">`.
- **Copy:** every visible string and `aria-label` comes from `messages/*.json`.
- **Focus:** always visible. `.pixel-btn` and `.pedal` use `outline: 3px dashed var(--px-focus)`;
  links keep the browser default.
- **Motion:** respect `prefers-reduced-motion`; `.toast` and `.blink` switch off under it.
- **Touch:** touch-only controls are big (pedal 80px, joystick 136px, pad prompt 44px tall).
  New touch targets should be at least 44px. Anything the joystick does also exists as a real
  button.
- **Icons:** pixel SVGs in `public/icons/` (16×16 grid, `crispEdges`, literal colours with an
  ink outline), rendered with `<Icon name="…" />` at 16, 32 or 48px. Names are listed in
  `features/drive/lib/icons.ts`. No emoji; `icons.test.ts` fails on them.

## Colour tokens (`.drive-root`)

| Token | Value | Use |
|---|---|---|
| `--px-ink` | `#1d1530` | Panel fill, text on light chips, hard shadows on signs |
| `--px-cream` | `#fbe7cf` | Body text, `.pixel-box` frame, pedal ring |
| `--px-drop` | `#0d0818` | Drop shadow under buttons, pedals, joystick |
| `--px-amber` | `#ffb36b` | Labels (brand, km/h), default `--px-accent` |
| `--px-coral` | `#ff9a5c` | Pressed pedal, joystick knob |
| `--px-gold` | `#ffcf5c` | "Unlocked" toast label |
| `--px-focus` | `#ffe27a` | Focus outline |
| `--px-paper` | `#f3ece2` | Sign background for landmarks without an accent |
| `--px-sky` | `#38408c` | Page background behind the canvas |
| `--px-accent` | per section | Set inline on each panel and pad prompt from the building's `accent` |

Section accents live with the buildings in `workflows/driveWorld.ts`: about `#ff9a5c`,
experience `#7fb3ff`, projects `#5ee0c4`, skills `#ffcf5c`, testimonials `#ff7eb6`, contact
`#9cd7ff`. Canvas art (`features/drive/lib/render.ts`, `PixelMe.tsx`) keeps literal colours on
purpose, because the canvas can't read CSS variables cheaply each frame.

**Themes** (day / sunset / night) are a colour grade over the canvas (`.grade-*`, `soft-light`
blend) plus canvas lighting. They are not token swaps.

## Type

| Role | Font | Size |
|---|---|---|
| Labels, buttons, eyebrows | `.font-pixel` (Press Start 2P) | 8–10px, UPPERCASE, `line-height: 1.6` |
| Body, values | VT323 (inherited) | `text-base`–`text-xl`; stats `text-xl`–`text-3xl` |

Press Start 2P has no Persian glyphs; Persian falls back to the system font. Keep Persian
strings out of `.font-pixel` where possible.

## Components

| Class / component | What it is |
|---|---|
| `.pixel-box` | Panel/HUD frame: ink fill, 4 hard cream shadows = notched corners |
| `.pixel-btn` | Accent button, ink text, inset bevel, presses down 3px. Always `type="button"` |
| `.pedal` | 80px square touch pedal (brake) |
| `.joystick` / `.joystick-knob` | 136px ring + square knob; `aria-hidden` |
| `.toast` | Pop-in, `steps(4)`: achievement toasts and the pad prompt |
| `Icon` / `.pixel-icon` | Decorative pixel icon (`alt=""`); the button or text around it carries the label |
| `Meter` (Panel.tsx) | Segmented bar plus a visually hidden `<meter>` for screen readers |

## Rules

1. Use `--px-*` tokens and the pixel classes. No raw hex in components. If a token is missing,
   add it to `globals.css` (and to this file).
2. New CSS goes under `.drive-root`.
3. Check both directions (`en` and `fa`) and a phone-sized touch screen before calling a visual
   change done.
