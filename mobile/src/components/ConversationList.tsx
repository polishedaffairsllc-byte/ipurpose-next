import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ConversationSummary } from '../types/companion';
import { useVisualEnvironment } from '../context/VisualEnvironmentContext';
import { formatConversationDate } from '../lib/conversationDate';
import { theme } from '../theme';

interface Props {
  conversations: ConversationSummary[];
  selectedId: string | null;
  disabled?: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  hideNew?: boolean;
}

export function ConversationList({
  conversations,
  selectedId,
  disabled,
  onSelect,
  onNew,
  hideNew = false,
}: Props) {
  const { tokens } = useVisualEnvironment();

  if (!conversations.length && hideNew) return null;

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {!hideNew ? (
          <Pressable
            disabled={disabled}
            onPress={onNew}
            accessibilityRole="button"
            accessibilityLabel="Start a new conversation"
            style={[
              styles.chip,
              { backgroundColor: tokens.surface, borderColor: tokens.surfaceBorder },
              !selectedId && [styles.selectedChip, { backgroundColor: tokens.profileCardBackground, borderColor: tokens.profileCardBackground }],
            ]}
          >
            <Text style={[styles.chipText, !selectedId && styles.selectedText]}>+ New</Text>
          </Pressable>
        ) : null}

        {conversations.map((conversation) => {
          const selected = conversation.id === selectedId;
          const dateLabel = formatConversationDate(conversation.updatedAt);

          return (
            <Pressable
              key={conversation.id}
              disabled={disabled}
              onPress={() => onSelect(conversation.id)}
              accessibilityRole="button"
              accessibilityLabel={[conversation.title, dateLabel].filter(Boolean).join(', ')}
              style={[
                styles.chip,
                { backgroundColor: tokens.surface, borderColor: tokens.surfaceBorder },
                selected && [styles.selectedChip, { backgroundColor: tokens.profileCardBackground, borderColor: tokens.profileCardBackground }],
              ]}
            >
              {dateLabel ? (
                <Text style={[styles.dateText, { color: tokens.accentStrong }, selected && styles.selectedDateText]}>
                  {dateLabel}
                </Text>
              ) : null}
              <Text numberOfLines={1} style={[styles.chipText, selected && styles.selectedText]}>
                {conversation.title}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: -18 },
  content: { paddingHorizontal: 18, gap: 8 },
  chip: {
    maxWidth: 220,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.white,
    borderRadius: 999,
    paddingHorizontal: 13,
    minWidth: 116,
    paddingVertical: 10,
  },
  selectedChip: {
    backgroundColor: theme.colors.deepIndigo,
    borderColor: theme.colors.deepIndigo,
  },
  chipText: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.body,
    fontSize: 12,
  },
  dateText: {
    color: theme.colors.lavenderPurple,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    letterSpacing: 0.35,
    marginBottom: 4,
  },
  selectedText: { color: theme.colors.white },
  selectedDateText: { color: theme.colors.textOnDarkMuted },
});
