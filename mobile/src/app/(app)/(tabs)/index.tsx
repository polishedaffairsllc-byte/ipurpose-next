// mobile/src/app/(app)/(tabs)/index.tsx
// Restyled to the iPurpose Style Bible v5 (see ../../../theme.ts)
import { useCallback, useState } from 'react';
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
import { BrandHeader } from '../../../components/BrandHeader';
import { getConversations } from '../../../lib/api';
import type { ConversationSummary } from '../../../types/companion';
import { theme } from '../../../theme';

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

export default function HomeScreen() {
  const router = useRouter();
  const [latestConversation, setLatestConversation] =
    useState<ConversationSummary | null>(null);
  const [conversationCount, setConversationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadHome() {
        try {
          const conversations = await getConversations();

          if (!active) return;

          setConversationCount(conversations.length);
          setLatestConversation(conversations[0] || null);
        } catch {
          if (!active) return;

          setConversationCount(0);
          setLatestConversation(null);
        } finally {
          if (active) setLoading(false);
        }
      }

      loadHome();

      return () => {
        active = false;
      };
    }, [])
  );

  const openMentor = () => router.push('/mentor');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <BrandHeader subtitle="Soul → Systems → AI™" />

        <View style={styles.hero}>
          <Text style={styles.kicker}>YOUR ALIGNMENT SPACE</Text>

          <Text style={styles.title}>
            What needs your attention today?
          </Text>

          <Text style={styles.body}>
            Start with what is true, shape the next aligned step, then use AI
            where it actually helps.
          </Text>

          <Pressable onPress={openMentor} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>
              Talk it through with Mentor
            </Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CONTINUE</Text>
          <Text style={styles.sectionTitle}>Pick up where you left off.</Text>

          {loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator color={theme.colors.plum} />
              <Text style={styles.loadingText}>
                Finding your latest conversation…
              </Text>
            </View>
          ) : latestConversation ? (
            <Pressable onPress={openMentor} style={styles.continueCard}>
              <View style={styles.continueTopRow}>
                <View style={styles.continueIcon}>
                  <Text style={styles.continueIconText}>→</Text>
                </View>

                <Text style={styles.continueAction}>Continue</Text>
              </View>

              <Text style={styles.continueTitle} numberOfLines={2}>
                {latestConversation.title}
              </Text>

              <Text style={styles.continueMeta}>
                {latestConversation.messageCount}{' '}
                {latestConversation.messageCount === 1
                  ? 'message'
                  : 'messages'}
                {latestConversation.updatedAt
                  ? `  •  ${formatUpdatedAt(latestConversation.updatedAt)}`
                  : ''}
              </Text>
            </Pressable>
          ) : (
            <Pressable onPress={openMentor} style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                Start your first conversation.
              </Text>
              <Text style={styles.emptyBody}>
                Bring the decision, idea, tension, or next step that is on your
                mind.
              </Text>
              <Text style={styles.emptyAction}>Open Mentor →</Text>
            </Pressable>
          )}

          {conversationCount > 0 ? (
            <Text style={styles.historyNote}>
              Your Mentor remembers {conversationCount}{' '}
              {conversationCount === 1 ? 'conversation' : 'conversations'}.
            </Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CHOOSE YOUR LENS</Text>
          <Text style={styles.sectionTitle}>
            Begin where the work actually is.
          </Text>

          <Pressable onPress={openMentor} style={styles.lensCard}>
            <View style={[styles.lensMark, styles.soulMark]}>
              <Text style={styles.lensMarkText}>S</Text>
            </View>
            <View style={styles.lensCopy}>
              <Text style={styles.lensName}>Soul</Text>
              <Text style={styles.lensQuestion}>What is true?</Text>
              <Text style={styles.lensDescription}>
                Clarify what matters before you decide what to do.
              </Text>
            </View>
          </Pressable>

          <Pressable onPress={openMentor} style={styles.lensCard}>
            <View style={[styles.lensMark, styles.systemsMark]}>
              <Text style={styles.lensMarkText}>S</Text>
            </View>
            <View style={styles.lensCopy}>
              <Text style={styles.lensName}>Systems</Text>
              <Text style={styles.lensQuestion}>What needs structure?</Text>
              <Text style={styles.lensDescription}>
                Turn insight into a clear, workable next step.
              </Text>
            </View>
          </Pressable>

          <Pressable onPress={openMentor} style={styles.lensCard}>
            <View style={[styles.lensMark, styles.aiMark]}>
              <Text style={styles.lensMarkText}>AI</Text>
            </View>
            <View style={styles.lensCopy}>
              <Text style={styles.lensName}>AI</Text>
              <Text style={styles.lensQuestion}>What can be amplified?</Text>
              <Text style={styles.lensDescription}>
                Use AI after the direction is clear — not instead of clarity.
              </Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.footerCard}>
          <Text style={styles.footerLabel}>THE iPURPOSE METHOD</Text>
          <Text style={styles.footerText}>
            Alignment before action. Structure before scale. Automation after
            clarity.
          </Text>
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
    paddingTop: 8,
    paddingBottom: 36,
  },

  hero: {
    marginTop: 34,
  },

  kicker: {
    color: theme.colors.plum,
    fontFamily: theme.fonts.body,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
  },

  title: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.heading,
    fontSize: 32,
    lineHeight: 39,
    marginTop: 10,
    letterSpacing: 0.2,
  },

  body: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
  },

  primaryButton: {
    backgroundColor: theme.colors.plum,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 22,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    fontWeight: '700',
  },

  section: {
    marginTop: 36,
  },

  sectionLabel: {
    color: theme.colors.plum,
    fontFamily: theme.fonts.body,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
  },

  sectionTitle: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.heading,
    fontSize: 22,
    lineHeight: 28,
    marginTop: 6,
    marginBottom: 14,
  },

  loadingCard: {
    minHeight: 118,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.white,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 20,
  },

  loadingText: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 13,
  },

  continueCard: {
    backgroundColor: theme.colors.plumDark,
    borderRadius: 24,
    padding: 20,
  },

  continueTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  continueIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  continueIconText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: '700',
  },

  continueAction: {
    color: theme.colors.white,
    opacity: 0.85,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    fontWeight: '700',
  },

  continueTitle: {
    color: theme.colors.white,
    fontFamily: theme.fonts.heading,
    fontSize: 21,
    lineHeight: 27,
    marginTop: 18,
  },

  continueMeta: {
    color: theme.colors.white,
    opacity: 0.72,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    marginTop: 10,
  },

  historyNote: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    marginTop: 10,
    marginLeft: 4,
  },

  emptyCard: {
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.white,
    borderRadius: 24,
    padding: 20,
  },

  emptyTitle: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.heading,
    fontSize: 18,
  },

  emptyBody: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 7,
  },

  emptyAction: {
    color: theme.colors.plum,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 16,
  },

  lensCard: {
    flexDirection: 'row',
    gap: 14,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.white,
    borderRadius: 22,
    padding: 16,
    marginBottom: 11,
  },

  lensMark: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  soulMark: {
    backgroundColor: theme.colors.soulTint,
  },

  systemsMark: {
    backgroundColor: theme.colors.systemsTint,
  },

  aiMark: {
    backgroundColor: theme.colors.aiTint,
  },

  lensMarkText: {
    color: theme.colors.plumDark,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    fontWeight: '700',
  },

  lensCopy: {
    flex: 1,
  },

  lensName: {
    color: theme.colors.plum,
    fontFamily: theme.fonts.body,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  lensQuestion: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.heading,
    fontSize: 16,
    marginTop: 2,
  },

  lensDescription: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },

  footerCard: {
    backgroundColor: theme.colors.blush,
    borderRadius: 22,
    padding: 18,
    marginTop: 26,
  },

  footerLabel: {
    color: theme.colors.plumDark,
    fontFamily: theme.fonts.body,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },

  footerText: {
    color: theme.colors.plumDark,
    fontFamily: theme.fonts.heading,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
  },
});
