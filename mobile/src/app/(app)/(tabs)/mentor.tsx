import { useCallback, useEffect, useRef, useState } from 'react';
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
import { BrandHeader } from '../../../components/BrandHeader';
import { ConversationList } from '../../../components/ConversationList';
import { MessageBubble } from '../../../components/MessageBubble';
import { getConversation, getConversations, sendMentorMessage } from '../../../lib/api';
import type { CompanionMessage, ConversationSummary } from '../../../types/companion';
import { theme } from '../../../theme';

export default function MentorScreen() {
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

        if (available[0]) {
          const loaded = await getConversation(available[0].id);
          if (cancelled) return;
          setConversationId(available[0].id);
          setMessages(loaded);
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : 'Unable to load your Mentor.');
        }
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, []);

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
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The Mentor could not respond. Please try again.');
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
          <BrandHeader subtitle="Your persistent AI Companion" />

          <View style={styles.conversations}>
            <ConversationList
              conversations={conversations}
              selectedId={conversationId}
              disabled={sending || loadingHistory}
              onNew={startNewConversation}
              onSelect={loadConversation}
            />
          </View>

          <View style={styles.chat}>
            {loadingHistory ? (
              <View style={styles.center}>
                <ActivityIndicator color={theme.colors.plum} />
                <Text style={styles.muted}>Loading your conversation…</Text>
              </View>
            ) : messages.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>What are you thinking through?</Text>
                <Text style={styles.emptyBody}>
                  Your Mentor can reflect with you, organize what matters, and help shape the next aligned step.
                </Text>
              </View>
            ) : (
              <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <MessageBubble message={item} />}
                contentContainerStyle={styles.messageList}
                onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
              />
            )}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.composer}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Share what you're thinking through…"
              placeholderTextColor="#9B919B"
              multiline
              maxLength={4000}
              editable={!sending && !loadingHistory}
              style={styles.input}
            />
            <Pressable
              onPress={send}
              disabled={sending || loadingHistory || !input.trim()}
              style={[
                styles.send,
                (sending || loadingHistory || !input.trim()) && styles.sendDisabled,
              ]}
            >
              {sending ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <Text style={styles.sendText}>Send</Text>
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
  container: { flex: 1, paddingTop: 10, paddingHorizontal: 18 },
  conversations: { marginTop: 16, marginBottom: 12 },
  chat: { flex: 1, backgroundColor: theme.colors.white, borderWidth: 1, borderColor: theme.colors.line, borderRadius: 22, overflow: 'hidden' },
  messageList: { padding: 14, paddingBottom: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  muted: { color: theme.colors.muted, fontSize: 14 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  emptyTitle: { color: theme.colors.ink, fontSize: 23, fontWeight: '700', textAlign: 'center' },
  emptyBody: { color: theme.colors.muted, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 9 },
  error: { color: theme.colors.danger, fontSize: 12, lineHeight: 17, marginTop: 8 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingVertical: 10 },
  input: { flex: 1, minHeight: 48, maxHeight: 112, borderWidth: 1, borderColor: theme.colors.line, borderRadius: 18, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12, color: theme.colors.ink, backgroundColor: theme.colors.white, fontSize: 15 },
  send: { minWidth: 70, height: 48, borderRadius: 16, backgroundColor: theme.colors.plum, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  sendDisabled: { opacity: 0.45 },
  sendText: { color: theme.colors.white, fontWeight: '800', fontSize: 14 },
});
