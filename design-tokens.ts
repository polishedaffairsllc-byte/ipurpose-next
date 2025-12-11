/**
 * iPurpose Design System Tokens
 * Complete design token definitions for the iPurpose platform
 */

export const designTokens = {
  // ============================================================================
  // BRAND COLORS
  // ============================================================================
  colors: {
    // Primary Brand Colors
    lavenderViolet: '#9C88FF',
    indigoDeep: '#4B4E6D',
    salmonPeach: '#FCC4B7',
    softGold: '#F5E8C7',
    warmCharcoal: '#2A2A2A',
    offWhite: '#FAFAFA',
    midnight: '#0B0B14',

    // Semantic Colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Neutral Scale
    neutral: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E5E5E5',
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },

    // Opacity Variants
    opacity: {
      lavenderViolet: {
        5: 'rgba(156, 136, 255, 0.05)',
        10: 'rgba(156, 136, 255, 0.10)',
        20: 'rgba(156, 136, 255, 0.20)',
        30: 'rgba(156, 136, 255, 0.30)',
        40: 'rgba(156, 136, 255, 0.40)',
        60: 'rgba(156, 136, 255, 0.60)',
        80: 'rgba(156, 136, 255, 0.80)',
      },
      indigoDeep: {
        5: 'rgba(75, 78, 109, 0.05)',
        10: 'rgba(75, 78, 109, 0.10)',
        20: 'rgba(75, 78, 109, 0.20)',
        40: 'rgba(75, 78, 109, 0.40)',
      },
      white: {
        5: 'rgba(255, 255, 255, 0.05)',
        10: 'rgba(255, 255, 255, 0.10)',
        20: 'rgba(255, 255, 255, 0.20)',
        40: 'rgba(255, 255, 255, 0.40)',
        60: 'rgba(255, 255, 255, 0.60)',
        80: 'rgba(255, 255, 255, 0.80)',
      },
      warmCharcoal: {
        55: 'rgba(42, 42, 42, 0.55)',
        65: 'rgba(42, 42, 42, 0.65)',
        70: 'rgba(42, 42, 42, 0.70)',
      },
    },
  },

  // ============================================================================
  // TYPOGRAPHY
  // ============================================================================
  typography: {
    // Font Families
    fontFamily: {
      italiana: ['Italiana', 'serif'],
      marcellus: ['Marcellus', 'serif'],
      montserrat: ['Montserrat', 'sans-serif'],
    },

    // Font Sizes
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px
    },

    // Font Weights
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    // Line Heights
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },

    // Letter Spacing
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.2em',
    },

    // Typography Scale
    scale: {
      h1: {
        fontFamily: 'Marcellus',
        fontSize: '3rem',        // 48px
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: '-0.025em',
      },
      h2: {
        fontFamily: 'Marcellus',
        fontSize: '2.25rem',     // 36px
        fontWeight: 600,
        lineHeight: 1.25,
        letterSpacing: '-0.025em',
      },
      h3: {
        fontFamily: 'Marcellus',
        fontSize: '1.875rem',    // 30px
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h4: {
        fontFamily: 'Marcellus',
        fontSize: '1.5rem',      // 24px
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontFamily: 'Marcellus',
        fontSize: '1.25rem',     // 20px
        fontWeight: 600,
        lineHeight: 1.5,
      },
      h6: {
        fontFamily: 'Marcellus',
        fontSize: '1.125rem',    // 18px
        fontWeight: 600,
        lineHeight: 1.5,
      },
      body: {
        fontFamily: 'Montserrat',
        fontSize: '1rem',        // 16px
        fontWeight: 400,
        lineHeight: 1.5,
      },
      bodySmall: {
        fontFamily: 'Montserrat',
        fontSize: '0.875rem',    // 14px
        fontWeight: 400,
        lineHeight: 1.5,
      },
      caption: {
        fontFamily: 'Montserrat',
        fontSize: '0.75rem',     // 12px
        fontWeight: 500,
        lineHeight: 1.5,
        letterSpacing: '0.05em',
      },
      brand: {
        fontFamily: 'Italiana',
        fontSize: '2rem',        // 32px
        fontWeight: 400,
        lineHeight: 1.2,
      },
    },
  },

  // ============================================================================
  // SPACING SCALE (8px base rhythm)
  // ============================================================================
  spacing: {
    0: '0',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    8: '2rem',        // 32px
    10: '2.5rem',     // 40px
    12: '3rem',       // 48px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    32: '8rem',       // 128px
  },

  // ============================================================================
  // BORDER RADIUS
  // ============================================================================
  borderRadius: {
    none: '0',
    sm: '0.25rem',      // 4px
    base: '0.5rem',     // 8px
    md: '0.75rem',      // 12px
    lg: '1rem',         // 16px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    full: '9999px',
  },

  // ============================================================================
  // SHADOWS
  // ============================================================================
  shadows: {
    soft: '0 18px 45px rgba(34, 22, 68, 0.16)',
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
    none: 'none',
    glow: {
      lavender: '0 0 22px rgba(156, 136, 255, 0.6)',
      salmon: '0 0 22px rgba(252, 196, 183, 0.6)',
      gold: '0 0 22px rgba(245, 232, 199, 0.6)',
    },
  },

  // ============================================================================
  // BACKDROP BLUR
  // ============================================================================
  backdropBlur: {
    none: '0',
    sm: '4px',
    base: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '40px',
  },

  // ============================================================================
  // COMPONENT TOKENS
  // ============================================================================
  components: {
    // Card Component
    card: {
      background: '#FFFFFF',
      border: 'rgba(156, 136, 255, 0.1)',
      borderRadius: '1.25rem',
      padding: {
        base: '1.5rem',
        lg: '2rem',
      },
      shadow: '0 18px 45px rgba(34, 22, 68, 0.16)',
      hover: {
        shadow: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
        border: 'rgba(156, 136, 255, 0.3)',
      },
      accent: {
        lavender: {
          borderLeft: '4px solid #9C88FF',
        },
        salmon: {
          borderLeft: '4px solid #FCC4B7',
        },
        gold: {
          borderLeft: '4px solid #F5E8C7',
        },
      },
    },

    // Button Component
    button: {
      borderRadius: '9999px',
      fontSize: {
        sm: '0.75rem',
        md: '0.875rem',
        lg: '1rem',
      },
      padding: {
        sm: { x: '1rem', y: '0.5rem' },
        md: { x: '1.5rem', y: '0.75rem' },
        lg: { x: '2rem', y: '1rem' },
      },
      variants: {
        primary: {
          background: '#9C88FF',
          color: '#FFFFFF',
          hover: { background: '#4B4E6D' },
          shadow: '0 18px 45px rgba(34, 22, 68, 0.16)',
        },
        secondary: {
          background: 'rgba(75, 78, 109, 0.1)',
          color: '#4B4E6D',
          hover: { background: 'rgba(75, 78, 109, 0.2)' },
          border: '1px solid rgba(75, 78, 109, 0.2)',
        },
        ghost: {
          background: 'transparent',
          color: '#4B4E6D',
          hover: { background: 'rgba(75, 78, 109, 0.1)' },
        },
        accent: {
          background: '#FCC4B7',
          color: '#2A2A2A',
          hover: { background: 'rgba(252, 196, 183, 0.9)' },
          shadow: '0 18px 45px rgba(34, 22, 68, 0.16)',
        },
      },
      focus: {
        ring: '2px solid rgba(75, 78, 109, 0.4)',
        offset: '2px',
      },
    },

    // Sidebar Component
    sidebar: {
      width: '16rem',
      background: 'rgba(255, 255, 255, 0.8)',
      backdropBlur: '24px',
      border: '1px solid rgba(156, 136, 255, 0.1)',
      shadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
      logo: {
        padding: { x: '1.5rem', y: '2rem' },
        background: 'linear-gradient(to bottom right, #9C88FF, #4B4E6D)',
        borderRadius: '0.75rem',
        size: '3rem',
      },
      nav: {
        padding: { x: '1rem', y: '1.5rem' },
        item: {
          padding: { x: '1rem', y: '0.75rem' },
          borderRadius: '0.75rem',
          fontSize: '0.875rem',
          active: {
            background: 'linear-gradient(to right, rgba(156, 136, 255, 0.2), rgba(75, 78, 109, 0.1))',
            color: '#4B4E6D',
            border: '1px solid rgba(156, 136, 255, 0.2)',
            shadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          },
          inactive: {
            color: 'rgba(42, 42, 42, 0.7)',
            hover: {
              background: 'rgba(156, 136, 255, 0.05)',
              color: '#4B4E6D',
            },
          },
        },
      },
    },

    // Header Component
    header: {
      height: 'auto',
      background: 'rgba(255, 255, 255, 0.6)',
      backdropBlur: '24px',
      border: '1px solid rgba(156, 136, 255, 0.1)',
      shadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      padding: { x: '1.5rem', y: '1rem' },
      title: {
        fontSize: '1.25rem',
        fontFamily: 'Marcellus',
        color: '#2A2A2A',
      },
      actions: {
        button: {
          size: '2.5rem',
          borderRadius: '9999px',
          background: 'rgba(156, 136, 255, 0.1)',
          hover: { background: 'rgba(156, 136, 255, 0.2)' },
        },
      },
    },

    // Dashboard Layout
    dashboard: {
      background: 'linear-gradient(to bottom right, #FAFAFA, rgba(156, 136, 255, 0.05), rgba(75, 78, 109, 0.1))',
      content: {
        maxWidth: '112rem',
        padding: { x: '1.5rem', y: '2rem' },
        paddingLg: { x: '2.5rem', y: '2.5rem' },
      },
    },

    // Page Title Component
    pageTitle: {
      fontSize: {
        base: '1.875rem',
        md: '2.25rem',
        lg: '3rem',
      },
      fontFamily: 'Italiana',
      color: '#9C88FF',
      dropShadow: '0 0 22px rgba(156, 136, 255, 0.6)',
      subtitle: {
        fontSize: {
          base: '1rem',
          md: '1.125rem',
        },
        fontFamily: 'Marcellus',
        color: 'rgba(42, 42, 42, 0.7)',
        marginTop: '0.75rem',
      },
    },

    // Section Heading Component
    sectionHeading: {
      fontFamily: 'Marcellus',
      color: '#2A2A2A',
      fontWeight: 600,
      letterSpacing: '-0.025em',
      sizes: {
        h2: { fontSize: '1.5rem', md: '1.875rem' },
        h3: { fontSize: '1.25rem', md: '1.5rem' },
        h4: { fontSize: '1.125rem', md: '1.25rem' },
      },
    },

    // Input Component
    input: {
      background: '#FFFFFF',
      border: '1px solid rgba(156, 136, 255, 0.15)',
      borderRadius: '0.5rem',
      padding: { x: '1rem', y: '0.625rem' },
      fontSize: '0.875rem',
      color: '#2A2A2A',
      placeholder: 'rgba(42, 42, 42, 0.5)',
      focus: {
        ring: '2px solid rgba(156, 136, 255, 0.4)',
        border: '1px solid #9C88FF',
      },
      disabled: {
        background: 'rgba(0, 0, 0, 0.02)',
        cursor: 'not-allowed',
        opacity: 0.5,
      },
    },

    // Pill/Badge Component
    pill: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      borderRadius: '9999px',
      padding: { x: '1rem', y: '0.5rem' },
      fontSize: '0.875rem',
      fontWeight: 500,
      background: 'rgba(156, 136, 255, 0.1)',
      color: '#7C65D4',
    },
  },

  // ============================================================================
  // TRANSITIONS & ANIMATIONS
  // ============================================================================
  transitions: {
    duration: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    timing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      linear: 'linear',
    },
  },

  // ============================================================================
  // BREAKPOINTS
  // ============================================================================
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // ============================================================================
  // Z-INDEX SCALE
  // ============================================================================
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
  },
} as const;

export type DesignTokens = typeof designTokens;
