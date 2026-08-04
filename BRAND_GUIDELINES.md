# NHT Brand Guidelines

**New Horizons Team** — Official brand standards for digital and marketing applications.

---

## Brand Essence

NHT is an elite international creator management company. We operate at the intersection of luxury, discretion, and measurable growth.

**Core message:** We build creator businesses.

**Brand values:** Luxury · Trust · Innovation · Growth · Confidentiality · Excellence

**Voice:** Confident. Precise. Understated. Never salesy. Never generic.

**Reference aesthetic:** Apple, Stripe, Linear, Notion, Porsche, Arc Browser — minimal, expensive, intentional.

---

## Logo

### Primary Mark — Text Logo

```
NHT
New Horizons Team
```

- **NHT** — Primary wordmark. Semibold. Tight letter-spacing (−0.04em). Always white on dark backgrounds.
- **New Horizons Team** — Descriptor. 9–10px. Uppercase. Wide tracking (0.32–0.38em). White at 40% opacity.

### Usage Rules

- Minimum clear space: height of "NHT" on all sides
- Never stretch, rotate, or add effects to the wordmark
- Gold accent permitted only on interactive hover states — not in static logo lockups
- On light backgrounds (rare): invert to black `#090909`

### Do Not

- Use decorative serif fonts for the logo
- Abbreviate the descriptor to "NHT Team"
- Place the logo on busy photography without a dark overlay

---

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Black | `#090909` | Primary background |
| Black Elevated | `#0F0F0F` | Cards, elevated surfaces |
| Black Surface | `#141414` | Input fields, nested panels |
| White | `#FFFFFF` | Primary text, headlines |
| Gold | `#C8A45D` | Accents, CTAs, highlights |
| Gold Warm | `#D4AF6A` | Gradient start, hover states |
| Gold Deep | `#A8864A` | Gradient end, depth |

### Text Hierarchy

- Primary: `#FFFFFF` — Headlines, key labels
- Secondary: `rgba(255,255,255,0.55)` — Body copy
- Tertiary: `rgba(255,255,255,0.35)` — Captions, metadata
- Muted: `rgba(255,255,255,0.20)` — Placeholders, disabled

### Gradients

- **Gold gradient:** `linear-gradient(135deg, #D4AF6A 0%, #C8A45D 50%, #A8864A 100%)`
- **Ambient glow:** `radial-gradient(ellipse at center, rgba(200,164,93,0.08), transparent 70%)`
- Use gradients sparingly. One focal glow per section maximum.

---

## Typography

**Primary typeface:** Geist Sans — clean, modern, premium.

| Scale | Size | Weight | Tracking | Use |
|-------|------|--------|----------|-----|
| Display | clamp(3.25rem–5.75rem) | 600 | −0.03em | Hero headlines |
| H1 | clamp(2.5rem–4rem) | 600 | −0.03em | Section titles |
| H2 | clamp(2rem–3rem) | 600 | −0.02em | Subsections |
| H3 | 1.5rem | 500 | −0.01em | Card titles |
| Body Large | 1.125rem | 400 | normal | Lead paragraphs |
| Body | 1rem | 400 | normal | Standard copy |
| Body Small | 0.875rem | 400 | normal | Card descriptions |
| Caption | 0.75rem | 400 | normal | Metadata |
| Overline | 0.6875rem | 500 | 0.22em | Section labels (uppercase) |

**Line height:** Display 1.02 · Headings 1.08 · Body 1.65

---

## Spacing

### Section Rhythm

- Vertical section padding: `clamp(7rem, 14vw, 11rem)`
- Section header to content: `5rem` (80px)
- Container max-width: `1280px`
- Container horizontal padding: `clamp(1.5rem, 4vw, 3rem)`

### Grid

- Default gap: `1.5rem` (24px)
- Large gap: `2rem` (32px)
- Columns: 1 (mobile) → 2 (tablet) → 3 (desktop)

**Principle:** When in doubt, add space. Whitespace is a luxury signal.

---

## Border Radius

| Token | Value | Use |
|-------|-------|-----|
| sm | 8px | Tags, small badges |
| md | 12px | Inputs, small cards |
| lg | 16px | Buttons (alternative) |
| xl | 20px | Medium cards |
| 2xl | 24px | Large cards, panels |
| 3xl | 32px | Hero cards, modals |
| full | 9999px | Pill buttons, avatars |

---

## Components

### Buttons

**Primary** — Gold gradient fill, black text, pill shape, subtle gold glow on hover.
**Secondary** — Glass background, white text, 1px white/10 border, gold border on hover.
**Ghost** — Text only, white/55, gold on hover.

Padding: `px-9 py-4` · Font: 14px semibold · Radius: full

### Cards

- Background: `rgba(255,255,255,0.03)` with `backdrop-blur(24px)`
- Border: `1px solid rgba(255,255,255,0.08)`
- Inner highlight: `inset 0 1px 0 rgba(255,255,255,0.05)`
- Hover: border shifts to gold/25, subtle gold glow
- Padding: `2rem` minimum, `2.5rem` on desktop

### Input Fields

- Background: `rgba(255,255,255,0.03)`
- Border: `1px solid rgba(255,255,255,0.10)`
- Radius: `12px`
- Focus: gold/40 border, gold/20 ring
- Placeholder: white/20

### Navigation

- Floating glass bar, `border-radius: 16px`
- Blur: 32px
- Links: 14px, white/50, gold on hover
- CTA: Primary button, compact variant

---

## Icons

- Style: Outline, 1.5px stroke
- Size: 24px default, 28px in service cards
- Color: Gold on dark backgrounds, white/55 for neutral
- Source: Heroicons (inline SVG)

---

## Shadows & Glow

| Token | Value |
|-------|-------|
| sm | `0 1px 2px rgba(0,0,0,0.4)` |
| md | `0 8px 32px rgba(0,0,0,0.45)` |
| lg | `0 24px 48px rgba(0,0,0,0.5)` |
| glow-gold | `0 0 60px rgba(200,164,93,0.15)` |
| glow-gold-strong | `0 0 80px rgba(200,164,93,0.25)` |

Use glow only on hero elements and primary CTAs. Never stack multiple glows in one viewport.

---

## Animation

**Library:** Framer Motion

**Principles:**
- Subtle over dramatic
- Entrance: fade + 24–40px vertical translate, 800ms, ease-out expo
- Stagger children: 100–120ms
- Hover: 4–8px lift, 300ms
- Parallax: light, max 80px shift on hero
- Never animate for decoration alone — motion guides attention

**Reduced motion:** Respect `prefers-reduced-motion`.

---

## Photography & Imagery

- Dark, moody, high contrast when used
- Creator imagery: never stock-looking, always editorial
- Dashboard mockups: minimal UI, gold accent charts only
- No clip art, no generic illustrations

---

## Copywriting Principles

1. **Lead with outcome**, not features
2. **Short sentences.** Declarative. No fluff.
3. **Never say:** "Unlock your potential," "Take your brand to the next level," "Passionate team"
4. **Always sound like** a firm that turns down more clients than it accepts
5. **Confidentiality** is a feature, not a footnote

---

## Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| < 640px | Single column, stacked hero, hamburger nav |
| 640–1024px | 2-column grids, reduced display type |
| > 1024px | Full layout, floating nav, side-by-side hero |

Typography scales fluidly via `clamp()`. Touch targets minimum 44px.

---

## File References

- CSS tokens: `design-system/tokens.css`
- TypeScript tokens: `lib/design-system.ts`
- Logo component: `components/brand/Logo.tsx`
- UI primitives: `components/ui/`

---

*NHT · New Horizons Team · Confidential brand document*
