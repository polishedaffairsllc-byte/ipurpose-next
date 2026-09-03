import type { ReactNode } from 'react';
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../theme';

const COMPASS_LOGO = require('../../assets/brand/compass-logo.png');
const WELCOME_ATMOSPHERE = require('../../assets/brand/welcome-atmosphere.jpg');

interface AuthScaffoldProps {
  body: string;
  children: ReactNode;
  eyebrow: string;
  title: string;
  variant?: 'welcome' | 'form';
}

export function AuthScaffold({
  body,
  children,
  eyebrow,
  title,
  variant = 'form',
}: AuthScaffoldProps) {
  const welcome = variant === 'welcome';

  return (
    <ImageBackground resizeMode="cover" source={WELCOME_ATMOSPHERE} style={styles.background}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['rgba(14, 16, 38, 0.12)', 'rgba(18, 19, 43, 0.34)', 'rgba(14, 15, 34, 0.86)']}
        locations={[0, 0.48, 1]}
        style={styles.overlay}
      >
        <SafeAreaView style={styles.safe}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.flex}
          >
            <ScrollView
              contentContainerStyle={[
                styles.content,
                welcome ? styles.welcomeContent : styles.formContent,
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={[styles.brand, welcome ? styles.brandWelcome : styles.brandForm]}>
                <View style={[styles.logoHalo, welcome ? styles.logoHaloWelcome : styles.logoHaloForm]}>
                  <View style={styles.logoGlow} />
                  <Image
                    accessibilityLabel="iPurpose Compass logo"
                    resizeMode="contain"
                    source={COMPASS_LOGO}
                    style={welcome ? styles.logoWelcome : styles.logoForm}
                  />
                </View>
                <Text style={[styles.brandTitle, welcome && styles.brandTitleWelcome]}>
                  iPurpose Compass
                </Text>
                <View style={styles.brandRule}>
                  <View style={styles.ruleLine} />
                  <Text style={styles.ruleStar}>✦</Text>
                  <View style={styles.ruleLine} />
                </View>
              </View>

              <View style={welcome ? styles.copyWelcome : styles.copyForm}>
                <Text style={styles.eyebrow}>{eyebrow}</Text>
                <Text accessibilityRole="header" style={[styles.title, welcome && styles.titleWelcome]}>
                  {title}
                </Text>
                <Text style={styles.body}>{body}</Text>
              </View>

              {children}

              <Text style={styles.signature}>SOUL  ·  SYSTEMS  ·  AI™</Text>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}

export function AuthPanel({ children }: { children: ReactNode }) {
  return (
    <BlurView intensity={38} tint="dark" style={styles.panel}>
      {children}
    </BlurView>
  );
}

export const authStyles = StyleSheet.create({
  label: {
    color: theme.colors.champagneText,
    fontFamily: theme.fonts.body,
    fontSize: 11,
    letterSpacing: 1.1,
    marginBottom: 7,
    marginTop: 5,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderColor: 'rgba(230, 200, 124, 0.32)',
    borderRadius: 15,
    borderWidth: 1,
    color: theme.colors.midnightIndigo,
    fontFamily: theme.fonts.body,
    fontSize: 16,
    marginBottom: 14,
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  error: {
    color: theme.colors.salmonPeach,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.champagne,
    borderRadius: 17,
    justifyContent: 'center',
    marginTop: 7,
    minHeight: 54,
    paddingHorizontal: 20,
  },
  primaryButtonText: {
    color: theme.colors.midnightIndigo,
    fontFamily: theme.fonts.body,
    fontSize: 16,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 17,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 12,
    minHeight: 54,
    paddingHorizontal: 20,
  },
  secondaryButtonText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.body,
    fontSize: 15,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonPressed: { opacity: 0.78 },
  textLink: { alignItems: 'center', marginTop: 16, padding: 8 },
  textLinkText: {
    color: theme.colors.textOnDarkMuted,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  background: { backgroundColor: theme.colors.midnightIndigo, flex: 1 },
  overlay: { flex: 1 },
  safe: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 22 },
  welcomeContent: { justifyContent: 'flex-end', minHeight: 690 },
  formContent: { justifyContent: 'center', minHeight: 760 },
  brand: { alignItems: 'center' },
  brandWelcome: { marginBottom: 36 },
  brandForm: { marginBottom: 22 },
  logoHalo: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(230, 200, 124, 0.42)',
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoHaloWelcome: { height: 118, width: 118 },
  logoHaloForm: { height: 78, width: 78 },
  logoGlow: {
    backgroundColor: theme.colors.champagneGlow,
    borderRadius: 999,
    height: '72%',
    position: 'absolute',
    width: '72%',
  },
  logoWelcome: { height: 96, width: 96 },
  logoForm: { height: 62, width: 62 },
  brandTitle: {
    color: theme.colors.white,
    fontFamily: theme.fonts.heading,
    fontSize: 30,
    marginTop: 14,
    textAlign: 'center',
  },
  brandTitleWelcome: { fontSize: 39, lineHeight: 46 },
  brandRule: { alignItems: 'center', flexDirection: 'row', gap: 10, marginTop: 10 },
  ruleLine: { backgroundColor: theme.colors.champagne, height: 1, opacity: 0.58, width: 40 },
  ruleStar: { color: theme.colors.champagne, fontSize: 15 },
  copyWelcome: { alignItems: 'center', marginBottom: 24 },
  copyForm: { marginBottom: 18 },
  eyebrow: {
    color: theme.colors.champagne,
    fontFamily: theme.fonts.body,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 10,
    textAlign: 'center',
  },
  title: {
    color: theme.colors.white,
    fontFamily: theme.fonts.heading,
    fontSize: 31,
    lineHeight: 38,
    textAlign: 'center',
  },
  titleWelcome: { fontSize: 34, lineHeight: 42 },
  body: {
    color: theme.colors.textOnDarkMuted,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 9,
    textAlign: 'center',
  },
  panel: {
    backgroundColor: 'rgba(27, 29, 51, 0.58)',
    borderColor: 'rgba(230, 200, 124, 0.25)',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 20,
  },
  signature: {
    color: theme.colors.textOnDarkFaint,
    fontFamily: theme.fonts.body,
    fontSize: 9,
    letterSpacing: 2.2,
    marginTop: 22,
    textAlign: 'center',
  },
});
