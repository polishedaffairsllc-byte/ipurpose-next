import { StyleSheet, Text, View } from 'react-native';
import { useVisualEnvironment } from '../context/VisualEnvironmentContext';
import { theme } from '../theme';

export function JourneyHeading({
  title,
  subtitle,
  atmosphere = false,
}: {
  title: string;
  subtitle?: string;
  atmosphere?: boolean;
}) {
  const { tokens } = useVisualEnvironment();
  const titleColor = atmosphere ? tokens.atmosphereText : tokens.screenText;
  const subtitleColor = atmosphere ? tokens.atmosphereTextMuted : tokens.screenTextMuted;

  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={[styles.title, { color: titleColor }]}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: subtitleColor }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20, marginBottom: 18 },
  title: { fontFamily: theme.fonts.heading, ...theme.typography.display, textAlign: 'center' },
  subtitle: { marginTop: 5, fontFamily: theme.fonts.body, ...theme.typography.body, textAlign: 'center' },
});
