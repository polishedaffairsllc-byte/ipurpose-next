import { useCallback, useEffect, useRef, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { BrandHeader } from '../../../components/BrandHeader';
import { ConversationList } from '../../../components/ConversationList';
import { MessageBubble } from '../../../components/MessageBubble';
import { getConversation, getConversations, sendMentorMessage } from '../../../lib/api';
import type { CompanionMessage, ConversationSummary } from '../../../types/companion';
import { theme } from '../../../theme';

const STARTERS = [
  { label: 'Soul', prompt: 'Help me clarify what is true about what I am facing right now.' },
  { label: 'Systems', prompt: 'Help me turn what I am thinking about into a clear next step.' },
  { label: 'AI', prompt: 'Help me decide where AI can actually support me here.' },
];

export default function MentorScreen() {
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
  const listRef = useRef<FlatList<CompanionMessage>>(null);

  const loadConversation = useCallback(async (id: string) => {
    setLoadingHistory(true);
    setError(null);
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
    setConversationId(null);
    setMessages([]);
    setInput('');
    setError(null);
  }

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    const localUserMessage: CompanionMessage = {
      id: `local-user-${Date.now()}`,
      role: 'user',
      content: text,
      responseMode: 'balanced',
      sequence: messages.length + 1,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, localUserMessage]);
    setInput('');
    setSending(true);
    setError(null);

    try {
      const result = await sendMentorMessage({
        message: text,
        conversationId: conversationId || undefined,
        responseMode: 'balanced',
      });

      const localAssistantMessage: CompanionMessage = {
        id: `local-assistant-${Date.now()}`,
        role: 'assistant',
        content: result.response,
        responseMode: result.responseMode,
        sequence: messages.length + 2,
        createdAt: new Date().toISOString(),
        inferredLens: result.inferredLens,
      };

      setConversationId(result.conversationId);
      setMessages((current) => [...current, localAssistantMessage]);
      setConversations(await getConversations());

      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Compass could not respond. Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <View style={styles.container}>
          <BrandHeader
            subtitle="Your space for aligned reflection and action"
            variant="light-background"
          />

          <View style={styles.introRow}>
            <View style={styles.introCopy}>
              <Text style={styles.kicker}>COMPASS</Text>
              <Text style={styles.screenTitle}>Think it through here.</Text>
            </View>

            <Pressable
              onPress={startNewConversation}
              disabled={sending || loadingHistory}
              style={styles.newButton}
            >
              <Ionicons name="add" size={18} color={theme.colors.deepIndigo} />
              <Text style={styles.newButtonText}>New</Text>
            </Pressable>
          </View>

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

          <View style={styles.chat}>
            {loadingHistory ? (
              <View style={styles.center}>
                <ActivityIndicator color={theme.colors.lavenderPurple} />
                <Text style={styles.muted}>Loading your conversation…</Text>
              </View>
            ) : messages.length === 0 ? (
              <View style={styles.empty}>
                <View style={styles.emptyMark}>
                  <Ionicons name="sparkles-outline" size={22} color={theme.colors.deepIndigo} />
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
                        index === 0 && styles.soulStarter,
                        index === 1 && styles.systemsStarter,
                        index === 2 && styles.aiStarter,
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
                      <Ionicons name="arrow-forward" size={17} color={theme.colors.deepIndigo} />
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : (
              <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <MessageBubble message={item} />}
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

          <View style={styles.composer}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Share what you're thinking through…"
              placeholderTextColor={theme.colors.muted}
              multiline
              maxLength={4000}
              editable={!sending && !loadingHistory}
              style={styles.input}
            />

            <Pressable
              onPress={send}
              disabled={sending || loadingHistory || !input.trim()}
              accessibilityLabel="Send message"
              style={[
                styles.send,
                (sending || loadingHistory || !input.trim()) && styles.sendDisabled,
              ]}
            >
              {sending ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <Ionicons name="arrow-up" size={21} color={theme.colors.white} />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: theme.colors.cream },
  container: { flex: 1, paddingTop: 8, paddingHorizontal: 18 },
  introRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  introCopy: { flex: 1 },
  kicker: {
    color: theme.colors.lavenderPurple,
    fontFamily: theme.fonts.body,
    fontSize: 10,
    letterSpacing: 1.4,
  },
  screenTitle: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.heading,
    fontSize: 24,
    lineHeight: 30,
    marginTop: 2,
  },
  newButton: {
    minHeight: 38,
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
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.body,
    fontSize: 12,
  },
  conversations: { marginTop: 12, marginBottom: 12 },
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
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 14,
  },
  empty: {
    flex: 1,
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
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.heading,
    fontSize: 25,
    lineHeight: 31,
    textAlign: 'center',
  },
  emptyBody: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 21,
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
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  soulStarter: { backgroundColor: theme.colors.soulTint },
  systemsStarter: { backgroundColor: theme.colors.systemsTint },
  aiStarter: { backgroundColor: theme.colors.aiTint },
  starterLabel: {
    minWidth: 52,
    color: theme.colors.lavenderPurple,
    fontFamily: theme.fonts.body,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  starterPrompt: {
    flex: 1,
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    lineHeight: 18,
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
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    lineHeight: 17,
  },
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
    color: theme.colors.deepIndigo,
    backgroundColor: theme.colors.white,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  send: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: theme.colors.lavenderPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.36 },
});
