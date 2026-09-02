import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getCompanionProfile, getConversations } from '../../../lib/api';
import type {
  CompanionProfile,
  ConversationSummary,
} from '../../../types/companion';
import { theme } from '../../../theme';

const LOGO_URI = 'https://www.ipurposesoul.com/images/my-logo.png';

function formatUpdatedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

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

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function getGreeting(displayName?: string) {
  const firstName = displayName?.trim().split(/\s+/)[0];

  if (!firstName) {
    return 'Welcome back.';
  }

  const hour = new Date().getHours();
  const greeting =
    hour >= 5 && hour < 12
      ? 'Good morning'
      : hour >= 12 && hour < 17
        ? 'Good afternoon'
        : 'Good evening';

  return `${greeting}, ${firstName}.`;
}

function meaningfulFocusAreas(profile: CompanionProfile | null) {
  return (profile?.focusAreas || [])
    .map((focusArea) => focusArea.trim())
    .filter(Boolean)
    .slice(0, 2);
}

export default function HomeScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<CompanionProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [latestConversation, setLatestConversation] =
    useState<ConversationSummary | null>(null);
  const [conversationLoading, setConversationLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadProfile() {
        setProfileLoading(true);

        try {
          const nextProfile = await getCompanionProfile();
          if (active) setProfile(nextProfile);
        } catch {
          if (active) setProfile(null);
        } finally {
          if (active) setProfileLoading(false);
        }
      }

      async function loadRecentJourney() {
        setConversationLoading(true);

        try {
          const conversations = await getConversations();
          if (active) setLatestConversation(conversations[0] || null);
        } catch {
          if (active) setLatestConversation(null);
        } finally {
          if (active) setConversationLoading(false);
        }
      }

      loadProfile();
      loadRecentJourney();

      return () => {
        active = false;
      };
    }, [])
  );

  const focusAreas = meaningfulFocusAreas(profile);
  const openCompass = () => router.push('/mentor');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greetingSection}>
          <View style={styles.brandRow}>
            <View style={styles.logoShell}>
              <View style={styles.logoFrost} />
              <Image
                accessibilityLabel="iPurpose Compass logo"
                source={{ uri: LOGO_URI }}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.brandName}>iPurpose Compass</Text>
          </View>

          <Text style={styles.greeting}>{getGreeting(profile?.displayName)}</Text>
        </View>

        <View style={[styles.card, styles.anchorCard]}>
          <Text style={styles.eyebrow}>YOUR ANCHOR</Text>
          {profileLoading ? (
            <View style={styles.skeletonLine} />
          ) : profile?.archetypePrimary ? (
            <>
              <Text style={styles.cardTitle}>{profile.archetypePrimary}</Text>
              {profile.identityAnchor ? (
                <Text style={styles.cardBody}>{profile.identityAnchor}</Text>
              ) : null}
            </>
          ) : (
            <Text style={styles.cardBody}>
              Your anchor will take shape as you use Compass.
            </Text>
          )}
        </View>

        <View style={[styles.card, styles.focusCard]}>
          <Text style={styles.eyebrow}>RIGHT NOW</Text>
          {profileLoading ? (
            <View style={styles.skeletonLine} />
          ) : focusAreas.length ? (
            <View style={styles.focusList}>
              {focusAreas.map((focusArea) => (
                <View key={focusArea} style={styles.focusRow}>
                  <View style={styles.focusMark} />
                  <Text style={styles.focusText}>{focusArea}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.cardBody}>
              Nothing set yet — start with Compass.
            </Text>
          )}
        </View>

        <View style={[styles.card, styles.journeyCard]}>
          <Text style={styles.journeyEyebrow}>YOUR JOURNEY</Text>
          {conversationLoading ? (
            <View style={styles.journeyLoading}>
              <ActivityIndicator color={theme.colors.white} />
              <Text style={styles.journeyLoadingText}>
                Finding your latest conversation…
              </Text>
            </View>
          ) : latestConversation ? (
            <>
              <Text style={styles.journeyTitle} numberOfLines={2}>
                {latestConversation.title}
              </Text>
              {latestConversation.updatedAt ? (
                <Text style={styles.journeyMeta}>
                  {formatUpdatedAt(latestConversation.updatedAt)}
                </Text>
              ) : null}
            </>
          ) : (
            <>
              <Text style={styles.journeyTitle}>
                Start your first conversation.
              </Text>
              <Text style={styles.journeyBody}>
                Bring the decision, idea, tension, or next step that is on your
                mind.
              </Text>
            </>
          )}
        </View>

        <View style={styles.actionSection}>
          <Pressable
            accessibilityRole="button"
            onPress={openCompass}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed ? styles.primaryButtonPressed : null,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              Talk it through in Compass
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.cream,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 18,
  },
  greetingSection: {
    paddingBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoShell: {
    width: 58,
    height: 58,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoFrost: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.soulTint,
    opacity: 0.62,
  },
  logo: {
    width: 50,
    height: 50,
  },
  brandName: {
    flex: 1,
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  greeting: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.heading,
    fontSize: 32,
    lineHeight: 39,
    marginTop: 24,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  anchorCard: {
    backgroundColor: theme.colors.soulTint,
  },
  focusCard: {
    backgroundColor: theme.colors.systemsTint,
  },
  eyebrow: {
    color: theme.colors.plumDark,
    fontFamily: theme.fonts.body,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  cardTitle: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.heading,
    fontSize: 24,
    lineHeight: 30,
    marginTop: 10,
  },
  cardBody: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  skeletonLine: {
    width: '64%',
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.line,
    marginTop: 14,
  },
  focusList: {
    gap: 12,
    marginTop: 14,
  },
  focusRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
  },
  focusMark: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.sageGreen,
    marginTop: 6,
  },
  focusText: {
    flex: 1,
    color: theme.colors.ink,
    fontFamily: theme.fonts.body,
    fontSize: 16,
    lineHeight: 22,
  },
  journeyCard: {
    minHeight: 148,
    backgroundColor: theme.colors.plumDark,
    borderColor: theme.colors.plumDark,
  },
  journeyEyebrow: {
    color: theme.colors.white,
    opacity: 0.74,
    fontFamily: theme.fonts.body,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  journeyLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingTop: 18,
  },
  journeyLoadingText: {
    color: theme.colors.white,
    opacity: 0.74,
    fontFamily: theme.fonts.body,
    fontSize: 13,
  },
  journeyTitle: {
    color: theme.colors.white,
    fontFamily: theme.fonts.heading,
    fontSize: 22,
    lineHeight: 28,
    marginTop: 16,
  },
  journeyMeta: {
    color: theme.colors.white,
    opacity: 0.72,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    marginTop: 10,
  },
  journeyBody: {
    color: theme.colors.white,
    opacity: 0.78,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  actionSection: {
    paddingTop: 4,
  },
  primaryButton: {
    backgroundColor: theme.colors.plum,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 17,
    alignItems: 'center',
  },
  primaryButtonPressed: {
    opacity: 0.82,
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    fontWeight: '700',
  },
});
