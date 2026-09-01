import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ConversationSummary } from '../types/companion';
import { theme } from '../theme';

interface Props {
  conversations: ConversationSummary[];
  selectedId: string | null;
  disabled?: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
}

export function ConversationList({ conversations, selectedId, disabled, onSelect, onNew }: Props) {
  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Pressable
          disabled={disabled}
          onPress={onNew}
          style={[styles.chip, !selectedId && styles.selectedChip]}
        >
          <Text style={[styles.chipText, !selectedId && styles.selectedText]}>+ New</Text>
        </Pressable>
        {conversations.map((conversation) => {
          const selected = conversation.id === selectedId;
          return (
            <Pressable
              key={conversation.id}
              disabled={disabled}
              onPress={() => onSelect(conversation.id)}
              style={[styles.chip, selected && styles.selectedChip]}
            >
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
  wrap: {
    marginHorizontal: -18,
  },
  content: {
    paddingHorizontal: 18,
    gap: 8,
  },
  chip: {
    maxWidth: 210,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.white,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  selectedChip: {
    backgroundColor: theme.colors.plum,
    borderColor: theme.colors.plum,
  },
  chipText: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  selectedText: {
    color: theme.colors.white,
  },
});
