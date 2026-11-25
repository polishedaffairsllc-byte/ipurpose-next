import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CompanionMessage } from '../types/companion';
import { useVisualEnvironment } from '../context/VisualEnvironmentContext';
import { theme } from '../theme';

export function MessageBubble({ message, onReport }: { message: CompanionMessage; onReport?: (message: CompanionMessage) => void }) {
  const isUser = message.role === 'user';
  const { tokens } = useVisualEnvironment();
  // New optimistic assistant replies have local IDs, not stored Firestore IDs.
  const canReport = !isUser && !!onReport && !message.id.startsWith('local-');

  return (
    <View style={[styles.row, isUser ? styles.userRow : styles.mentorRow]}>
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.userBubble, { backgroundColor: tokens.profileCardBackground }]
            : [styles.mentorBubble, { backgroundColor: tokens.glassPillBackground, borderColor: tokens.glassPillBorder }],
        ]}
      >
        <Text
          style={[
            styles.label,
            isUser ? styles.userText : { color: tokens.accent },
          ]}
        >
          {isUser ? 'You' : 'iPurpose Compass'}
        </Text>
        <Text style={[styles.content, styles.userText]}>
          {message.content}
        </Text>
        {canReport ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Report Compass response" onPress={() => onReport?.(message)} style={styles.reportButton}>
            <Text style={styles.reportText}>Report response</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { width: '100%', marginBottom: 14 },
  userRow: { alignItems: 'flex-end' },
  mentorRow: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '94%',
    paddingHorizontal: 17,
    paddingVertical: 15,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: theme.colors.deepIndigo,
    borderBottomRightRadius: 7,
    maxWidth: '88%',
  },
  mentorBubble: {
    backgroundColor: theme.colors.lightMistGray,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderBottomLeftRadius: 7,
  },
  label: {
    fontFamily: theme.fonts.body,
    ...theme.typography.label,
    letterSpacing: 0.5,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  content: {
    fontFamily: theme.fonts.body,
    ...theme.typography.body,
  },
  reportButton: { alignSelf: 'flex-start', minHeight: 36, justifyContent: 'center', marginTop: 10 },
  reportText: { color: theme.colors.textOnDarkMuted, fontFamily: theme.fonts.body, ...theme.typography.supporting, textDecorationLine: 'underline' },
  userText: { color: theme.colors.white },
});
