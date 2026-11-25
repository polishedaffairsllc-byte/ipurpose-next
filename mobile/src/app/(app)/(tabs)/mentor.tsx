import { useCallback, useEffect, useRef, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  ActivityIndicator,
  AppState,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { EnvironmentBackground } from '../../../components/EnvironmentBackground';
import { BrandHeader } from '../../../components/BrandHeader';
import { JourneyHeading } from '../../../components/JourneyHeading';
import { AiDataSharingControls } from '../../../components/AiDataSharingControls';
import { ConversationList } from '../../../components/ConversationList';
import { MessageBubble } from '../../../components/MessageBubble';
import { ReportResponseModal } from '../../../components/ReportResponseModal';
import { IntroReplay } from '../../../components/IntroReplay';
import { useVisualEnvironment } from '../../../context/VisualEnvironmentContext';
import { createCompassRequestId, getAiConsent, getConversation, getConversations, reportAiResponse, sendMentorMessage } from '../../../lib/api';
import { createActivitySessionId, logUserActivity } from '../../../lib/userActivity';
import type { CompanionMessage, ConversationSummary } from '../../../types/companion';
import { theme } from '../../../theme';

const STARTERS = [
  { label: 'Soul', prompt: 'Help me clarify what is true about what I am facing right now.' },
  { label: 'Systems', prompt: 'Help me turn what I am thinking about into a clear next step.' },
  { label: 'AI', prompt: 'Help me decide where AI can actually support me here.' },
];

export default function MentorScreen() {
  const { tokens } = useVisualEnvironment();
  const params = useLocalSearchParams<{ conversationId?: string | string[] }>();
  const requestedConversationId = Array.isArray(params.conversationId)
    ? params.conversationId[0]
    : params.conversationId;
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<CompanionMessage[]>([]);
  const [input, setInput] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportMessage, setReportMessage] = useState<CompanionMessage | null>(null);
  const listRef = useRef<FlatList<CompanionMessage>>(null);
  const compassSession = useRef<{ id: string; startedAt: number } | null>(null);
  const pendingDraft = useRef<{ requestId: string; message: string; conversationId?: string } | null>(null);
  const [consentGranted, setConsentGranted] = useState(false);
  const [consentLoading, setConsentLoading] = useState(true);

  // Recheck on every visit so withdrawal on another screen/device fails closed.
  useFocusEffect(useCallback(() => {
    let active = true;
    setConsentLoading(true);
    getAiConsent()
      .then(permission => { if (active) setConsentGranted(permission.granted); })
      .catch(() => { if (active) setConsentGranted(false); })
      .finally(() => { if (active) setConsentLoading(false); });
    return () => { active = false; };
  }, []));

  useFocusEffect(useCallback(() => {
    const startSession = () => {
      if (compassSession.current) return;
      const session = { id: createActivitySessionId('compass'), startedAt: Date.now() };
      compassSession.current = session;
      void logUserActivity({ type: 'compass_enter', sessionId: session.id });
    };
    const endSession = (reason: 'blur' | 'background') => {
      const session = compassSession.current;
      if (!session) return;
      compassSession.current = null;
      void logUserActivity({
        type: 'compass_exit',
        sessionId: session.id,
        durationMs: Math.max(0, Date.now() - session.startedAt),
        reason,
      });
    };

    startSession();
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') startSession();
      else endSession('background');
    });
    return () => {
      subscription.remove();
      endSession('blur');
    };
  }, []));

  const loadConversation = useCallback(async (id: string) => {
    setLoadingHistory(true);
    setError(null);
    setReportMessage(null);
    try {
      const loaded = await getConversation(id);
      setConversationId(id);
      setMessages(loaded);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load that conversation.');
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      setLoadingHistory(true);
      setError(null);
      try {
        const available = await getConversations();
        if (cancelled) return;
        setConversations(available);
        const initialConversationId = requestedConversationId || available[0]?.id;
        if (initialConversationId) {
          const loaded = await getConversation(initialConversationId);
          if (cancelled) return;
          setConversationId(initialConversationId);
          setMessages(loaded);
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : 'Unable to load your Compass.');
        }
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    }
    boot();
    return () => {
      cancelled = true;
    };
  }, [requestedConversationId]);

  function startNewConversation() {
    setReportMessage(null);
    setConversationId(null);
    setMessages([]);
    setInput('');
    pendingDraft.current = null;
    setError(null);
  }

  async function send() {
    const text = input.trim();
    if (!text || sending || !consentGranted) return;

    const existing = pendingDraft.current;
    const currentConversationId = conversationId || undefined;
    const requestId = existing?.message === text && existing.conversationId === currentConversationId
      ? existing.requestId
      : createCompassRequestId();
    // Preserve the ID across a failed/uncertain response so the backend cannot
    // generate a duplicate provider response when the user retries the same draft.
    pendingDraft.current = { requestId, message: text, conversationId: currentConversationId };
    const localMessageId = `local-user-${requestId}`;
    const localUserMessage: CompanionMessage = {
      id: localMessageId,
      role: 'user',
      content: text,
      responseMode: 'balanced',
      sequence: messages.length + 1,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current.filter(item => item.id !== localMessageId), localUserMessage]);
    setInput('');
    setSending(true);
    setError(null);

    try {
      const result = await sendMentorMessage({
        message: text,
        requestId,
        conversationId: currentConversationId,
        responseMode: 'balanced',
      });

      const localAssistantMessage: CompanionMessage = {
        id: `local-assistant-${requestId}`,
        role: 'assistant',
        content: result.response,
        responseMode: result.responseMode,
        sequence: messages.length + 2,
        createdAt: new Date().toISOString(),
        inferredLens: result.inferredLens,
      };

      pendingDraft.current = null;
      setConversationId(result.conversationId);
      setMessages((current) => [...current, localAssistantMessage]);
      // Replace optimistic IDs with canonical stored message IDs when available.
      // Reporting uses only canonical assistant IDs owned by this conversation.
      const persistedMessages = await getConversation(result.conversationId).catch(() => null);
      if (persistedMessages) setMessages(persistedMessages);
      void logUserActivity({
        type: 'compass_message',
        sessionId: compassSession.current?.id,
        conversationId: result.conversationId,
      });
      // A failed refresh must not misrepresent a successful, persisted reply.
      const updatedConversations = await getConversations().catch(() => null);
      if (updatedConversations) setConversations(updatedConversations);
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
    } catch (caught) {
      setMessages(current => current.filter(item => item.id !== localMessageId));
      setInput(current => current.trim() ? current : text);
      setError(caught instanceof Error ? caught.message : 'Compass could not respond. Your draft was restored.');
      // Keep pendingDraft to reuse the ID if this exact message is submitted again.
    } finally {
      setSending(false);
    }
  }

  const permission = consentLoading ? (
    <View style={styles.consentLoading}>
      <ActivityIndicator accessibilityLabel="Checking AI permission" color={tokens.accentStrong} />
    </View>
  ) : !consentGranted ? (
    <AiDataSharingControls onChange={setConsentGranted} />
  ) : null;

  return (
    <EnvironmentBackground atmosphere>
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <View style={styles.container}>
          <BrandHeader
            subtitle="Your space for aligned reflection and action"
            variant="dark-background"
          />

          <JourneyHeading title="Compass" subtitle="Think it through here." atmosphere />

          <View style={styles.conversationBar}>
            <View style={styles.conversations}>
              <ConversationList
                conversations={conversations}
                selectedId={conversationId}
                disabled={sending || loadingHistory}
                onNew={startNewConversation}
                onSelect={loadConversation}
                hideNew
              />
            </View>
            <Pressable
              onPress={startNewConversation}
              disabled={sending || loadingHistory}
              accessibilityRole="button"
              accessibilityLabel="Start a new conversation"
              style={[styles.newButton, { backgroundColor: tokens.surface, borderColor: tokens.surfaceBorder }]}
            >
              <Ionicons name="add" size={18} color={tokens.screenText} />
              <Text style={[styles.newButtonText, { color: tokens.screenText }]}>New</Text>
            </Pressable>
          </View>

          <View style={[styles.chat, { backgroundColor: tokens.glassCardDeepBackground, borderColor: tokens.glassCardBorder }]}>
            {loadingHistory ? (
              <View style={styles.center}>
                <ActivityIndicator color={tokens.accent} />
                <Text style={styles.muted}>Loading your conversation…</Text>
              </View>
            ) : messages.length === 0 ? (
              <ScrollView
                contentContainerStyle={permission ? styles.permission : styles.empty}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
              >
                {permission ?? <>
                <View style={[styles.emptyMark, { backgroundColor: tokens.glassPillBackground }]}>
                  <Ionicons name="sparkles-outline" size={22} color={tokens.accent} />
                </View>

                <Text style={styles.emptyTitle}>What are you thinking through?</Text>

                <Text style={styles.emptyBody}>
                  Start with the part that feels unclear, important, unfinished, or ready to move.
                </Text>

                <View style={styles.starters}>
                  {STARTERS.map((starter, index) => (
                    <Pressable
                      key={starter.label}
                      onPress={() => setInput(starter.prompt)}
                      style={[
                        styles.starter,
                        { backgroundColor: tokens.glassPillBackground, borderColor: tokens.glassPillBorder },
                      ]}
                    >
                      <Text style={styles.starterLabel}>{starter.label}</Text>
                      <Text style={styles.starterPrompt}>
                        {index === 0
                          ? 'Clarify what is true'
                          : index === 1
                            ? 'Structure the next step'
                            : 'Decide where AI can help'}
                      </Text>
                      <Ionicons name="arrow-forward" size={17} color={tokens.accent} />
                    </Pressable>
                  ))}
                </View>
                </>}
              </ScrollView>
            ) : (
              <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <MessageBubble message={item} onReport={setReportMessage} />}
                ListFooterComponent={permission}
                contentContainerStyle={styles.messageList}
                keyboardShouldPersistTaps="handled"
                onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
              />
            )}
          </View>

          {error ? (
            <View style={styles.errorCard}>
              <Ionicons name="information-circle-outline" size={17} color={theme.colors.deepIndigo} />
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : null}

          <ReportResponseModal
            key={reportMessage?.id ?? 'closed-report'}
            visible={!!reportMessage}
            onClose={() => setReportMessage(null)}
            onSubmit={async (reason, details) => {
              const target = reportMessage;
              if (!conversationId || !target || target.role !== 'assistant' || target.id.startsWith('local-')) {
                throw new Error('Please reopen the saved conversation before reporting this response.');
              }
              await reportAiResponse({ conversationId, messageId: target.id, reason, details });
            }}
          />

          {consentGranted && !consentLoading ? (
          <View style={styles.composer}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Share what you're thinking through…"
              placeholderTextColor={theme.colors.muted}
              multiline
              maxLength={4000}
              editable={!sending && !loadingHistory}
              style={[
                styles.input,
              ]}
            />

            <Pressable
              onPress={send}
              disabled={sending || loadingHistory || !input.trim()}
              accessibilityLabel="Send message"
              style={[
                styles.send,
                {
                  backgroundColor: tokens.buttonBackground,
                  borderColor: tokens.accentStrong,
                },
                (sending || loadingHistory || !input.trim()) && styles.sendDisabled,
              ]}
            >
              {sending ? (
                <ActivityIndicator color={tokens.buttonText} />
              ) : (
                <Ionicons name="arrow-up" size={21} color={tokens.buttonText} />
              )}
            </Pressable>
          </View>
          ) : null}
          <IntroReplay kind="compass" returnLabel="Return to Compass" autoShowOnFirstVisit />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </EnvironmentBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },
  container: { flex: 1, paddingTop: 8, paddingHorizontal: 20 },
  conversationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  newButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: 999,
    backgroundColor: theme.colors.white,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  newButtonText: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.body,
    ...theme.typography.button,
  },
  conversations: { flex: 1, minWidth: 0 },
  chat: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: 24,
    overflow: 'hidden',
  },
  messageList: { paddingHorizontal: 14, paddingTop: 18, paddingBottom: 22 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  muted: {
    color: theme.colors.textOnDarkMuted,
    fontFamily: theme.fonts.body,
    ...theme.typography.body,
  },
  empty: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 24,
  },
  emptyMark: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: theme.colors.aiTint,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    color: theme.colors.textOnDark,
    fontFamily: theme.fonts.heading,
    ...theme.typography.sectionTitle,
    textAlign: 'center',
  },
  emptyBody: {
    color: theme.colors.textOnDarkMuted,
    fontFamily: theme.fonts.body,
    ...theme.typography.body,
    textAlign: 'center',
    marginTop: 8,
  },
  starters: { gap: 9, marginTop: 22 },
  starter: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  starterLabel: {
    minWidth: 60,
    flexShrink: 1,
    color: theme.colors.textOnDarkMuted,
    fontFamily: theme.fonts.body,
    ...theme.typography.label,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  starterPrompt: {
    flex: 1,
    color: theme.colors.textOnDark,
    fontFamily: theme.fonts.body,
    ...theme.typography.body,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    backgroundColor: theme.colors.aiTint,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 8,
  },
  error: {
    flex: 1,
    color: theme.colors.ink,
    fontFamily: theme.fonts.body,
    ...theme.typography.supporting,
  },
  consentLoading: { paddingVertical: 12, alignItems: 'center' },
  permission: { padding: 12 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    minHeight: 50,
    maxHeight: 118,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: 13,
    paddingBottom: 12,
    color: theme.colors.ink,
    backgroundColor: theme.colors.white,
    fontFamily: theme.fonts.body,
    ...theme.typography.input,
  },
  send: {
    width: 50,
    height: 50,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: theme.colors.lavenderPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.36 },
});
