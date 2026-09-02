import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ConversationSummary } from '../types/companion';
import { theme } from '../theme';

interface Props {
  conversations: ConversationSummary[];
  selectedId: string | null;
  disabled?: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  hideNew?: boolean;
}

function isSameCalendarDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

function formatConversationDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const today = new Date();
  if (isSameCalendarDay(date, today)) return 'Today';

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (isSameCalendarDay(date, yesterday)) return 'Yesterday';

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() === today.getFullYear() ? {} : { year: 'numeric' }),
  });
}

export function ConversationList({
  conversations,
  selectedId,
  disabled,
  onSelect,
  onNew,
  hideNew = false,
}: Props) {
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
            style={[styles.chip, !selectedId && styles.selectedChip]}
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
              style={[styles.chip, selected && styles.selectedChip]}
            >
              <Text numberOfLines={1} style={[styles.chipText, selected && styles.selectedText]}>
                {conversation.title}
              </Text>
              {dateLabel ? (
                <Text style={[styles.dateText, selected && styles.selectedDateText]}>
                  {dateLabel}
                </Text>
              ) : null}
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
    paddingVertical: 8,
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
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 10,
    marginTop: 2,
  },
  selectedText: { color: theme.colors.white },
  selectedDateText: { color: theme.colors.textOnDarkMuted },
});
