import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useVisualEnvironment } from '../context/VisualEnvironmentContext';
import { getAiConsent, setAiConsent, type AiConsentState } from '../lib/api';
import { theme } from '../theme';

/** Displays the versioned, provider-specific notice BEFORE enabling Compass requests. */
export function AiDataSharingControls({ onChange }: { onChange?: (granted: boolean) => void }) {
  const { tokens } = useVisualEnvironment();
  const [consent, setConsent] = useState<AiConsentState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (active: () => boolean) => {
    if (active()) setLoading(true);
    try {
      const next = await getAiConsent();
      if (!active()) return;
      setConsent(next);
      setError(null);
      onChange?.(next.granted);
    } catch {
      if (!active()) return;
      setConsent(null);
      onChange?.(false);
      setError('Unable to verify AI data-sharing permission. Please try again.');
    } finally {
      if (active()) setLoading(false);
    }
  }, [onChange]);

  useFocusEffect(useCallback(() => {
    let active = true;
    void refresh(() => active);
    return () => { active = false; };
  }, [refresh]));

  async function choose(granted: boolean) {
    if (!consent || saving) return;
    setSaving(true);
    setError(null);
    try {
      const next = await setAiConsent(granted, consent.version);
      setConsent(next);
      onChange?.(next.granted);
    } catch {
      // Fail closed: do not continue with AI if storing permission fails.
      onChange?.(false);
      setError('Your choice could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const accentColor = tokens.profileCardBackground;
  const secondaryStyle = [styles.secondary, { backgroundColor: tokens.surface, borderColor: accentColor }];
  const secondaryTextStyle = [styles.secondaryText, { color: accentColor }];

  return (
    <View style={[styles.card, { backgroundColor: tokens.surfaceTint, borderColor: tokens.surfaceBorder }]}>
      <Text style={styles.heading}>AI data-sharing permission</Text>
      {loading ? (
        <ActivityIndicator accessibilityLabel="Checking AI permission" color={accentColor} />
      ) : consent ? (
        <>
          <Text style={styles.provider}>Provider: {consent.provider} · {consent.granted ? 'Allowed' : 'Not allowed'}</Text>
          <ScrollView nestedScrollEnabled style={[styles.noticeBox, { backgroundColor: tokens.surface }]}>
            <Text style={styles.notice}>{consent.notice}</Text>
          </ScrollView>
          <Pressable accessibilityRole="link" onPress={() => void Linking.openURL('https://ipurposesoul.com/ai-data-sharing')}>
            <Text style={[styles.link, { color: accentColor }]}>How AI data sharing works</Text>
          </Pressable>
          <Pressable accessibilityRole="link" onPress={() => void Linking.openURL('https://ipurposesoul.com/privacy')}>
            <Text style={[styles.link, { color: accentColor }]}>Privacy Policy</Text>
          </Pressable>
          {consent.granted ? (
            <Pressable accessibilityRole="button" disabled={saving} onPress={() => void choose(false)} style={secondaryStyle}>
              <Text style={secondaryTextStyle}>Withdraw AI permission</Text>
            </Pressable>
          ) : (
            <View style={styles.actions}>
              <Pressable accessibilityRole="button" disabled={saving} onPress={() => void choose(true)} style={[styles.primary, { backgroundColor: accentColor }]}>
                <Text style={styles.primaryText}>{saving ? 'Saving…' : 'Allow OpenAI data sharing'}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" disabled={saving} onPress={() => void choose(false)} style={secondaryStyle}>
                <Text style={secondaryTextStyle}>Decline / Not now</Text>
              </Pressable>
            </View>
          )}
          <Text style={styles.caption}>This choice can be changed in Account. Declining does not block your other iPurpose features.</Text>
        </>
      ) : (
        <Pressable accessibilityRole="button" onPress={() => void refresh(() => true)} style={secondaryStyle}>
          <Text style={secondaryTextStyle}>Retry permission check</Text>
        </Pressable>
      )}
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 9 },
  heading: { color: theme.colors.deepIndigo, fontFamily: theme.fonts.heading, fontSize: 20 },
  provider: { color: theme.colors.deepIndigo, fontFamily: theme.fonts.body, fontSize: 13 },
  noticeBox: { maxHeight: 176, borderRadius: 12, padding: 10 },
  notice: { color: theme.colors.deepIndigo, fontFamily: theme.fonts.body, fontSize: 13, lineHeight: 19 },
  link: { fontFamily: theme.fonts.body, textDecorationLine: 'underline', fontSize: 13 },
  actions: { gap: 8 },
  primary: { padding: 12, borderRadius: 12, alignItems: 'center' },
  primaryText: { color: theme.colors.white, fontFamily: theme.fonts.body, fontSize: 14 },
  secondary: { borderWidth: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
  secondaryText: { fontFamily: theme.fonts.body, fontSize: 14 },
  caption: { color: theme.colors.deepIndigo, fontFamily: theme.fonts.body, fontSize: 12, lineHeight: 17 },
  error: { color: theme.colors.deepIndigo, fontFamily: theme.fonts.body, fontSize: 13 },
});
