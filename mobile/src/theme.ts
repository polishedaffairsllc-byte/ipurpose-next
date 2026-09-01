// mobile/src/theme.ts
// iPurpose Style Bible v5 — locked visual identity
// Source: iPurpose Business Plan v12.1, Section IX (Brand & Content Style Guide)
//
// Fonts: Italiana (headings) + Marcellus (body) are Google Fonts, not
// system fonts — they must be loaded before this theme is used. See the
// "Loading the fonts" note at the bottom of this file.

export const theme = {
  colors: {
    // --- Approved Style Bible palette (do not alter these hex values) ---
    deepIndigo: '#4B4E6D',      // Spiritual depth, wisdom, calm
    lavenderPurple: '#9C88FF',  // Intuition, creativity, inspiration
    salmonPeach: '#FCC4B7',     // Warmth, passion, approachability
    sageGreen: '#88B04B',       // Growth, renewal, balance
    lightMistGray: '#F5F7FA',   // Clarity and calm — background
    champagne: '#E6C87C',       // Legacy, value, leadership accents

    // --- Semantic aliases used throughout the app ---
    plum: '#9C88FF',       // primary accent — Lavender Purple (buttons, labels, active states)
    plumDark: '#4B4E6D',   // primary-on-light — Deep Indigo (icon marks, emphasis text)
    ink: '#4B4E6D',        // headline/body text — Deep Indigo reads as "ink" without going flat black
    muted: '#767A94',      // secondary/supporting text — a desaturated tint of Deep Indigo
    cream: '#F5F7FA',      // screen background — Light Mist Gray
    line: '#E4E7EF',       // hairline borders — light tint between Light Mist Gray and Deep Indigo
    blush: '#FCC4B7',      // soft accent card fill — Salmon Peach
    white: '#FFFFFF',
    danger: '#4B4E6D',      // existing error-state alias — Deep Indigo

    // --- Lens-card tints (Soul / Systems / AI), derived from the approved palette ---
    soulTint: '#E7E3FB',     // pale Lavender Purple — intuition/soul
    systemsTint: '#E7F0DE',  // pale Sage Green — structure/growth
    aiTint: '#F7EFD9',       // pale Champagne — amplification/leadership
  },

  fonts: {
    heading: 'Italiana_400Regular',
    body: 'Marcellus_400Regular',
  },
} as const;

/*
LOADING THE FONTS

Italiana and Marcellus are Google Fonts. In an Expo app, install and load
them once at the app root (e.g. mobile/src/app/_layout.tsx), before any
screen renders:

  npx expo install @expo-google-fonts/italiana @expo-google-fonts/marcellus expo-font expo-splash-screen

  import { useFonts, Italiana_400Regular } from '@expo-google-fonts/italiana';
  import { Marcellus_400Regular } from '@expo-google-fonts/marcellus';
  import * as SplashScreen from 'expo-splash-screen';

  SplashScreen.preventAutoHideAsync();

  export default function RootLayout() {
    const [fontsLoaded] = useFonts({ Italiana_400Regular, Marcellus_400Regular });

    useEffect(() => {
      if (fontsLoaded) SplashScreen.hideAsync();
    }, [fontsLoaded]);

    if (!fontsLoaded) return null;

    return <Slot />; // or your existing layout tree
  }

The font family names above match what @expo-google-fonts exports — keep
them as the string keys in theme.fonts so every screen can reference
theme.fonts.heading / theme.fonts.body instead of hardcoding names.
*/
