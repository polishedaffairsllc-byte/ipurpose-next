import { Image, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useVisualEnvironment } from '../context/VisualEnvironmentContext';
import { theme } from '../theme';

const COMPASS_LOGO_URI = 'https://www.ipurposesoul.com/images/my-logo.png';

type BrandHeaderVariant = 'dark-background' | 'light-background';

type BrandHeaderProps = {
  subtitle?: string;
  variant?: BrandHeaderVariant;
};

export function BrandHeader({
  subtitle,
  variant = 'light-background',
}: BrandHeaderProps) {
  const onDarkBackground = variant === 'dark-background';
  const { tokens } = useVisualEnvironment();

  return (
    <View style={styles.row}>
      <BlurView intensity={40} tint="light" style={styles.markContainer}>
        <View style={styles.markInnerGlow} />
        <Image accessibilityLabel="iPurpose Compass logo" source={{ uri: COMPASS_LOGO_URI }} style={styles.markImage} resizeMode="contain" />
      </BlurView>
      <View style={styles.wordmark}>
        <Text
          style={[
            styles.title,
            onDarkBackground ? styles.titleOnDark : styles.titleOnLight,
          ]}
        >
          iPurpose Compass
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.subtitle,
            onDarkBackground ? { color: tokens.accent } : styles.subtitleOnLight,
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
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  markContainer: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.glassCardBorder, alignItems: 'center', justifyContent: 'center' },
  markInnerGlow: { position: 'absolute', width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.champagneGlow, opacity: 0.25 },
  markImage: { width: 34, height: 34 },
  wordmark: { flexShrink: 1 },
  title: { fontFamily: theme.fonts.heading, fontSize: 17 },
  titleOnDark: { color: theme.colors.textOnDark },
  titleOnLight: { color: theme.colors.deepIndigo },
  subtitle: { fontFamily: theme.fonts.body, fontSize: 11, letterSpacing: 0.6, marginTop: 1 },
  subtitleOnLight: { color: theme.colors.deepIndigo },
});
