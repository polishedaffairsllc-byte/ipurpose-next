import Ionicons from '@expo/vector-icons/Ionicons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

const ACKNOWLEDGMENT = 'I have reviewed the AI-powered features disclosure above.';

export function SignupDisclosure({ acknowledged, disabled, onToggle, inline = false }: {
  acknowledged: boolean;
  disabled: boolean;
  onToggle: () => void;
  inline?: boolean;
}) {
  const textColor = inline ? theme.colors.textOnDarkMuted : theme.colors.deepIndigo;
  const accentColor = inline ? theme.colors.champagne : theme.colors.lavenderPurple;

  return (
    <View style={[styles.section, inline && styles.inline]}>
      {inline ? <Text accessibilityRole="header" style={styles.heading}>AI-powered features</Text> : null}
      <Text style={[styles.copy, { color: textColor }]}>iPurpose offers AI-powered Compass guidance through OpenAI.</Text>
      <Text style={[styles.copy, { color: textColor }]}>If you allow sharing in Compass, your messages, relevant conversation history and saved journey information may be shared with OpenAI to generate responses and check content safety.</Text>
      <Text style={[styles.copy, { color: textColor }]}>You’ll be asked separately to allow or decline sharing in Compass. You can change your choice in Account.</Text>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={ACKNOWLEDGMENT}
        accessibilityState={{ checked: acknowledged, disabled }}
        disabled={disabled}
        onPress={onToggle}
        style={styles.checkbox}
      >
        <Ionicons name={acknowledged ? 'checkbox' : 'square-outline'} size={24} color={accentColor} />
        <Text style={[styles.copy, styles.checkboxLabel, { color: textColor }]}>{ACKNOWLEDGMENT}</Text>
      </Pressable>
      <View style={styles.links}>
        <Pressable accessibilityRole="link" onPress={() => void Linking.openURL('https://ipurposesoul.com/ai-data-sharing')} style={styles.linkTarget}>
          <Text style={[styles.copy, styles.link, { color: accentColor }]}>What is shared?</Text>
        </Pressable>
        <Pressable accessibilityRole="link" onPress={() => void Linking.openURL('https://ipurposesoul.com/privacy')} style={styles.linkTarget}>
          <Text style={[styles.copy, styles.link, { color: accentColor }]}>Privacy Policy</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 10 },
  inline: { borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.28)', paddingTop: 16, marginBottom: 9 },
  heading: { color: theme.colors.champagne, fontFamily: theme.fonts.heading, fontSize: 23 },
  copy: { fontFamily: theme.fonts.body, fontSize: 14, lineHeight: 21 },
  checkbox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 6, minHeight: 44 },
  checkboxLabel: { flex: 1 },
  links: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 14 },
  linkTarget: { minHeight: 44, justifyContent: 'center' },
  link: { textDecorationLine: 'underline' },
});
