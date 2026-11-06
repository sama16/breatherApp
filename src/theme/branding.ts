/**
 * Breather brand tokens.
 * Source: the Breather pitch deck (dark UI, purple accent, Raleway type).
 * Hex values are estimated from the deck visuals. Replace them with the exact
 * values from the Canva brand kit if the team has one.
 *
 * Place at: src/theme/branding.ts
 */

export const colors = {
  // Backgrounds (the deck uses a near-black gradient)
  background: '#111111',
  backgroundTop: '#1C1C1C',
  surface: '#333333',        // cards / panels
  surfaceAlt: '#1A1A1A',     // outlined cards
  border: '#FFFFFF',
  borderSubtle: '#3F3F3F',

  // Brand purple
  primary: '#9B72C0',        // filled cards, progress bar, highlights
  primaryDeep: '#6B4FA8',    // header tagline, pressed state
  primarySoft: '#D4BFFF',    // glowing headings on dark
  primaryGlow: 'rgba(155, 114, 192, 0.45)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#B5B5B5',
  textMuted: '#8A8A8A',
  textOnPrimary: '#FFFFFF',

  // Status (for crunch levels in the timeline / heatmap)
  crunchLow: '#4ADE80',
  crunchMedium: '#FBBF24',
  crunchHigh: '#F43F5E',
  success: '#2DD4BF',
  danger: '#F43F5E',
} as const;

export const gradients = {
  background: [colors.backgroundTop, colors.background] as const,
  primary: [colors.primary, colors.primaryDeep] as const,
};

export const typography = {
  // Raleway: npx expo install @expo-google-fonts/raleway expo-font
  fontFamily: {
    light: 'Raleway_300Light',
    regular: 'Raleway_400Regular',
    medium: 'Raleway_500Medium',
    semiBold: 'Raleway_600SemiBold',
    bold: 'Raleway_700Bold',
  },
  size: {
    caption: 12,
    body: 14,
    bodyLg: 16,
    subtitle: 18,
    title: 24,
    headline: 32,
    display: 44,
  },
  lineHeight: {
    tight: 1.15,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 16,
  lg: 24,   // the deck's cards use large rounded corners
  pill: 999,
} as const;

export const shadows = {
  glow: {
    shadowColor: colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
} as const;

/** Reusable component styles */
export const components = {
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  cardHighlighted: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  cardOutlined: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  buttonOutlined: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
} as const;

export const brand = {
  name: 'Breather',
  tagline: 'Room to breathe between assessments',
  slogan: 'Less Crunch. More Breathing Room.',
  hook: 'Never Get Crushed By Deadlines Again',
  // Logo: white wind/breeze swirl icon next to the "Breather" wordmark (Raleway Bold).
  // Export the logo as SVG/PNG from Canva into assets/ and reference it here.
  logo: null as null | number,
} as const;

export const theme = {
  colors,
  gradients,
  typography,
  spacing,
  radii,
  shadows,
  components,
  brand,
  // The deck is dark-only. Force dark mode in app.json: "userInterfaceStyle": "dark".
  mode: 'dark',
} as const;

export type Theme = typeof theme;
