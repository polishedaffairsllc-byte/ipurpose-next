import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { BrandHeader } from '../../components/BrandHeader';
import { getCompanionProfile } from '../../lib/api';
import type { CompanionProfile } from '../../types/companion';
import { theme } from '../../theme';

export default function AnchorScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<CompanionProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    getCompanionProfile().then((next) => { if (active) setProfile(next); }).catch(() => { if (active) setProfile(null); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []));

  return (
    <LinearGradient colors={theme.homeGradient.colors} locations={theme.homeGradient.locations} start={theme.homeGradient.start} end={theme.homeGradient.end} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.topRow}>
            <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={20} color={theme.colors.textOnDark} />
            </Pressable>
            <BrandHeader subtitle="Your iPurpose identity" variant="dark-background" />
          </View>
          <View style={styles.hero}>
            <Text style={styles.kicker}>YOUR ANCHOR</Text>
            <Text style={styles.title}>A reminder of the pattern Compass sees in you.</Text>
          </View>
          {loading ? <ActivityIndicator color={theme.colors.champagneText} /> : (
            <>
              <GlassSection label="PRIMARY ARCHETYPE" value={profile?.archetypePrimary || 'Not set yet'} prominent />
              {profile?.identityAnchor ? <GlassSection label="YOUR IDENTITY ANCHOR" value={profile.identityAnchor} /> : null}
              {profile?.purposeStatement ? <GlassSection label="YOUR PURPOSE" value={profile.purposeStatement} /> : null}
              {profile?.archetypeSecondary ? <GlassSection label="SECONDARY ARCHETYPE" value={profile.archetypeSecondary} /> : null}
              {!profile?.identityAnchor && !profile?.purposeStatement && !profile?.archetypeSecondary ? (
                <BlurView intensity={30} tint="dark" style={styles.card}>
                  <Text style={styles.body}>Your Anchor reflects the pattern Compass currently recognizes in how you move through purpose, decisions, and action.</Text>
                </BlurView>
              ) : null}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function GlassSection({ label, value, prominent = false }: { label: string; value: string; prominent?: boolean }) {
  return <BlurView intensity={30} tint="dark" style={styles.card}><Text style={styles.kicker}>{label}</Text><Text style={prominent ? styles.prominent : styles.body}>{value}</Text></BlurView>;
}

const styles = StyleSheet.create({
  gradient: { flex: 1 }, safe: { flex: 1 }, container: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 36 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, backButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.glassPillBg, borderWidth: 1, borderColor: theme.colors.glassPillBorder },
  hero: { marginTop: 30, marginBottom: 20 }, kicker: { fontFamily: theme.fonts.body, fontSize: 10, letterSpacing: 1.2, color: theme.colors.champagneText },
  title: { fontFamily: theme.fonts.heading, fontSize: 30, lineHeight: 37, color: theme.colors.textOnDark, marginTop: 7 },
  card: { borderRadius: 20, borderWidth: 1, borderColor: theme.colors.glassCardBorder, backgroundColor: theme.colors.glassCardBg, padding: 18, marginBottom: 14, overflow: 'hidden' },
  prominent: { fontFamily: theme.fonts.heading, fontSize: 28, color: theme.colors.textOnDark, marginTop: 8 },
  body: { fontFamily: theme.fonts.body, fontSize: 14, lineHeight: 22, color: theme.colors.textOnDarkMuted, marginTop: 8 },
});
