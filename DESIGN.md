# Design system

The portfolio has **two visual languages, one per route**. They never mix: a component belongs
to exactly one of them.

| | **Pixel** (`/`, Pixel Drive) | **Liquid Glass** (`/desktop`) |
|---|---|---|
| Feel | 16-bit sunset arcade: chunky, hard-edged, stepped motion | macOS Tahoe: translucent, soft, layered |
| Scope | Everything under `.drive-root` | Everything else |
| Tokens | `--px-*` on `.drive-root` | shadcn `--background`, `--primary`, … in `:root` / `.dark` |
| Fonts | Press Start 2P (`--font-pixel`), VT323 (`--font-body`) | Geist (`--font-geist-sans`), Geist Mono |
| Corners | Square. Notches come from shadows, never `border-radius` | Rounded (`--radius` 0.625rem; tiles `rounded-2xl`) |
| Depth | Hard 0-blur drop (`0 4px 0 var(--px-drop)`) | Blur + saturate + inner highlight + soft shadow |
| Motion | `steps(n)` animations, 3px press-down | Eased transforms (`duration-200 ease-out`) |

Source of truth for every value below: [`app/globals.css`](app/globals.css). Change a value there,
not by hardcoding it in a component.

## Shared foundations (both languages)

- **Direction:** logical properties only (`ps/pe/ms/me/start/end/text-start`). Persian flips the
  whole page through `<html dir>`. Numbers, money, handles and units get `dir="ltr"`.
- **Copy:** every visible string and `aria-label` comes from `messages/*.json`.
- **Focus:** always visible. Glass uses `focus-visible:ring-3 ring-ring/50` (from the shadcn
  primitives); Pixel uses `outline: 3px dashed var(--px-focus)`.
- **Motion:** respect `prefers-reduced-motion` and the `data-reduce-motion` setting. Pixel
  animations (`.toast`, `.blink`) switch off; glass transitions collapse to ~0ms.
- **Touch:** touch-only controls are big (pedal 80px, joystick 136px). New touch targets should
  be at least 44px. Anything the joystick does also exists as a real button.
- **Icons:** lucide-react on the desktop; emoji on the game HUD and achievements.

## Pixel (Pixel Drive)

### Colour tokens (`.drive-root`)

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
| `--px-accent` | per section | Set inline on each panel from the building's `accent` |

Section accents live with the buildings in `workflows/driveWorld.ts`: about `#ff9a5c`,
experience `#7fb3ff`, projects `#5ee0c4`, skills `#ffcf5c`, testimonials `#ff7eb6`, contact
`#9cd7ff`. Canvas art (`features/drive/lib/render.ts`, `PixelMe.tsx`) keeps literal colours on
purpose, because the canvas can't read CSS variables cheaply each frame.

**Themes** (day / sunset / night) are a colour grade over the canvas (`.grade-*`, `soft-light`
blend) plus canvas lighting. They are not token swaps.

### Type

| Role | Font | Size |
|---|---|---|
| Labels, buttons, eyebrows | `.font-pixel` (Press Start 2P) | 8–10px, UPPERCASE, `line-height: 1.6` |
| Body, values | VT323 (inherited) | `text-base`–`text-xl`; stats `text-xl`–`text-3xl` |

Press Start 2P has no Persian glyphs; Persian falls back to the system font. Keep Persian
strings out of `.font-pixel` where possible.

### Components

| Class | What it is |
|---|---|
| `.pixel-box` | Panel/HUD frame: ink fill, 4 hard cream shadows = notched corners |
| `.pixel-btn` | Accent button, ink text, inset bevel, presses down 3px. Always `type="button"` |
| `.pedal` | 80px square touch pedal (brake) |
| `.joystick` / `.joystick-knob` | 136px ring + square knob; `aria-hidden` |
| `.toast` | Achievement pop-in, `steps(4)` |
| `Meter` (Panel.tsx) | Segmented bar plus a visually hidden `<meter>` for screen readers |

## Liquid Glass (desktop)

### Surfaces

| Class | Use | Blur |
|---|---|---|
| `.lg-glass` | Window bodies, popovers | 28px |
| `.lg-panel` | Menu bar, dock (thinner, more see-through) | 34px |
| `.lg-chip` | Widgets, desktop-icon tiles, tooltips | 20px |
| `.lg-titlebar` | Window title bar, on top of `.lg-glass` | — |
| `.lg-scroll` | Thin translucent scrollbars inside windows | — |

Every surface has a `.dark` variant and a solid fallback under `[data-reduce-transparency]`.
Never write a new `backdrop-filter`; pick one of these.

### Tokens and theming

- Colours: shadcn neutral palette in `oklch` (`--background`, `--foreground`, `--primary`,
  `--muted`, `--border`, `--ring`, …), switched by the `.dark` class on `<html>`.
- Radius scale: `--radius-sm` … `--radius-4xl`, derived from `--radius`.
- User settings (cookie `app-settings`) put these attributes on `<html>`: theme
  (`light|dark|auto`), `data-wallpaper` (`day|night|aurora|sunset`), `data-reduce-transparency`,
  `data-reduce-motion`, `data-larger-text`.
- App tiles: one Tailwind gradient per app in `lib/apps.config.tsx`
  (`from-sky-400 to-blue-600`, …), shown as `size-14 rounded-2xl` with an inset highlight.
- Window traffic lights: `#ff5f57` / `#febc2e` / `#28c840`, `size-3`.

### Components

Primitives live in `components/ui/` (shadcn `base-nova` style on Base UI): `button`, `input`,
`label`, `textarea`. Add new ones with `npx shadcn@latest add <name>`, never by hand. App UI
composes them inside `features/<app>/components/`.

## Rules

1. Pick the language by route. Game UI uses `--px-*` and pixel classes; desktop UI uses shadcn
   tokens and `.lg-*`.
2. No raw hex in components. Use a token or a utility. If one is missing, add it to
   `globals.css` (and to this file).
3. New game CSS goes under `.drive-root`. Never redefine `--accent` (shadcn owns it).
4. Check both directions (`en` and `fa`) and both desktop themes (light and dark) before calling
   a visual change done.
