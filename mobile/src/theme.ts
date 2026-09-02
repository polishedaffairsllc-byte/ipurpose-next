// mobile/src/theme.ts
// iPurpose Style Bible v5 — locked visual identity
// Base palette source: iPurpose Business Plan v12.1, Section IX
// PR #35 additions: "Compass concept" atmosphere — deep indigo gradient
// background, translucent glass cards, champagne accents. These are
// derived tones/transparencies of the approved palette, not new colors.
//
// Fonts: Italiana (headings) + Marcellus (body) — see the "Loading the
// fonts" note at the bottom of this file.
//
// New RN dependencies required for this file to work as intended:
//   npx expo install expo-linear-gradient expo-blur
// These are additive Expo packages (gradient + blur rendering only) —
// flag with whoever owns "no dependency changes" that this is the one
// expected exception, since PR #35's visual direction isn't achievable
// without them.

export const theme = {
  colors: {
    // --- Approved Style Bible palette (do not alter these hex values) ---
    deepIndigo: '#4B4E6D',      // Spiritual depth, wisdom, calm
    lavenderPurple: '#9C88FF',  // Intuition, creativity, inspiration
    salmonPeach: '#FCC4B7',     // Warmth, passion, approachability
    sageGreen: '#88B04B',       // Growth, renewal, balance
    lightMistGray: '#F5F7FA',   // Clarity and calm
    champagne: '#E6C87C',       // Legacy, value, leadership accents

    // --- Semantic aliases (flat-context usage, kept for any screen that
    // isn't part of the atmospheric Compass treatment) ---
    plum: '#9C88FF',
    plumDark: '#4B4E6D',
    ink: '#4B4E6D',
    muted: '#767A94',
    cream: '#F5F7FA',
    line: '#E4E7EF',
    blush: '#FCC4B7',
    white: '#FFFFFF',

    // --- Legacy compatibility aliases used by existing mobile screens ---
    danger: '#4B4E6D',
    soulTint: '#E7E3FB',
    systemsTint: '#E7F0DE',
    aiTint: '#F7EFD9',

    // --- PR #35: derived midnight/atmosphere tones ---
    // Darker derived shades of Deep Indigo — not a new hue, a deeper
    // stop on the same color so the gradient reads as one family.
    midnightIndigo: '#1B1D33',
    indigoTransition: '#33355A',
    lavenderMist: '#6B5FA0',

    // --- PR #35: glass / translucent surface tokens ---
    glassCardBg: 'rgba(75, 78, 109, 0.35)',       // deepIndigo @ 35%
    glassCardBgDeep: 'rgba(27, 29, 51, 0.55)',    // midnightIndigo @ 55% (Journey card)
    glassCardBorder: 'rgba(230, 200, 124, 0.22)', // champagne @ 22%
    glassPillBg: 'rgba(255, 255, 255, 0.10)',
    glassPillBorder: 'rgba(255, 255, 255, 0.18)',
    champagneGlow: 'rgba(230, 200, 124, 0.35)',

    // --- PR #35: text on the dark atmospheric background ---
    textOnDark: '#FFFFFF',
    textOnDarkMuted: 'rgba(255, 255, 255, 0.72)',
    textOnDarkFaint: 'rgba(255, 255, 255, 0.55)',
    champagneText: '#E6C87C',

    // --- PR #35: tab bar ---
    tabBarBg: 'rgba(27, 29, 51, 0.92)',
    tabBarBorder: 'rgba(255, 255, 255, 0.08)',
    tabIconInactive: 'rgba(255, 255, 255, 0.55)',
    tabIconActive: '#E6C87C',
  },

  // Home background gradient — Option C atmosphere.
  // Diagonal top-to-bottom: midnight → deep indigo → lavender mist.
  homeGradient: {
    colors: ['#1B1D33', '#33355A', '#4B4E6D', '#6B5FA0'] as const,
    locations: [0, 0.35, 0.7, 1] as const,
    start: { x: 0.15, y: 0 },
    end: { x: 0.85, y: 1 },
  },

  fonts: {
    heading: 'Italiana_400Regular',
    body: 'Marcellus_400Regular',
  },
} as const;

