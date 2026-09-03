// mobile/src/app/(app)/(tabs)/index.tsx
// PR #35 — visual redesign only. Functional behavior preserved exactly:
// getCompanionProfile(), getConversations(), formatUpdatedAt(),
// router.push('/mentor'), API base https://ipurposesoul.com are untouched.
import { useCallback, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { BrandHeader } from '../../../components/BrandHeader';
import { useAuth } from '../../../context/AuthContext';
import { useVisualEnvironment } from '../../../context/VisualEnvironmentContext';
import { getCompanionProfile, getConversations } from '../../../lib/api';
import { getGreetingName } from '../../../lib/profileIdentity';
import type { CompanionProfile, ConversationSummary } from '../../../types/companion';
import { theme } from '../../../theme';

// TODO: point at the real asset path for the faint compass-rose/star
// background texture, if/when that asset exists. Left out entirely for
// now rather than guessed at — see open question in the PR notes.
// const COMPASS_TEXTURE = require('../../../../assets/brand/compass-texture.png');

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { tokens } = useVisualEnvironment();
  const [profile, setProfile] = useState<CompanionProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);

  const [latestConversation, setLatestConversation] =
    useState<ConversationSummary | null>(null);
  const [conversationLoading, setConversationLoading] = useState(true);

  // Two independent fetches, per spec — one failing must not block the other.
  useFocusEffect(
    useCallback(() => {
      let active = true;

      getCompanionProfile()
        .then((result) => {
          if (active) setProfile(result);
        })
        .catch(() => {
          if (active) setProfileError(true);
        })
        .finally(() => {
          if (active) setProfileLoading(false);
        });

      return () => {
        active = false;
      };
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadConversations() {
        try {
          const conversations = await getConversations();
          if (!active) return;
          setLatestConversation(conversations[0] || null);
        } catch {
          if (!active) return;
          setLatestConversation(null);
        } finally {
          if (active) setConversationLoading(false);
        }
      }

      loadConversations();

      return () => {
        active = false;
      };
    }, [])
  );

  const openMentor = () => router.push('/mentor');
  const openAnchor = () => router.push('/anchor');
  const openFocus = () => router.push('/focus');
  const openLatestJourney = () => {
    if (!latestConversation) {
      openMentor();
      return;
    }
    router.push({ pathname: '/mentor', params: { conversationId: latestConversation.id } });
  };

  const firstName = getGreetingName(
    profile?.displayName,
    user?.displayName,
    user?.email
  );
  const greeting = firstName
    ? `${getTimeOfDayGreeting()}, ${firstName}.`
    : `${getTimeOfDayGreeting()}.`;

  const hasProfileData = !profileError && !!profile;
  const focusAreas = (profile?.focusAreas ?? []).slice(0, 2);

  return (
    <LinearGradient
      colors={tokens.atmosphereGradient.colors}
      locations={tokens.atmosphereGradient.locations}
      start={tokens.atmosphereGradient.start}
      end={tokens.atmosphereGradient.end}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <BrandHeader subtitle="Soul → Systems → AI™" variant="dark-background" />

          <View style={styles.hero}>
            <Text style={[styles.greeting, { color: tokens.atmosphereText }]}>{greeting}</Text>
            <Text style={[styles.heroSubtitle, { color: tokens.atmosphereTextMuted }]}>
              Stay aligned. Follow your north.
            </Text>
          </View>

          {/* Your Anchor */}
          {profileLoading ? (
            <View style={[styles.glassCard, styles.skeletonCard, { backgroundColor: tokens.glassCardBackground, borderColor: tokens.glassCardBorder }]}>
              <ActivityIndicator color={tokens.accent} />
            </View>
          ) : (
            <Pressable accessibilityRole="button" accessibilityLabel="Open Your Anchor" onPress={openAnchor} style={({ pressed }) => pressed ? styles.interactivePressed : undefined}>
              <BlurView intensity={30} tint="dark" style={[styles.glassCard, { backgroundColor: tokens.glassCardBackground, borderColor: tokens.glassCardBorder }]}>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.eyebrow, { color: tokens.accent }]}>YOUR ANCHOR</Text>
                  <Ionicons name="chevron-forward" size={18} color={tokens.accent} />
                </View>
                {hasProfileData && profile?.archetypePrimary ? (
                  <>
                    <Text style={styles.anchorName}>{profile.archetypePrimary}</Text>
                    {profile.identityAnchor ? <Text style={styles.anchorDescription}>{profile.identityAnchor}</Text> : null}
                  </>
                ) : <Text style={styles.emptyText}>Take your Clarity Check to find your anchor.</Text>}
              </BlurView>
            </Pressable>
          )}

          {/* Right Now */}
          {!profileLoading ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Open Current Focus" onPress={openFocus} style={({ pressed }) => [styles.pillRow, { backgroundColor: tokens.glassPillBackground, borderColor: tokens.glassPillBorder }, pressed ? styles.interactivePressed : null]}>
              <View style={styles.cardHeaderRow}>
                <Text style={[styles.eyebrowStandalone, { color: tokens.accent }]}>RIGHT NOW</Text>
                <Ionicons name="chevron-forward" size={18} color={tokens.accent} />
              </View>
              {hasProfileData && focusAreas.length > 0 ? (
                <View style={styles.pillWrap}>{focusAreas.map((focus) => <View key={focus} style={[styles.pill, { backgroundColor: tokens.glassPillBackground, borderColor: tokens.glassPillBorder }]}><Text style={styles.pillText}>{focus}</Text></View>)}</View>
              ) : (
                <>
                  <Text style={styles.focusEmptyTitle}>Set your current focus</Text>
                  <Text style={styles.emptyTextSmall}>What deserves your attention right now?</Text>
                </>
              )}
            </Pressable>
          ) : null}

          {/* Your Journey */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={latestConversation ? 'Resume latest journey' : 'Start your first Compass conversation'}
            onPress={latestConversation ? openLatestJourney : openMentor}
            style={({ pressed }) => pressed ? styles.interactivePressed : undefined}
          >
            <BlurView intensity={45} tint="dark" style={[styles.glassCard, styles.journeyCard, { backgroundColor: tokens.glassCardDeepBackground, borderColor: tokens.glassCardBorder }]}>
              <View style={styles.cardHeaderRow}>
                <Text style={[styles.eyebrow, { color: tokens.accent }]}>YOUR JOURNEY</Text>
                <Ionicons name="chevron-forward" size={18} color={tokens.accent} />
              </View>
              {conversationLoading ? (
                <ActivityIndicator color={tokens.accent} />
              ) : latestConversation ? (
                <>
                  <Text style={styles.journeyTitle} numberOfLines={2}>{latestConversation.title}</Text>
                  <Text style={styles.journeyMeta}>{latestConversation.updatedAt ? formatUpdatedAt(latestConversation.updatedAt) : ''}</Text>
                </>
              ) : (
                <Text style={styles.journeyTitle}>Start your first conversation.</Text>
              )}
            </BlurView>
          </Pressable>

          {/* Next Action — exactly one, always renders */}
          <Pressable onPress={openMentor} style={[styles.primaryButton, { backgroundColor: tokens.buttonBackground }]}>
            <Text style={[styles.primaryButtonText, { color: tokens.buttonText }]}>
              Talk it through in Compass
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  safe: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 36,
  },

  hero: {
    marginTop: 30,
    marginBottom: 24,
  },

  greeting: {
    fontFamily: theme.fonts.heading,
    fontSize: 40,
    lineHeight: 48,
    color: theme.colors.textOnDark,
  },

  heroSubtitle: {
    fontFamily: theme.fonts.body,
    fontSize: 14,
    color: theme.colors.textOnDarkMuted,
    marginTop: 6,
  },

  glassCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.glassCardBorder,
    backgroundColor: theme.colors.glassCardBg,
    padding: 18,
    marginBottom: 14,
    overflow: 'hidden',
  },

  skeletonCard: {
    minHeight: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },

  eyebrow: {
    fontFamily: theme.fonts.body,
    fontSize: 10,
    letterSpacing: 1.2,
    color: theme.colors.champagneText,
    marginBottom: 6,
  },

  eyebrowStandalone: {
    fontFamily: theme.fonts.body,
    fontSize: 10,
    letterSpacing: 1.2,
    color: theme.colors.champagneText,
    marginBottom: 10,
  },

  anchorName: {
    fontFamily: theme.fonts.heading,
    fontSize: 22,
    color: theme.colors.textOnDark,
  },

  anchorDescription: {
    fontFamily: theme.fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.textOnDarkMuted,
    marginTop: 6,
  },

  emptyText: {
    fontFamily: theme.fonts.body,
    fontSize: 14,
    color: theme.colors.textOnDarkMuted,
  },

  emptyTextSmall: {
    fontFamily: theme.fonts.body,
    fontSize: 13,
    color: theme.colors.textOnDarkFaint,
  },

  pillRow: {
    marginBottom: 14,
  },

  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  pill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.glassPillBorder,
    backgroundColor: theme.colors.glassPillBg,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  pillText: {
    fontFamily: theme.fonts.body,
    fontSize: 13,
    color: theme.colors.textOnDark,
  },

  journeyCard: {
    backgroundColor: theme.colors.glassCardBgDeep,
  },

  journeyTitle: {
    fontFamily: theme.fonts.heading,
    fontSize: 19,
    color: theme.colors.textOnDark,
    marginTop: 2,
  },

  journeyMeta: {
    fontFamily: theme.fonts.body,
    fontSize: 12,
    color: theme.colors.textOnDarkFaint,
    marginTop: 6,
  },

  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  interactivePressed: { opacity: 0.72 },
  focusEmptyTitle: { fontFamily: theme.fonts.heading, fontSize: 19, color: theme.colors.textOnDark, marginBottom: 5 },

  primaryButton: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.glassCardBorder,
    backgroundColor: theme.colors.lavenderPurple,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 6,
  },

  primaryButtonText: {
    fontFamily: theme.fonts.body,
    fontSize: 15,
    color: theme.colors.textOnDark,
  },
});
