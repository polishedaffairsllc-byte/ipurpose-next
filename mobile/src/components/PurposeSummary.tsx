import { useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { usePurposeCheck } from '../context/PurposeCheckContext';
import { useVisualEnvironment } from '../context/VisualEnvironmentContext';
import { purposeProfileDetails } from '../lib/purposeProfiles';
import { theme } from '../theme';

export function PurposeSummary({ atmosphere = false }: { atmosphere?: boolean }) {
  const { profile, loading, error, refresh } = usePurposeCheck();
  const { tokens } = useVisualEnvironment();
  const router = useRouter();
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));
  const details = profile ? purposeProfileDetails(profile) : null;
  const color = atmosphere ? tokens.atmosphereText : theme.colors.deepIndigo;
  return <View style={[styles.card, { backgroundColor: atmosphere ? tokens.glassCardBackground : tokens.surface, borderColor: atmosphere ? tokens.glassCardBorder : tokens.surfaceBorder }]}>
    <Text accessibilityRole="header" style={[styles.heading, { color }]}>Your Purpose</Text>
    {loading ? <ActivityIndicator accessibilityLabel="Loading your Purpose results" color={tokens.accentStrong} /> : error ? <>
      <Text accessibilityRole="alert" style={[styles.body, { color }]}>{error}</Text>
      <Pressable accessibilityRole="button" onPress={() => void refresh()} style={styles.link}><Text style={[styles.body, { color }]}>Try again</Text></Pressable>
    </> : <>
      {details ? <>
        <Text style={[styles.heading, { color }]}>{details.name}</Text>
        <Text style={[styles.body, { color }]}>{details.direction}</Text>
        <Text style={[styles.body, { color }]}>People served: {details.audience.join(' · ')}</Text>
        <Text style={[styles.body, { color }]}>Desired impact: {details.impact}</Text>
      </> : <Text style={[styles.body, { color }]}>Explore what keeps drawing you forward and why it matters.</Text>}
      <Pressable accessibilityRole="button" onPress={() => router.push('/purpose')} style={styles.link}><Text style={[styles.body, { color }]}>{details ? 'View my full Purpose profile' : 'Take the Purpose Check'}</Text></Pressable>
    </>}
  </View>;
}
const styles = StyleSheet.create({ card: { padding: 20, borderRadius: 22, borderWidth: 1, marginBottom: 18 }, heading: { fontFamily: theme.fonts.heading, fontSize: 22, lineHeight: 30, marginBottom: 10 }, body: { fontFamily: theme.fonts.body, fontSize: 15, lineHeight: 24, marginBottom: 6 }, link: { minHeight: 48, justifyContent: 'center', paddingVertical: 10 } });
