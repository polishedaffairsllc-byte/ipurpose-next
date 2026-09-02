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
