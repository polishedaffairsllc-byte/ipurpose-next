import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FIRST_RUN_CHOICES, FIRST_RUN_CHOICE_NOTE, type FirstRunChoice } from '../lib/firstRun';
import { useVisualEnvironment } from '../context/VisualEnvironmentContext';
import { theme } from '../theme';

/**
 * The founder-approved starting-point chooser.
 *
 * The parent must persist the selected stage with /api/auth/first-run before
 * advancing screens. This component does not grant AI consent or complete
 * signup; both concerns stay with the existing authoritative gates.
 */
export function FirstRunChoiceScreen({
  onSelect,
}: {
  onSelect: (choice: FirstRunChoice) => Promise<void>;
}) {
  const { tokens } = useVisualEnvironment();
  const [savingChoice, setSavingChoice] = useState<FirstRunChoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false);

  async function choose(choice: FirstRunChoice) {
    if (lock.current) return;
    lock.current = true;
    setSavingChoice(choice);
    setError(null);
    try {
      await onSelect(choice);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save your choice. Please try again.');
    } finally {
      lock.current = false;
      setSavingChoice(null);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: tokens.surface }]}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Text style={[styles.eyebrow, { color: tokens.accentStrong }]}>YOUR IPURPOSE JOURNEY</Text>
        <Text accessibilityRole="header" style={styles.title}>Choose your starting point.</Text>
        <Text style={styles.description}>Choose the path that feels right for you today.</Text>
        <View style={styles.options}>
          {FIRST_RUN_CHOICES.map(item => (
            <Pressable
              key={item.value}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}. ${item.description}`}
              accessibilityState={{ disabled: savingChoice !== null }}
              disabled={savingChoice !== null}
              onPress={() => void choose(item.value)}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: tokens.surfaceTint, borderColor: tokens.surfaceBorder },
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
              {savingChoice === item.value ? <ActivityIndicator color={tokens.accentStrong} /> : null}
            </Pressable>
          ))}
        </View>
        <Text style={styles.note}>{FIRST_RUN_CHOICE_NOTE}</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 32 },
  eyebrow: { fontFamily: theme.fonts.body, fontSize: 11, letterSpacing: 1.5 },
  title: { fontFamily: theme.fonts.heading, fontSize: 29, lineHeight: 36, color: theme.colors.deepIndigo, marginTop: 13 },
  description: { fontFamily: theme.fonts.body, fontSize: 15, lineHeight: 23, color: theme.colors.deepIndigo, marginTop: 12 },
  options: { gap: 14, marginTop: 30 },
  card: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 22, paddingVertical: 22, minHeight: 125, gap: 9 },
  cardTitle: { fontFamily: theme.fonts.heading, fontSize: 23, color: theme.colors.deepIndigo },
  cardDescription: { fontFamily: theme.fonts.body, fontSize: 15, lineHeight: 23, color: theme.colors.deepIndigo },
  note: { marginTop: 26, color: theme.colors.muted, fontFamily: theme.fonts.body, fontSize: 13, textAlign: 'center' },
  error: { marginTop: 18, color: theme.colors.deepIndigo, fontFamily: theme.fonts.body, fontSize: 14 },
  pressed: { opacity: 0.8 },
});
