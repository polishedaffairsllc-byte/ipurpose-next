import { Image, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

const LOGO_URI = 'https://www.ipurposesoul.com/images/my-logo.png';

export function BrandHeader({ subtitle }: { subtitle?: string }) {
  return (
    <View style={styles.wrap}>
      <Image source={{ uri: LOGO_URI }} style={styles.logo} resizeMode="contain" />
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
    gap: 12,
  },
  logo: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: theme.colors.white,
  },
  copy: {
    flex: 1,
  },
  brand: {
    color: theme.colors.ink,
    fontSize: 25,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 2,
    color: theme.colors.muted,
    fontSize: 13,
  },
});
