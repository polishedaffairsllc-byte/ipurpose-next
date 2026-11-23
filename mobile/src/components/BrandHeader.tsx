import { Image, StyleSheet, Text, View } from 'react-native';
import { useVisualEnvironment } from '../context/VisualEnvironmentContext';
import { theme } from '../theme';

const COMPASS_LOGO = require('../../assets/release/adaptive-icon-foreground.png');

type BrandHeaderVariant = 'dark-background' | 'light-background';

type BrandHeaderProps = {
  subtitle?: string;
  variant?: BrandHeaderVariant;
  size?: 'compact' | 'hero';
};

export function BrandHeader({
  subtitle,
  variant = 'light-background',
  size = 'compact',
}: BrandHeaderProps) {
  const onDarkBackground = variant === 'dark-background';
  const hero = size === 'hero';
  const { tokens } = useVisualEnvironment();

  return (
    <View style={[styles.row, hero && styles.heroRow]}>
      <Image accessibilityLabel="iPurpose Compass logo" source={COMPASS_LOGO}
        style={hero ? styles.heroImage : styles.markImage} resizeMode="contain" />
      <View style={[styles.wordmark, hero && styles.heroWordmark]}>
        <Text
          style={[
            styles.title,
            hero && styles.heroTitle,
            onDarkBackground ? styles.titleOnDark : styles.titleOnLight,
          ]}
        >
          iPurpose Compass<Text style={styles.trademark}>™</Text>
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.subtitle,
              onDarkBackground ? { color: tokens.atmosphereTextMuted } : styles.subtitleOnLight,
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, flexShrink: 1, minWidth: 0 },
  heroRow: { flexDirection: 'column', alignItems: 'center', gap: 24, paddingTop: 14 },
  markImage: { width: 72, height: 72 },
  heroImage: { width: 116, height: 116 },
  wordmark: { flexShrink: 1 },
  heroWordmark: { alignItems: 'center' },
  title: { fontFamily: theme.fonts.heading, fontSize: 17 },
  heroTitle: { fontSize: 40, lineHeight: 48, textAlign: 'center' },
  trademark: { fontFamily: 'System', fontSize: 10 },
  titleOnDark: { color: theme.colors.textOnDark },
  titleOnLight: { color: theme.colors.deepIndigo },
  subtitle: { fontFamily: 'System', fontSize: 12, letterSpacing: 0.6, marginTop: 6 },
  subtitleOnLight: { color: theme.colors.deepIndigo },
});
