/**
 * NHT Design System — programmatic tokens
 * Source of truth for CSS: design-system/tokens.css
 */

export const brand = {
  name: "NHT",
  fullName: "New Horizons Team",
  tagline: "We build creator businesses.",
  email: "hello@nht.team",
} as const;

export const colors = {
  black: "#090909",
  blackElevated: "#0F0F0F",
  blackSurface: "#141414",
  white: "#FFFFFF",
  gold: "#C8A45D",
  goldWarm: "#D4AF6A",
  goldDeep: "#A8864A",
  goldMuted: "rgba(200, 164, 93, 0.12)",
  textPrimary: "#FFFFFF",
  textSecondary: "rgba(255, 255, 255, 0.55)",
  textTertiary: "rgba(255, 255, 255, 0.35)",
  textMuted: "rgba(255, 255, 255, 0.20)",
  border: "rgba(255, 255, 255, 0.08)",
  borderHover: "rgba(200, 164, 93, 0.25)",
  glass: "rgba(255, 255, 255, 0.03)",
  glassStrong: "rgba(255, 255, 255, 0.06)",
} as const;

export const typography = {
  fontSans: "var(--font-geist-sans)",
  fontMono: "var(--font-geist-mono)",
  display: "clamp(3.25rem, 7vw, 5.75rem)",
  h1: "clamp(2.5rem, 5vw, 4rem)",
  h2: "clamp(2rem, 3.5vw, 3rem)",
  h3: "1.5rem",
  bodyLg: "1.125rem",
  body: "1rem",
  bodySm: "0.875rem",
  caption: "0.75rem",
  overline: "0.6875rem",
  letterSpacing: {
    tight: "-0.03em",
    normal: "-0.01em",
    wide: "0.12em",
    wider: "0.22em",
  },
  lineHeight: {
    display: "1.02",
    heading: "1.08",
    body: "1.65",
  },
} as const;

export const spacing = {
  sectionY: "clamp(7rem, 14vw, 11rem)",
  sectionYSm: "clamp(5rem, 10vw, 8rem)",
  containerMax: "1280px",
  containerPadding: "clamp(1.5rem, 4vw, 3rem)",
  gridGap: "1.5rem",
  gridGapLg: "2rem",
} as const;

export const radius = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  "2xl": "24px",
  "3xl": "32px",
  full: "9999px",
} as const;

export const shadows = {
  sm: "0 1px 2px rgba(0, 0, 0, 0.4)",
  md: "0 8px 32px rgba(0, 0, 0, 0.45)",
  lg: "0 24px 48px rgba(0, 0, 0, 0.5)",
  glowGold: "0 0 60px rgba(200, 164, 93, 0.15)",
  glowGoldStrong: "0 0 80px rgba(200, 164, 93, 0.25)",
  innerHighlight: "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
} as const;

export const animation = {
  duration: {
    fast: "150ms",
    base: "300ms",
    slow: "500ms",
    slower: "800ms",
  },
  ease: {
    out: "cubic-bezier(0.22, 1, 0.36, 1)",
    inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  },
} as const;

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
} as const;
