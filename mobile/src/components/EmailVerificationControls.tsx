import { useMemo, useCallback, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { sendEmailVerification, type User } from 'firebase/auth';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { useVisualEnvironment } from '../context/VisualEnvironmentContext';
import { refreshEmailStatus } from '../lib/api';
import { theme, type VisualEnvironmentTokens } from '../theme';

export function EmailVerificationControls({ user }: { user: User }) {
  const { tokens } = useVisualEnvironment();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const { identity: { emailVerified: verified }, refreshIdentity } = useAuth();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    const refresh = async () => {
      try {
        await refreshIdentity();
        await user.getIdToken(true);
        await refreshEmailStatus().catch(() => {});
      } catch {
        // The explicit check below offers actionable feedback when offline.
      }
    };
    void refresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });
    return () => subscription.remove();
  }, [user, refreshIdentity]));

  async function verify(action: 'send' | 'check') {
    if (busy) return;
    setBusy(true);
    setFeedback(null);
    try {
      await refreshIdentity();
      await user.getIdToken(true);
      await refreshEmailStatus().catch(() => {});
      if (user.emailVerified) return;
      if (action === 'send') {
        await sendEmailVerification(user);
        setSent(true);
        setFeedback('Verification email sent. Check your inbox and spam folder, then open the link.');
      } else {
        setFeedback('Your email is not verified yet. Open the link in your email, or resend it below.');
      }
    } catch (caught) {
      const code = (caught as { code?: string }).code;
      setFeedback(code === 'auth/too-many-requests'
        ? 'Please wait a few minutes before trying again.'
        : 'We could not verify your email right now. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: tokens.surfaceTint }]}>
        <Ionicons color={verified ? theme.colors.sageGreen : tokens.screenTextMuted} name={verified ? 'checkmark-circle' : 'ellipse-outline'} size={14} />
        <Text accessibilityLiveRegion="polite" style={styles.status}>{verified ? 'Verified' : 'Not verified'}</Text>
      </View>
      {!verified ? (
        <>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" accessibilityState={{ disabled: busy, busy }} disabled={busy} onPress={() => void verify('send')} style={[styles.button, { backgroundColor: tokens.surfaceTint }]}>
              <Text style={styles.actionText}>{sent ? 'Resend verification email' : 'Send verification email'}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityState={{ disabled: busy, busy }} disabled={busy} onPress={() => void verify('check')} style={[styles.button, { backgroundColor: tokens.surfaceTint }]}>
              <Text style={styles.actionText}>I’ve verified my email</Text>
            </Pressable>
          </View>
          {feedback ? <Text accessibilityLiveRegion="polite" style={styles.feedback}>{feedback}</Text> : null}
        </>
      ) : null}
    </View>
  );
}

const createStyles = (tokens: VisualEnvironmentTokens) => StyleSheet.create({
  container: { marginTop: 8 },
  badge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', borderRadius: 999, gap: 4, paddingHorizontal: 8, paddingVertical: 5 },
  status: { color: tokens.screenText, fontFamily: theme.fonts.body, ...theme.typography.supporting },
  actions: { gap: 8, marginTop: 8 },
  button: { minHeight: 44, justifyContent: 'center', padding: 10, borderRadius: 14, backgroundColor: theme.colors.soulTint },
  actionText: { color: tokens.screenText, fontFamily: theme.fonts.body, ...theme.typography.supporting },
  feedback: { color: tokens.screenText, fontFamily: theme.fonts.body, ...theme.typography.supporting, marginTop: 8 },
});
