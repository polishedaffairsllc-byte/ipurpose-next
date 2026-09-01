import { StyleSheet, Text, View } from 'react-native';
import type { CompanionMessage } from '../types/companion';
import { theme } from '../theme';

export function MessageBubble({ message }: { message: CompanionMessage }) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.userRow : styles.mentorRow]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.mentorBubble]}>
        <Text style={[styles.label, isUser ? styles.userText : styles.mentorText]}>
          {isUser ? 'You' : 'iPurpose Mentor'}
        </Text>
        <Text style={[styles.content, isUser ? styles.userText : styles.mentorText]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    marginBottom: 12,
  },
  userRow: {
    alignItems: 'flex-end',
  },
  mentorRow: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '88%',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: theme.colors.plum,
    borderBottomRightRadius: 6,
  },
  mentorBubble: {
    backgroundColor: theme.colors.blush,
    borderBottomLeftRadius: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 5,
    opacity: 0.76,
  },
  content: {
    fontSize: 16,
    lineHeight: 23,
  },
  userText: {
    color: theme.colors.white,
  },
  mentorText: {
    color: theme.colors.ink,
  },
});
