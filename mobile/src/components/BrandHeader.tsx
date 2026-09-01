import { Image, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

const LOGO_URI = 'https://www.ipurposesoul.com/images/my-logo.png';

export function BrandHeader({ subtitle }: { subtitle?: string }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.logoShell}>
        <Image
          source={{ uri: LOGO_URI }}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.copy}>
        <Text style={styles.brand}>iPurpose</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logoShell: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 52,
    height: 52,
  },
  copy: {
    flex: 1,
  },
  brand: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.heading,
    fontSize: 31,
    lineHeight: 34,
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 3,
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 19,
  },
});
