/**
 * iPurpose Tailwind Plugin
 * Extends Tailwind CSS with iPurpose design tokens
 */

import plugin from 'tailwindcss/plugin';
import { designTokens } from './design-tokens';

export const iPurposeTailwindPlugin = plugin(
  // Add custom utilities
  function ({ addUtilities, theme }) {
    // Glow shadow utilities
    addUtilities({
      '.shadow-glow-lavender': {
        boxShadow: designTokens.shadows.glow.lavender,
      },
      '.shadow-glow-salmon': {
        boxShadow: designTokens.shadows.glow.salmon,
      },
      '.shadow-glow-gold': {
        boxShadow: designTokens.shadows.glow.gold,
      },
    });

    // Accent border utilities
    addUtilities({
      '.border-accent-lavender': {
        borderLeftWidth: '4px',
        borderLeftColor: designTokens.colors.lavenderViolet,
      },
      '.border-accent-salmon': {
        borderLeftWidth: '4px',
        borderLeftColor: designTokens.colors.salmonPeach,
      },
      '.border-accent-gold': {
        borderLeftWidth: '4px',
        borderLeftColor: designTokens.colors.softGold,
      },
    });

    // Gradient backgrounds from tokens
    addUtilities({
      '.bg-dashboard': {
        background: designTokens.components.dashboard.background,
      },
      '.bg-sidebar-gradient': {
        background: designTokens.components.sidebar.logo.background,
      },
      '.bg-nav-active': {
        background: designTokens.components.sidebar.nav.item.active.background,
      },
    });

    // Typography utilities from design tokens
    addUtilities({
      '.text-brand': {
        fontFamily: designTokens.typography.scale.brand.fontFamily,
        fontSize: designTokens.typography.scale.brand.fontSize,
        fontWeight: String(designTokens.typography.scale.brand.fontWeight),
        lineHeight: String(designTokens.typography.scale.brand.lineHeight),
      },
    });

    // Backdrop blur utilities (extended beyond Tailwind defaults)
    addUtilities({
      '.backdrop-blur-2xl': {
        backdropFilter: `blur(${designTokens.backdropBlur['2xl']})`,
      },
    });
  },

  // Extend theme with design tokens
  {
    theme: {
      extend: {
        // Colors
        colors: {
          // Brand colors
          lavenderViolet: designTokens.colors.lavenderViolet,
          indigoDeep: designTokens.colors.indigoDeep,
          salmonPeach: designTokens.colors.salmonPeach,
          softGold: designTokens.colors.softGold,
          warmCharcoal: designTokens.colors.warmCharcoal,
          offWhite: designTokens.colors.offWhite,
          midnight: designTokens.colors.midnight,

          // Semantic colors
          success: designTokens.colors.success,
          warning: designTokens.colors.warning,
          error: designTokens.colors.error,
          info: designTokens.colors.info,

          // Neutral scale
          neutral: designTokens.colors.neutral,
        },

        // Font families
        fontFamily: {
          italiana: designTokens.typography.fontFamily.italiana,
          marcellus: designTokens.typography.fontFamily.marcellus,
          montserrat: designTokens.typography.fontFamily.montserrat,
        },

        // Font sizes
        fontSize: {
          xs: designTokens.typography.fontSize.xs,
          sm: designTokens.typography.fontSize.sm,
          base: designTokens.typography.fontSize.base,
          lg: designTokens.typography.fontSize.lg,
          xl: designTokens.typography.fontSize.xl,
          '2xl': designTokens.typography.fontSize['2xl'],
          '3xl': designTokens.typography.fontSize['3xl'],
          '4xl': designTokens.typography.fontSize['4xl'],
          '5xl': designTokens.typography.fontSize['5xl'],
          '6xl': designTokens.typography.fontSize['6xl'],
        },

        // Font weights
        fontWeight: {
          normal: designTokens.typography.fontWeight.normal,
          medium: designTokens.typography.fontWeight.medium,
          semibold: designTokens.typography.fontWeight.semibold,
          bold: designTokens.typography.fontWeight.bold,
        },

        // Line heights
        lineHeight: {
          tight: String(designTokens.typography.lineHeight.tight),
          normal: String(designTokens.typography.lineHeight.normal),
          relaxed: String(designTokens.typography.lineHeight.relaxed),
          loose: String(designTokens.typography.lineHeight.loose),
        },

        // Letter spacing
        letterSpacing: {
          tight: designTokens.typography.letterSpacing.tight,
          normal: designTokens.typography.letterSpacing.normal,
          wide: designTokens.typography.letterSpacing.wide,
          wider: designTokens.typography.letterSpacing.wider,
          widest: designTokens.typography.letterSpacing.widest,
        },

        // Spacing
        spacing: {
          0: designTokens.spacing[0],
          0.5: designTokens.spacing[0.5],
          1: designTokens.spacing[1],
          1.5: designTokens.spacing[1.5],
          2: designTokens.spacing[2],
          2.5: designTokens.spacing[2.5],
          3: designTokens.spacing[3],
          4: designTokens.spacing[4],
          5: designTokens.spacing[5],
          6: designTokens.spacing[6],
          8: designTokens.spacing[8],
          10: designTokens.spacing[10],
          12: designTokens.spacing[12],
          16: designTokens.spacing[16],
          20: designTokens.spacing[20],
          24: designTokens.spacing[24],
          32: designTokens.spacing[32],
        },

        // Border radius
        borderRadius: {
          none: designTokens.borderRadius.none,
          sm: designTokens.borderRadius.sm,
          DEFAULT: designTokens.borderRadius.base,
          md: designTokens.borderRadius.md,
          lg: designTokens.borderRadius.lg,
          xl: designTokens.borderRadius.xl,
          '2xl': designTokens.borderRadius['2xl'],
          full: designTokens.borderRadius.full,
        },

        // Box shadows
        boxShadow: {
          soft: designTokens.shadows.soft,
          sm: designTokens.shadows.sm,
          DEFAULT: designTokens.shadows.base,
          md: designTokens.shadows.md,
          lg: designTokens.shadows.lg,
          xl: designTokens.shadows.xl,
          '2xl': designTokens.shadows['2xl'],
          inner: designTokens.shadows.inner,
          none: designTokens.shadows.none,
        },

        // Backdrop blur
        backdropBlur: {
          none: designTokens.backdropBlur.none,
          sm: designTokens.backdropBlur.sm,
          DEFAULT: designTokens.backdropBlur.base,
          md: designTokens.backdropBlur.md,
          lg: designTokens.backdropBlur.lg,
          xl: designTokens.backdropBlur.xl,
        },

        // Transition durations
        transitionDuration: {
          fast: designTokens.transitions.duration.fast,
          DEFAULT: designTokens.transitions.duration.base,
          slow: designTokens.transitions.duration.slow,
          slower: designTokens.transitions.duration.slower,
        },

        // Transition timing functions
        transitionTimingFunction: {
          DEFAULT: designTokens.transitions.timing.ease,
          in: designTokens.transitions.timing.easeIn,
          out: designTokens.transitions.timing.easeOut,
          'in-out': designTokens.transitions.timing.easeInOut,
          linear: designTokens.transitions.timing.linear,
        },

        // Z-index
        zIndex: {
          0: String(designTokens.zIndex.base),
          dropdown: String(designTokens.zIndex.dropdown),
          sticky: String(designTokens.zIndex.sticky),
          fixed: String(designTokens.zIndex.fixed),
          'modal-backdrop': String(designTokens.zIndex.modalBackdrop),
          modal: String(designTokens.zIndex.modal),
          popover: String(designTokens.zIndex.popover),
          tooltip: String(designTokens.zIndex.tooltip),
        },

        // Container
        container: {
          center: true,
          padding: {
            DEFAULT: designTokens.spacing[6],
            sm: designTokens.spacing[8],
            lg: designTokens.spacing[10],
            xl: designTokens.spacing[12],
            '2xl': designTokens.spacing[16],
          },
        },

        // Screens (breakpoints)
        screens: {
          sm: designTokens.breakpoints.sm,
          md: designTokens.breakpoints.md,
          lg: designTokens.breakpoints.lg,
          xl: designTokens.breakpoints.xl,
          '2xl': designTokens.breakpoints['2xl'],
        },
      },
    },
  }
);

export default iPurposeTailwindPlugin;
