import { Image, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '../theme';

const COMPASS_LOGO_URI = 'https://www.ipurposesoul.com/images/my-logo.png';

type BrandHeaderProps = { subtitle?: string };

export function BrandHeader({ subtitle }: BrandHeaderProps) {
  return (
    <View style={styles.row}>
      <BlurView intensity={40} tint="light" style={styles.markContainer}>
        <View style={styles.markInnerGlow} />
        <Image accessibilityLabel="iPurpose Compass logo" source={{ uri: COMPASS_LOGO_URI }} style={styles.markImage} resizeMode="contain" />
      </BlurView>
      <View style={styles.wordmark}>
        <Text style={styles.title}>iPurpose Compass</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
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
  title: { fontFamily: theme.fonts.heading, fontSize: 17, color: theme.colors.textOnDark },
  subtitle: { fontFamily: theme.fonts.body, fontSize: 11, letterSpacing: 0.6, color: theme.colors.textOnDarkMuted, marginTop: 1 },
});
