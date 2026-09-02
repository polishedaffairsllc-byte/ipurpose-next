import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useVisualEnvironment } from '../context/VisualEnvironmentContext';
import type {
  VisualEnvironmentName,
  VisualEnvironmentPreference,
} from '../lib/visualEnvironment';
import { theme } from '../theme';

const MANUAL_ENVIRONMENTS: {
  name: VisualEnvironmentName;
  label: string;
  description: string;
}[] = [
  { name: 'depth', label: 'Depth', description: 'Indigo, violet, and champagne' },
  { name: 'renewal', label: 'Renewal', description: 'Sage, botanical green, and mist' },
  { name: 'warmth', label: 'Warmth', description: 'Salmon, peach, and dusk' },
];

function isSamePreference(
  left: VisualEnvironmentPreference,
  right: VisualEnvironmentPreference
) {
  return left.mode === right.mode && left.manualTheme === right.manualTheme;
}

export function VisualEnvironmentPicker() {
  const {
    savedPreference,
    autoResolvedEnvironment,
    tokens,
    loading,
    previewPreference,
    cancelPreview,
    confirmPreference,
  } = useVisualEnvironment();
  const [draft, setDraft] = useState(savedPreference);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setDraft(savedPreference);
      setError(null);
      return () => cancelPreview();
    }, [cancelPreview, savedPreference])
  );

  function selectPreference(next: VisualEnvironmentPreference) {
    setDraft(next);
    setError(null);
    previewPreference(next);
  }

  async function savePreference() {
    if (saving || isSamePreference(draft, savedPreference)) return;
    setSaving(true);
    setError(null);
    try {
      await confirmPreference(draft);
    } catch (caught) {
      setError(caught instanceof Error
        ? caught.message
        : 'Compass could not save this environment. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const hasChanges = !isSamePreference(draft, savedPreference);
  const autoLabel = autoResolvedEnvironment[0].toUpperCase()
    + autoResolvedEnvironment.slice(1);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: tokens.surface, borderColor: tokens.surfaceBorder },
      ]}
    >
      <Text style={styles.title}>Visual Environment</Text>
      <Text style={styles.intro}>
        Choose the atmosphere that supports you. Your content and Compass stay the same.
      </Text>

      <View style={styles.options}>
        <EnvironmentOption
          label="Follow time of day"
          description={`Following time of day · ${autoLabel}`}
          selected={draft.mode === 'auto'}
          accent={tokens.accentStrong}
          surfaceTint={tokens.surfaceTint}
          onPress={() => selectPreference({
            mode: 'auto',
            manualTheme: draft.manualTheme,
          })}
        />

        {MANUAL_ENVIRONMENTS.map((environment) => (
          <EnvironmentOption
            key={environment.name}
            label={environment.label}
            description={environment.description}
            selected={draft.mode === 'manual' && draft.manualTheme === environment.name}
            accent={tokens.accentStrong}
            surfaceTint={tokens.surfaceTint}
            onPress={() => selectPreference({
              mode: 'manual',
              manualTheme: environment.name,
            })}
          />
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Use this visual environment"
        disabled={loading || saving || !hasChanges}
        onPress={savePreference}
        style={({ pressed }) => [
          styles.confirmButton,
          { backgroundColor: tokens.buttonBackground },
          (pressed || loading || saving || !hasChanges) && styles.confirmButtonDisabled,
        ]}
      >
        {saving ? (
          <ActivityIndicator color={tokens.buttonText} />
        ) : (
          <Text style={[styles.confirmButtonText, { color: tokens.buttonText }]}>
            {hasChanges ? 'Use this environment' : 'Environment in use'}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

function EnvironmentOption({
  label,
  description,
  selected,
  accent,
  surfaceTint,
  onPress,
}: {
  label: string;
  description: string;
  selected: boolean;
  accent: string;
  surfaceTint: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${label}. ${description}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        selected && { backgroundColor: surfaceTint, borderColor: accent },
        pressed && styles.optionPressed,
      ]}
    >
      <View style={[styles.radio, selected && { borderColor: accent }]}>
        {selected ? <View style={[styles.radioDot, { backgroundColor: accent }]} /> : null}
      </View>
      <View style={styles.optionCopy}>
        <Text style={styles.optionLabel}>{label}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      {selected ? <Ionicons name="checkmark" size={18} color={accent} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
  title: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.heading,
    fontSize: 22,
    lineHeight: 28,
  },
  intro: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  options: { gap: 9, marginTop: 16 },
  option: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.line,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 11,
    minHeight: 64,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  optionPressed: { opacity: 0.78 },
  radio: {
    alignItems: 'center',
    borderColor: theme.colors.muted,
    borderRadius: 9,
    borderWidth: 1.5,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  radioDot: { borderRadius: 5, height: 10, width: 10 },
  optionCopy: { flex: 1 },
  optionLabel: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.body,
    fontSize: 14,
  },
  optionDescription: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  confirmButton: {
    alignItems: 'center',
    borderRadius: 17,
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 50,
    paddingHorizontal: 16,
  },
  confirmButtonDisabled: { opacity: 0.5 },
  confirmButtonText: {
    fontFamily: theme.fonts.body,
    fontSize: 14,
  },
  error: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
});
