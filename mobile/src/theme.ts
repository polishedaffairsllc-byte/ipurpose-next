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
    ink: '#1B1D33',
    muted: '#4B4E6D',
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
    textOnDarkMuted: 'rgba(255, 255, 255, 0.92)',
    textOnDarkFaint: 'rgba(255, 255, 255, 0.84)',
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
  typography: {
    display: { fontSize: 40, lineHeight: 48 },
    screenTitle: { fontSize: 34, lineHeight: 42 },
    question: { fontSize: 30, lineHeight: 38 },
    sectionTitle: { fontSize: 24, lineHeight: 32 },
    brandTitle: { fontSize: 21, lineHeight: 26 },
    body: { fontSize: 17, lineHeight: 26 },
    supporting: { fontSize: 15, lineHeight: 22 },
    label: { fontSize: 13, lineHeight: 18 },
    button: { fontSize: 16, lineHeight: 22 },
    input: { fontSize: 17, lineHeight: 24 },
    tab: { fontSize: 13, lineHeight: 17 },
  },
} as const;

export interface VisualEnvironmentTokens {
  label: 'Depth' | 'Renewal' | 'Warmth';
  screenText: string;
  screenTextMuted: string;
  darkScreen: boolean;
  background: import('react-native').ImageSourcePropType;
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
  tabBarItemBackground: string;
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
    screenText: theme.colors.ink,
    screenTextMuted: '#554D68',
    darkScreen: false,
    background: require('../assets/brand/depth-environment.png'),
    atmosphereGradient: {
      colors: ['rgba(15,18,43,0.32)', 'rgba(15,18,43,0.38)', 'rgba(15,18,43,0.77)', 'rgba(15,18,43,0.86)'],
      locations: [0, 0.34, 0.67, 1],
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
    screenGradient: {
      colors: ['rgba(249,240,235,0.20)', 'rgba(249,240,235,0.58)', 'rgba(249,240,235,0.88)'],
      locations: [0, 0.45, 1],
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
    accent: theme.colors.champagneText,
    accentStrong: '#4D3D7A',
    accentSoft: '#EADFF0',
    atmosphereText: theme.colors.textOnDark,
    atmosphereTextMuted: theme.colors.textOnDarkMuted,
    atmosphereTextFaint: theme.colors.textOnDarkFaint,
    glassCardBackground: theme.colors.glassCardBg,
    glassCardDeepBackground: theme.colors.glassCardBgDeep,
    glassCardBorder: theme.colors.glassCardBorder,
    glassPillBackground: theme.colors.glassPillBg,
    glassPillBorder: theme.colors.glassPillBorder,
    buttonBackground: '#64508B',
    buttonText: '#FFFFFF',
    screenBackground: theme.colors.cream,
    surface: '#FAF3EB',
    surfaceBorder: '#D8CBD6',
    surfaceTint: '#F0E5EE',
    profileCardBackground: theme.colors.deepIndigo,
    tabBarBackground: '#171B30',
    tabBarItemBackground: '#1E2238',
    tabBarBorder: 'rgba(235, 232, 248, 0.26)',
    tabBarActive: theme.colors.salmonPeach,
    tabBarInactive: '#E3E0EE',
  },
  renewal: {
    label: 'Renewal',
    screenText: '#212A26',
    screenTextMuted: '#405046',
    darkScreen: false,
    background: require('../assets/brand/renewal-environment.png'),
    atmosphereGradient: {
      colors: ['rgba(27,45,36,0.48)', 'rgba(27,45,36,0.50)', 'rgba(27,45,36,0.80)', 'rgba(27,45,36,0.86)'],
      locations: [0, 0.32, 0.65, 1],
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
    screenGradient: {
      colors: ['rgba(248,244,228,0.28)', 'rgba(248,244,228,0.56)', 'rgba(248,244,228,0.84)'],
      locations: [0, 0.45, 1],
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
    accent: '#E5EDCF',
    accentStrong: '#36543A',
    accentSoft: '#E0E6D4',
    atmosphereText: '#FFFFFF',
    atmosphereTextMuted: theme.colors.textOnDarkMuted,
    atmosphereTextFaint: theme.colors.textOnDarkFaint,
    glassCardBackground: 'rgba(53, 81, 63, 0.46)',
    glassCardDeepBackground: 'rgba(31, 44, 36, 0.62)',
    glassCardBorder: 'rgba(229, 237, 207, 0.32)',
    glassPillBackground: 'rgba(255, 255, 255, 0.12)',
    glassPillBorder: 'rgba(255, 255, 255, 0.22)',
    buttonBackground: '#53654D',
    buttonText: '#FFFFFF',
    screenBackground: '#F6F2E5',
    surface: '#F6F1E3',
    surfaceBorder: '#D1D6C4',
    surfaceTint: '#E6E9D9',
    profileCardBackground: '#35513F',
    tabBarBackground: '#27392F',
    tabBarItemBackground: '#354C3D',
    tabBarBorder: '#818F7B',
    tabBarActive: '#F0D498',
    tabBarInactive: '#E4EADD',
  },
  warmth: {
    label: 'Warmth',
    screenText: '#FFF7EF',
    screenTextMuted: '#ECE1F1',
    darkScreen: true,
    background: require('../assets/brand/dusk-environment.png'),
    atmosphereGradient: {
      colors: ['rgba(14,17,44,0.22)', 'rgba(14,17,44,0.34)', 'rgba(14,17,44,0.76)', 'rgba(14,17,44,0.86)'],
      locations: [0, 0.35, 0.67, 1],
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
    screenGradient: {
      colors: ['rgba(14,17,44,0.18)', 'rgba(14,17,44,0.54)', 'rgba(14,17,44,0.76)'],
      locations: [0, 0.42, 1],
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
    accent: '#FFD9B8',
    accentStrong: '#FFD1B6',
    accentSoft: '#493C60',
    atmosphereText: '#FFFFFF',
    atmosphereTextMuted: theme.colors.textOnDarkMuted,
    atmosphereTextFaint: theme.colors.textOnDarkFaint,
    glassCardBackground: 'rgba(51, 43, 83, 0.74)',
    glassCardDeepBackground: 'rgba(26, 24, 55, 0.84)',
    glassCardBorder: 'rgba(226, 193, 227, 0.42)',
    glassPillBackground: 'rgba(255, 255, 255, 0.13)',
    glassPillBorder: 'rgba(255, 255, 255, 0.23)',
    buttonBackground: '#FCC4B7',
    buttonText: '#3A222B',
    screenBackground: '#141732',
    surface: '#252441',
    surfaceBorder: '#5E5377',
    surfaceTint: '#322C4D',
    profileCardBackground: '#42365E',
    tabBarBackground: '#111630',
    tabBarItemBackground: '#202441',
    tabBarBorder: '#5E5377',
    tabBarActive: theme.colors.salmonPeach,
    tabBarInactive: '#FFEAE5',
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
