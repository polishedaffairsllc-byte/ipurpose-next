import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { BrandHeader } from '../../components/BrandHeader';
import { useVisualEnvironment } from '../../context/VisualEnvironmentContext';
import { normalizeIanaTimezone } from '../../lib/timezone';
import {
  getTimezoneDisplayName,
  searchTimezoneOptions,
} from '../../lib/timezoneOptions';
import { theme } from '../../theme';

export default function TimezoneScreen() {
  const router = useRouter();
  const {
    tokens,
    savedTimezone,
    deviceTimezone,
    effectiveTimezone,
    loading,
    confirmTimezone,
  } = useVisualEnvironment();
  const [timezone, setTimezone] = useState(effectiveTimezone);
  const [search, setSearch] = useState('');
  const [edited, setEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!edited) setTimezone(savedTimezone ?? effectiveTimezone);
  }, [edited, effectiveTimezone, savedTimezone]);

  const normalizedTimezone = normalizeIanaTimezone(timezone);
  const unchanged = Boolean(
    savedTimezone && normalizedTimezone === savedTimezone
  );
  const timezoneOptions = useMemo(() => searchTimezoneOptions(search), [search]);

  function chooseDeviceTimezone() {
    setTimezone(deviceTimezone);
    setSearch('');
    setEdited(true);
    setError(null);
  }

  async function saveTimezone() {
    if (saving) return;
    if (!normalizedTimezone) {
      setError('Choose a valid city or country from the list.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await confirmTimezone(normalizedTimezone);
      router.back();
    } catch (caught) {
      setError(caught instanceof Error
        ? caught.message
        : 'Compass could not save your timezone. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <LinearGradient
      colors={tokens.screenGradient.colors}
      locations={tokens.screenGradient.locations}
      start={tokens.screenGradient.start}
      end={tokens.screenGradient.end}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.topRow}>
              <Pressable
                accessibilityLabel="Go back"
                accessibilityRole="button"
                onPress={() => router.back()}
                style={({ pressed }) => [
                  styles.backButton,
                  {
                    backgroundColor: tokens.surface,
                    borderColor: tokens.surfaceBorder,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  color={theme.colors.deepIndigo}
                  name="chevron-back"
                  size={20}
                />
              </Pressable>
              <BrandHeader
                subtitle="A preference that shapes your experience"
                variant="light-background"
              />
            </View>

            <View style={styles.intro}>
              <Text style={[styles.eyebrow, { color: tokens.accentStrong }]}>PREFERENCES</Text>
              <Text style={styles.title}>Your timezone.</Text>
              <Text style={styles.body}>
                Compass uses this to place Follow time of day in your local rhythm.
                No location access is needed.
              </Text>
            </View>

            <View
              style={[
                styles.card,
                {
                  backgroundColor: tokens.surface,
                  borderColor: tokens.surfaceBorder,
                },
              ]}
            >
              <Text style={styles.label}>SEARCH CITY OR COUNTRY</Text>
              <TextInput
                accessibilityLabel="Search for a city or country"
                autoCorrect={false}
                editable={!loading && !saving}
                onChangeText={(value) => {
                  setSearch(value);
                  setError(null);
                }}
                placeholder="Try Caracas, Venezuela, or London"
                placeholderTextColor={theme.colors.muted}
                returnKeyType="search"
                style={[
                  styles.input,
                  {
                    backgroundColor: tokens.surfaceTint,
                    borderColor: error ? theme.colors.salmonPeach : tokens.surfaceBorder,
                  },
                ]}
                value={search}
              />
              <Text style={styles.hint}>
                Choose the closest city. Compass will save the correct timezone automatically.
              </Text>

              <View style={[styles.results, { borderColor: tokens.surfaceBorder }]}>
                {timezoneOptions.length ? timezoneOptions.map((option) => {
                  const selected = normalizedTimezone === option.timezone
                    || (normalizedTimezone
                      ? option.equivalentTimezones.includes(normalizedTimezone)
                      : false);
                  return (
                    <Pressable
                      accessibilityLabel={`Use ${option.city}, ${option.country}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      disabled={loading || saving}
                      key={`${option.city}-${option.timezone}`}
                      onPress={() => {
                        setTimezone(option.timezone);
                        setSearch('');
                        setEdited(true);
                        setError(null);
                      }}
                      style={({ pressed }) => [
                        styles.resultChoice,
                        { borderBottomColor: tokens.surfaceBorder },
                        (pressed || selected) && { backgroundColor: tokens.accentSoft },
                      ]}
                    >
                      <View style={styles.resultCopy}>
                        <Text style={styles.resultCity}>{option.city}</Text>
                        <Text style={styles.resultCountry}>{option.country}</Text>
                      </View>
                      {selected ? (
                        <Ionicons color={tokens.accentStrong} name="checkmark-circle" size={20} />
                      ) : null}
                    </Pressable>
                  );
                }) : (
                  <Text style={styles.noResults}>No matching location. Try a nearby major city.</Text>
                )}
              </View>

              <Text style={[styles.selectionLabel, { color: tokens.accentStrong }]}>SELECTED TIMEZONE</Text>
              <Text style={styles.selectionValue}>{getTimezoneDisplayName(timezone)}</Text>

              <Pressable
                accessibilityLabel={`Use device timezone ${deviceTimezone}`}
                accessibilityRole="button"
                onPress={chooseDeviceTimezone}
                style={({ pressed }) => [
                  styles.deviceChoice,
                  { borderColor: tokens.surfaceBorder },
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.deviceIcon, { backgroundColor: tokens.accentSoft }]}>
                  <Ionicons
                    color={tokens.accentStrong}
                    name="phone-portrait-outline"
                    size={18}
                  />
                </View>
                <View style={styles.deviceCopy}>
                  <Text style={styles.deviceLabel}>Use device timezone</Text>
                  <Text style={styles.deviceValue}>{getTimezoneDisplayName(deviceTimezone)}</Text>
                </View>
                <Ionicons
                  color={tokens.accentStrong}
                  name="chevron-forward"
                  size={18}
                />
              </Pressable>

              {savedTimezone ? (
                <Text style={[styles.savedNote, { color: tokens.accentStrong }]}>
                  Currently saved · {getTimezoneDisplayName(savedTimezone)}
                </Text>
              ) : (
                <Text style={styles.fallbackNote}>
                  Using your device timezone until you save a preference.
                </Text>
              )}

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                accessibilityLabel="Save timezone"
                accessibilityRole="button"
                disabled={loading || saving || unchanged}
                onPress={saveTimezone}
                style={({ pressed }) => [
                  styles.saveButton,
                  {
                    backgroundColor: tokens.buttonBackground,
                    borderColor: tokens.accentStrong,
                  },
                  (pressed || loading || saving || unchanged) && styles.saveButtonDisabled,
                ]}
              >
                {saving ? (
                  <ActivityIndicator color={tokens.buttonText} />
                ) : (
                  <Text style={[styles.saveButtonText, { color: tokens.buttonText }]}>
                    {unchanged ? 'Timezone saved' : 'Save timezone'}
                  </Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { backgroundColor: 'transparent', flex: 1 },
  flex: { flex: 1 },
  container: { paddingBottom: 40, paddingHorizontal: 20, paddingTop: 8 },
  topRow: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  backButton: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  pressed: { opacity: 0.72 },
  intro: { marginTop: 34 },
  eyebrow: {
    fontFamily: theme.fonts.body,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  title: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.heading,
    fontSize: 34,
    lineHeight: 41,
    marginTop: 8,
  },
  body: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 26,
    padding: 18,
  },
  label: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.body,
    fontSize: 10,
    letterSpacing: 1.1,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    marginTop: 9,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  hint: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 7,
  },
  results: {
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    overflow: 'hidden',
  },
  resultChoice: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 54,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  resultCopy: { flex: 1 },
  resultCity: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.body,
    fontSize: 14,
  },
  resultCountry: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 11,
    marginTop: 2,
  },
  noResults: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    lineHeight: 18,
    padding: 14,
  },
  selectionLabel: {
    fontFamily: theme.fonts.body,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginTop: 18,
  },
  selectionValue: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    marginTop: 5,
  },
  deviceChoice: {
    alignItems: 'center',
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 11,
    marginTop: 18,
    padding: 12,
  },
  deviceIcon: {
    alignItems: 'center',
    borderRadius: 13,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  deviceCopy: { flex: 1 },
  deviceLabel: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.body,
    fontSize: 13,
  },
  deviceValue: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 11,
    marginTop: 3,
  },
  savedNote: {
    fontFamily: theme.fonts.body,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 14,
  },
  fallbackNote: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 14,
  },
  error: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
  saveButton: {
    alignItems: 'center',
    borderRadius: 17,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 20,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  saveButtonDisabled: { opacity: 0.48 },
  saveButtonText: {
    fontFamily: theme.fonts.body,
    fontSize: 14,
  },
});
