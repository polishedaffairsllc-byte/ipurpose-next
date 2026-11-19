import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
            <Text style={styles.copy}>iPurpose offers AI-powered Compass guidance through OpenAI.</Text>
            <Text style={styles.copy}>If you choose to use Compass, messages, relevant conversation history and saved journey information may be shared with OpenAI to generate responses and check content safety.</Text>
            <Text style={styles.copy}>Acknowledging this notice finishes account setup. It does NOT grant permission to send your information to OpenAI. You will be asked separately to Allow or Decline before using Compass, and can withdraw permission in Account.</Text>
            <Pressable accessibilityRole="link" onPress={() => void Linking.openURL('https://ipurposesoul.com/ai-data-sharing')}>
              <Text style={styles.link}>What data does Compass share?</Text>
            </Pressable>
            <Pressable accessibilityRole="link" onPress={() => void Linking.openURL('https://ipurposesoul.com/privacy')}>
              <Text style={styles.link}>Privacy Policy</Text>
            </Pressable>
            <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: acknowledged }}
              accessibilityLabel="I have reviewed the AI-powered features disclosure"
              disabled={busy} onPress={() => setAcknowledged(value => !value)} style={styles.checkboxRow}>
              <Text style={styles.checkbox}>{acknowledged ? '☑' : '☐'}</Text>
              <Text style={styles.checkLabel}>I have reviewed the AI-powered features disclosure above.</Text>
            </Pressable>
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
  link: { fontFamily: theme.fonts.body, color: theme.colors.lavenderPurple, textDecorationLine: 'underline', fontSize: 14 },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 8 },
  checkbox: { color: theme.colors.deepIndigo, fontSize: 24 },
  checkLabel: { flex: 1, color: theme.colors.deepIndigo, fontFamily: theme.fonts.body, fontSize: 14, lineHeight: 21 },
  primary: { backgroundColor: theme.colors.deepIndigo, padding: 15, borderRadius: 14, alignItems: 'center', minHeight: 50 },
  primaryText: { fontFamily: theme.fonts.body, color: theme.colors.white, fontSize: 15 },
  disabled: { opacity: 0.45 },
  error: { color: theme.colors.deepIndigo, fontFamily: theme.fonts.body, fontSize: 13 },
});
