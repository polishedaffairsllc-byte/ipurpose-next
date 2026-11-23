import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SignupDisclosure } from './SignupDisclosure';
import { theme } from '../theme';

/** Account admission is not OpenAI permission; that choice is separate and optional. */
export function SignupAdmissionGate({ onComplete, onRetry, unavailable }: {
  onComplete: () => Promise<void>;
  onRetry?: () => void;
  unavailable?: boolean;
}) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!acknowledged || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onComplete();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Account setup could not be saved. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>ACCOUNT SETUP</Text>
        <Text style={styles.title}>Before you begin</Text>
        {unavailable ? (
          <>
            <Text style={styles.copy}>We could not confirm your account setup. Please check your connection and try again. No AI information has been sent.</Text>
            <Pressable accessibilityRole="button" onPress={onRetry} style={styles.primary}>
              <Text style={styles.primaryText}>Try again</Text>
            </Pressable>
          </>
        ) : (
          <>
            <SignupDisclosure acknowledged={acknowledged} disabled={busy}
              onToggle={() => setAcknowledged(value => !value)} />
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            <Pressable accessibilityRole="button" accessibilityState={{ disabled: !acknowledged || busy }}
              disabled={!acknowledged || busy} onPress={() => void submit()}
              style={[styles.primary, (!acknowledged || busy) && styles.disabled]}>
              {busy ? <ActivityIndicator color={theme.colors.white} /> : <Text style={styles.primaryText}>Continue to iPurpose</Text>}
            </Pressable>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, backgroundColor: theme.colors.cream, justifyContent: 'center', padding: 22 },
  card: { backgroundColor: theme.colors.white, borderColor: theme.colors.line, borderWidth: 1, borderRadius: 20, padding: 22, gap: 14 },
  eyebrow: { fontFamily: theme.fonts.body, color: theme.colors.lavenderPurple, fontSize: 12, letterSpacing: 1 },
  title: { fontFamily: theme.fonts.heading, color: theme.colors.deepIndigo, fontSize: 28 },
  copy: { fontFamily: theme.fonts.body, color: theme.colors.deepIndigo, fontSize: 14, lineHeight: 21 },
  primary: { backgroundColor: theme.colors.deepIndigo, padding: 15, borderRadius: 14, alignItems: 'center', minHeight: 50 },
  primaryText: { fontFamily: theme.fonts.body, color: theme.colors.white, fontSize: 15 },
  disabled: { opacity: 0.45 },
  error: { color: theme.colors.deepIndigo, fontFamily: theme.fonts.body, fontSize: 13 },
});