export interface VisualEnvironmentTokens {
  label: 'Depth' | 'Renewal' | 'Warmth';
  atmosphereGradient: {
    colors: readonly [string, string, ...string[]];
    locations: readonly [number, number, ...number[]];
    start: { x: number; y: number };
    end: { x: number; y: number };
  };
  screenGradient: {
    colors: readonly [string, string, ...string[]];
    locations: readonly [number, number, ...number[]];
    start: { x: number; y: number };
    end: { x: number; y: number };
  };
  accent: string;
  accentStrong: string;
  accentSoft: string;
  atmosphereText: string;
  atmosphereTextMuted: string;
  atmosphereTextFaint: string;
  glassCardBackground: string;
  glassCardDeepBackground: string;
  glassCardBorder: string;
  glassPillBackground: string;
  glassPillBorder: string;
  buttonBackground: string;
  buttonText: string;
  screenBackground: string;
  surface: string;
  surfaceBorder: string;
  surfaceTint: string;
  profileCardBackground: string;
  tabBarBackground: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
}

export const visualEnvironments: Record<
  'depth' | 'renewal' | 'warmth',
  VisualEnvironmentTokens
> = {
  depth: {
    label: 'Depth',
    atmosphereGradient: theme.homeGradient,
    screenGradient: {
      colors: ['#F5F7FA', '#F5F7FA', '#F5F7FA'],
      locations: [0, 0.55, 1],
      start: { x: 0.1, y: 0 },
      end: { x: 0.9, y: 1 },
    },
    accent: theme.colors.champagneText,
    accentStrong: theme.colors.lavenderPurple,
    accentSoft: theme.colors.aiTint,
    atmosphereText: theme.colors.textOnDark,
    atmosphereTextMuted: theme.colors.textOnDarkMuted,
    atmosphereTextFaint: theme.colors.textOnDarkFaint,
    glassCardBackground: theme.colors.glassCardBg,
    glassCardDeepBackground: theme.colors.glassCardBgDeep,
    glassCardBorder: theme.colors.glassCardBorder,
    glassPillBackground: theme.colors.glassPillBg,
    glassPillBorder: theme.colors.glassPillBorder,
    buttonBackground: theme.colors.lavenderPurple,
    buttonText: theme.colors.white,
    screenBackground: theme.colors.cream,
    surface: theme.colors.white,
    surfaceBorder: theme.colors.line,
    surfaceTint: theme.colors.soulTint,
    profileCardBackground: theme.colors.deepIndigo,
    tabBarBackground: theme.colors.white,
    tabBarBorder: theme.colors.line,
    tabBarActive: theme.colors.lavenderPurple,
    tabBarInactive: theme.colors.muted,
  },
  renewal: {
    label: 'Renewal',
    atmosphereGradient: {
      colors: ['#1F2C24', '#35513F', '#5F7A58', '#8FA97C'],
      locations: [0, 0.35, 0.72, 1],
      start: { x: 0.15, y: 0 },
      end: { x: 0.85, y: 1 },
    },
    screenGradient: {
      colors: ['#F5F8F2', '#E8F0E2', '#F5F7FA'],
      locations: [0, 0.58, 1],
      start: { x: 0.1, y: 0 },
      end: { x: 0.9, y: 1 },
    },
    accent: '#E5EDCF',
    accentStrong: '#52704A',
    accentSoft: '#E7F0DE',
    atmosphereText: '#FFFFFF',
    atmosphereTextMuted: 'rgba(255, 255, 255, 0.78)',
    atmosphereTextFaint: 'rgba(255, 255, 255, 0.60)',
    glassCardBackground: 'rgba(53, 81, 63, 0.46)',
    glassCardDeepBackground: 'rgba(31, 44, 36, 0.62)',
    glassCardBorder: 'rgba(229, 237, 207, 0.32)',
    glassPillBackground: 'rgba(255, 255, 255, 0.12)',
    glassPillBorder: 'rgba(255, 255, 255, 0.22)',
    buttonBackground: '#B8D48B',
    buttonText: '#1F2C24',
    screenBackground: '#F5F8F2',
    surface: 'rgba(255, 255, 255, 0.94)',
    surfaceBorder: '#CAD8C2',
    surfaceTint: '#E7F0DE',
    profileCardBackground: '#35513F',
    tabBarBackground: '#F5F8F2',
    tabBarBorder: '#CAD8C2',
    tabBarActive: '#35513F',
    tabBarInactive: '#6B7C70',
  },
  warmth: {
    label: 'Warmth',
    atmosphereGradient: {
      colors: ['#3A222B', '#6A3940', '#A75E5B', '#D98B78'],
      locations: [0, 0.34, 0.72, 1],
      start: { x: 0.15, y: 0 },
      end: { x: 0.85, y: 1 },
    },
    screenGradient: {
      colors: ['#FFF8F5', '#FCEAE4', '#F5F7FA'],
      locations: [0, 0.58, 1],
      start: { x: 0.1, y: 0 },
      end: { x: 0.9, y: 1 },
    },
    accent: '#FFD9B8',
    accentStrong: '#A75E5B',
    accentSoft: '#FBE0D8',
    atmosphereText: '#FFFFFF',
    atmosphereTextMuted: 'rgba(255, 255, 255, 0.80)',
    atmosphereTextFaint: 'rgba(255, 255, 255, 0.62)',
    glassCardBackground: 'rgba(106, 57, 64, 0.48)',
    glassCardDeepBackground: 'rgba(58, 34, 43, 0.64)',
    glassCardBorder: 'rgba(255, 217, 184, 0.34)',
    glassPillBackground: 'rgba(255, 255, 255, 0.13)',
    glassPillBorder: 'rgba(255, 255, 255, 0.23)',
    buttonBackground: '#FCC4B7',
    buttonText: '#3A222B',
    screenBackground: '#FFF8F5',
    surface: 'rgba(255, 255, 255, 0.94)',
    surfaceBorder: '#E9CFC8',
    surfaceTint: '#FBE0D8',
    profileCardBackground: '#6A3940',
    tabBarBackground: '#FFF8F5',
    tabBarBorder: '#E9CFC8',
    tabBarActive: '#8E4E50',
    tabBarInactive: '#8A6D70',
  },
};

/*
LOADING THE FONTS

Same as before — load once at the app root before any screen renders:

  npx expo install @expo-google-fonts/italiana @expo-google-fonts/marcellus expo-font expo-splash-screen

  import { useFonts, Italiana_400Regular } from '@expo-google-fonts/italiana';
  import { Marcellus_400Regular } from '@expo-google-fonts/marcellus';
  import * as SplashScreen from 'expo-splash-screen';

  SplashScreen.preventAutoHideAsync();

  export default function RootLayout() {
    const [fontsLoaded] = useFonts({ Italiana_400Regular, Marcellus_400Regular });
    useEffect(() => { if (fontsLoaded) SplashScreen.hideAsync(); }, [fontsLoaded]);
    if (!fontsLoaded) return null;
    return <Slot />;
  }

ANDROID BLUR NOTE

expo-blur's true frosted-glass effect is strong and reliable on iOS.
On Android it historically renders as a flatter translucent tint rather
than a true blur. The BlurView components in Home below will still look
correct on both platforms (glassCardBg/glassCardBgDeep give a translucent
base even without blur), but don't expect an identical blur strength on
Android — confirm with design whether that's an acceptable platform
difference or whether Android should get a simplified non-blur glass
treatment instead.
*/
