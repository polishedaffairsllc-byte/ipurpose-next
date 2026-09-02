import { StyleSheet, Text, View } from 'react-native';
import type { CompanionMessage } from '../types/companion';
import { theme } from '../theme';

export function MessageBubble({ message }: { message: CompanionMessage }) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.userRow : styles.mentorRow]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.mentorBubble]}>
        <Text style={[styles.label, isUser ? styles.userText : styles.mentorLabel]}>
          {isUser ? 'You' : 'iPurpose Compass'}
        </Text>
        <Text style={[styles.content, isUser ? styles.userText : styles.mentorText]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { width: '100%', marginBottom: 14 },
  userRow: { alignItems: 'flex-end' },
  mentorRow: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '88%',
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: theme.colors.deepIndigo,
    borderBottomRightRadius: 7,
  },
  mentorBubble: {
    backgroundColor: theme.colors.lightMistGray,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderBottomLeftRadius: 7,
  },
  label: {
    fontFamily: theme.fonts.body,
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  content: {
    fontFamily: theme.fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  userText: { color: theme.colors.white },
  mentorLabel: { color: theme.colors.lavenderPurple },
  mentorText: { color: theme.colors.deepIndigo },
});
