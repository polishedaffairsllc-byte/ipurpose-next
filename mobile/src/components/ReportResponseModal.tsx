import { useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useVisualEnvironment } from '../context/VisualEnvironmentContext';
import { theme } from '../theme';
import type { AiReportReason } from '../lib/api';

const REASONS: { value: AiReportReason; label: string }[] = [
  { value: 'unsafe', label: 'Unsafe or harmful' },
  { value: 'offensive', label: 'Offensive' },
  { value: 'inaccurate', label: 'Inaccurate or misleading' },
  { value: 'other', label: 'Other' },
];

/** Report an actual persisted assistant message. Never submit the model's text or a user-supplied UID. */
export function ReportResponseModal({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: AiReportReason, details: string) => Promise<void>;
}) {
  const { tokens } = useVisualEnvironment();
  const [reason, setReason] = useState<AiReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submissionLock = useRef(false);

  function close() {
    if (!submissionLock.current) onClose();
  }

  async function submit() {
    if (submissionLock.current || !reason || saved) return;
    submissionLock.current = true;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(reason, details.trim());
      setSaved(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not submit your report. Please try again.');
    } finally {
      submissionLock.current = false;
      setSubmitting(false);
    }
  }

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={close}
    >
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: tokens.surface, borderColor: tokens.surfaceBorder }]}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
            <Text accessibilityRole="header" style={styles.heading}>Report Compass response</Text>
            {saved ? (
              <>
                <Text style={styles.copy}>Thank you. Your report has been saved for iPurpose review.</Text>
                <Pressable accessibilityRole="button" onPress={close} style={[styles.primary, { backgroundColor: tokens.buttonBackground }]}>
                  <Text style={[styles.primaryText, { color: tokens.buttonText }]}>Done</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.copy}>Choose a reason. Your report will be attached to this response.</Text>
                {REASONS.map(item => (
                  <Pressable
                    key={item.value}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: reason === item.value, disabled: submitting }}
                    disabled={submitting}
                    onPress={() => setReason(item.value)}
                    style={[styles.option, { borderColor: reason === item.value ? tokens.accentStrong : tokens.surfaceBorder }]}
                  >
                    <Text style={styles.optionText}>{reason === item.value ? '◉' : '○'}  {item.label}</Text>
                  </Pressable>
                ))}
                <Text style={styles.detailLabel}>Details (optional)</Text>
                <TextInput
                  accessibilityLabel="Report details"
                  editable={!submitting}
                  maxLength={1000}
                  multiline
                  onChangeText={setDetails}
                  placeholder="Tell us what concerned you."
                  placeholderTextColor={theme.colors.muted}
                  style={[styles.input, { borderColor: tokens.surfaceBorder }]}
                  value={details}
                />
                {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !reason || submitting }}
                  disabled={!reason || submitting}
                  onPress={() => void submit()}
                  style={[styles.primary, { backgroundColor: tokens.buttonBackground }, (!reason || submitting) && styles.disabled]}
                >
                  {submitting ? <ActivityIndicator color={tokens.buttonText} /> : <Text style={[styles.primaryText, { color: tokens.buttonText }]}>Submit report</Text>}
                </Pressable>
                <Pressable accessibilityRole="button" disabled={submitting} onPress={close} style={styles.secondary}>
                  <Text style={styles.secondaryText}>Cancel</Text>
                </Pressable>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', padding: 22, backgroundColor: 'rgba(27,29,51,0.62)' },
  sheet: { borderRadius: 22, borderWidth: 1, maxHeight: '86%', overflow: 'hidden' },
  content: { padding: 23, gap: 11 },
  heading: { color: theme.colors.deepIndigo, fontFamily: theme.fonts.heading, fontSize: 25, lineHeight: 31 },
  copy: { color: theme.colors.deepIndigo, fontFamily: theme.fonts.body, fontSize: 14, lineHeight: 21 },
  option: { borderWidth: 1, padding: 13, borderRadius: 12 },
  optionText: { color: theme.colors.deepIndigo, fontFamily: theme.fonts.body, fontSize: 14 },
  detailLabel: { color: theme.colors.deepIndigo, fontFamily: theme.fonts.body, marginTop: 4, fontSize: 13 },
  input: { minHeight: 90, textAlignVertical: 'top', borderWidth: 1, borderRadius: 12, color: theme.colors.deepIndigo, fontFamily: theme.fonts.body, fontSize: 14, padding: 12 },
  primary: { minHeight: 45, alignItems: 'center', justifyContent: 'center', borderRadius: 12, padding: 12, marginTop: 7 },
  primaryText: { fontFamily: theme.fonts.body, fontSize: 14, fontWeight: '600' },
  secondary: { minHeight: 40, justifyContent: 'center', alignItems: 'center' },
  secondaryText: { color: theme.colors.deepIndigo, fontFamily: theme.fonts.body, fontSize: 14 },
  disabled: { opacity: 0.48 },
  error: { color: theme.colors.deepIndigo, fontFamily: theme.fonts.body, fontSize: 13 },
});
