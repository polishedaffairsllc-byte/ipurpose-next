import { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { EnvironmentBackground } from '../../../components/EnvironmentBackground';
import { BrandHeader } from '../../../components/BrandHeader';
import { IntroReplay } from '../../../components/IntroReplay';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePurpose } from '../../../context/PurposeContext';
import { useVisualEnvironment } from '../../../context/VisualEnvironmentContext';
import { ACTION_PATHS, draftPurposeStatement, EXPERIMENT_SIGNALS, PURPOSE_STAGES, VALUE_WORDS } from '../../../lib/purpose';
import { theme, type VisualEnvironmentTokens } from '../../../theme';
import { useFirstRun } from '../../../context/FirstRunContext';

export default function PurposePathScreen() {

  const router = useRouter();
  const { tokens } = useVisualEnvironment();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const { progress, loading, ready, saving, error, update, flush, retry } = usePurpose();
  const firstRun = useFirstRun();
  const firstExperience = firstRun.state?.stage === 'experience' && firstRun.state.choice === 'purpose';
  const resultsReady = PURPOSE_STAGES.every((_, index) => progress.completedStages.includes(index));
  const hydrated = useRef(false);
  const [stageIndex, setStageIndex] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);
  const stage = stageIndex === null ? null : PURPOSE_STAGES[stageIndex];

  useFocusEffect(useCallback(() => {
    if (!firstExperience) setStageIndex(null);
  }, [firstExperience]));
  useEffect(() => {
    if (!firstExperience || !ready || hydrated.current) return;
    hydrated.current = true;
    if (!resultsReady && progress.startedStages.length) setStageIndex(progress.currentStage);
  }, [firstExperience, ready, resultsReady, progress]);

  function openStage(index: number) {
    setStageIndex(index);
    update({ currentStage: index, startedStages: [...new Set([...progress.startedStages, index])] });
  }
  function reflect(key: string, value: string) {
    update({ reflections: { ...progress.reflections, [key]: value } });
  }
  async function openCompass() {
    if (leaving) return;
    setLeaving(true);
    try { if (ready) await flush(); }
    catch { /* Keep the draft in the provider for retry; saving must not trap navigation. */ }
    finally { router.navigate('/mentor'); setLeaving(false); }
  }
  async function finishFirstExperience() {
    if (leaving || !resultsReady) return;
    setLeaving(true);
    try { await flush(); await firstRun.advance({ stage: 'complete', choice: 'purpose' }); router.navigate('/'); }
    catch { setFinishError('Your results are safe, but completion could not be saved. Please try again.'); }
    finally { setLeaving(false); }
  }
  const [finishError, setFinishError] = useState<string | null>(null);
  async function completeStage() {
    if (stageIndex === null || leaving) return;
    setLeaving(true);
    const next = Math.min(stageIndex + 1, PURPOSE_STAGES.length - 1);
    try {
      // Persist completion before advancing; failed storage keeps this stage open.
      await flush();
      update({ completedStages: [...new Set([...progress.completedStages, stageIndex])], currentStage: next });
      await flush();
      if (stageIndex < PURPOSE_STAGES.length - 1) openStage(next);
      else setStageIndex(null);
    } catch { /* Retry is available in the save status. */ }
    finally { setLeaving(false); }
  }
  const canComplete = stageIndex === 1 ? progress.values.length > 0 || !!progress.reflections.ownValue?.trim()
    : stageIndex === 2 ? !!progress.reflections.mission?.trim()
      : stageIndex === 4 ? !!progress.reflections.reflectionAction?.trim()
        : stageIndex === 5 ? !!progress.reflections.experiment?.trim()
          : stageIndex === 6 ? !!progress.reflections.nextAction?.trim()
            : stage?.fields.some((field) => progress.reflections[field.key]?.trim());

  return (
    <EnvironmentBackground>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.flex}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.container}>
          <BrandHeader subtitle="Clarity → Purpose → Action" />
          <Text accessibilityRole="header" style={styles.title}>{stage?.title ?? (firstExperience && resultsReady ? 'Your Purpose Path Results' : 'Your Purpose Path')}</Text>
          {stage ? <Choice centered label="Back to Purpose Path" disabled={leaving} onPress={() => setStageIndex(null)} /> : null}
          {loading ? <ActivityIndicator color={tokens.accentStrong} /> : !ready ? (
            <View accessibilityRole="alert"><Text style={styles.body}>{error}</Text><Choice label="Try again" onPress={retry} /></View>
          ) : (
            <>
              <Text accessibilityLiveRegion="polite" style={styles.status}>{saving ? 'Saving on this device…' : error ? 'Changes haven’t saved yet.' : 'Saved on this device · Private to this account'}</Text>
              {error ? <View accessibilityRole="alert"><Text style={styles.body}>{error}</Text><Choice label="Try saving again" onPress={retry} /></View> : null}
              <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: PURPOSE_STAGES.length, now: stageIndex === null ? progress.completedStages.length : stageIndex + 1 }} style={[styles.progressTrack, { backgroundColor: tokens.surfaceBorder }]}><View style={{ height: 6, borderRadius: 999, width: `${(stageIndex === null ? progress.completedStages.length : stageIndex + 1) / PURPOSE_STAGES.length * 100}%`, backgroundColor: tokens.buttonBackground }} /></View>
              {stage && stageIndex !== null ? (
                <View key={stageIndex} style={[styles.card, { backgroundColor: tokens.surface, borderColor: tokens.surfaceBorder, borderWidth: 1 }]}>
                  <Text style={styles.status}>STAGE {stageIndex + 1} OF {PURPOSE_STAGES.length}</Text>
                  <Text style={styles.idea}>{stage.idea}</Text>
                  <Text style={styles.body}>{stage.body}</Text>
                  {stageIndex === 2 && (progress.values.length > 0 || progress.reflections.ownValue) ? <Text style={styles.body}>What matters to you: {[...progress.values, progress.reflections.ownValue].filter(Boolean).join(', ')}</Text> : null}
                  {stage.fields.map((field) => (
                    <View key={field.key} style={styles.field}>
                      <Text style={styles.label}>{field.label}</Text>
                      <TextInput accessibilityLabel={field.label} multiline textAlignVertical="top" maxLength={field.key === 'ownValue' ? 60 : field.key === 'mission' ? 1200 : 300} value={progress.reflections[field.key] ?? ''} onChangeText={(value) => reflect(field.key, value)} placeholder={'placeholder' in field ? field.placeholder : 'A few words are enough'} placeholderTextColor={tokens.screenTextMuted} style={styles.input} editable={!leaving} />
                    </View>
                  ))}
                  {stageIndex === 1 ? (
                    <>
                      <Text style={styles.label}>Choose up to three value words, or use your own above.</Text>
                      <View style={styles.choices}>{VALUE_WORDS.map((word) => <Choice key={word} label={word} selected={progress.values.includes(word)} disabled={leaving || (!progress.values.includes(word) && progress.values.length >= 3)} onPress={() => update({ values: progress.values.includes(word) ? progress.values.filter((value) => value !== word) : [...progress.values, word] })} />)}</View>
                    </>
                  ) : null}
                  {stageIndex === 2 ? <Choice label="Build my working draft" disabled={leaving || !draftPurposeStatement(progress)} onPress={() => reflect('mission', draftPurposeStatement(progress) ?? '')} /> : null}
                  {stageIndex === 5 ? (
                    <>
                      <Text style={styles.label}>After trying it: did it energize you or drain you?</Text>
                      <View style={styles.choices}>{EXPERIMENT_SIGNALS.map((signal) => <Choice key={signal} label={signal} selected={progress.reflections.experimentSignal === signal} disabled={leaving} onPress={() => reflect('experimentSignal', signal)} />)}</View>
                      <Text style={styles.label}>Did you want to keep going?</Text>
                      <View style={styles.choices}>{['Yes', 'No', 'Not sure yet'].map((signal) => <Choice key={signal} label={signal} selected={progress.reflections.keepGoing === signal} disabled={leaving} onPress={() => reflect('keepGoing', signal)} />)}</View>
                      <Text style={styles.body}>This is information, not success or failure. Save a plan now and return after you’ve tried it.</Text>
                    </>
                  ) : null}
                  {stageIndex === 6 ? (
                    <>
                      <Text style={styles.label}>Where might this next step take you?</Text>
                      <View style={styles.choices}>{ACTION_PATHS.map((path) => <Choice key={path} label={path} selected={progress.reflections.actionPath === path} disabled={leaving} onPress={() => reflect('actionPath', path)} />)}</View>
                      <View style={styles.card}>
                        <Text style={styles.idea}>Soul → Systems → AI</Text>
                        <Text style={styles.body}>Purpose gives direction. Systems make progress repeatable. AI supports the work after the direction and structure are clear.</Text>
                      </View>
                    </>
                  ) : null}
                  <Pressable accessibilityRole="button" disabled={!canComplete || leaving} onPress={() => void completeStage()} style={[styles.primary, { backgroundColor: tokens.buttonBackground }, (!canComplete || leaving) && styles.disabled]}><Text style={[styles.primaryText, { color: tokens.buttonText }]}>{stageIndex === 6 ? 'Save my next step' : 'Save and continue'}</Text></Pressable>
                  <Text style={styles.status}>Return to any stage whenever your direction changes.</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.idea}>Purpose is a direction, not one perfect answer.</Text>
                  <Text style={styles.body}>Reflect, name what matters, and choose your next aligned step. Take one short stage at a time.</Text>
                  <Text style={styles.status}>{progress.completedStages.length} of {PURPOSE_STAGES.length} stages explored</Text>
                  <Pressable accessibilityRole="button" onPress={() => openStage(progress.currentStage)} style={[styles.primary, { backgroundColor: tokens.buttonBackground }]}><Text style={[styles.primaryText, { color: tokens.buttonText }]}>{progress.startedStages.length ? 'Continue my Purpose Path' : 'Begin Purpose Path'}</Text></Pressable>
                  {PURPOSE_STAGES.map((item, index) => <Choice key={item.title} label={`${index + 1}. ${item.title}${progress.completedStages.includes(index) ? ' · Explored' : progress.startedStages.includes(index) ? ' · Started' : ''}`} onPress={() => openStage(index)} />)}
                  {progress.reflections.mission ? <View style={styles.card}><Text style={styles.label}>YOUR WORKING PURPOSE</Text><Text style={styles.body}>{progress.reflections.mission}</Text></View> : null}
                  {progress.reflections.nextAction ? <View style={styles.card}><Text style={styles.label}>YOUR NEXT ALIGNED STEP</Text><Text style={styles.body}>{progress.reflections.nextAction}</Text></View> : null}
                </>
              )}
              {firstExperience ? resultsReady && !stage ? <>
                {finishError ? <Text accessibilityRole="alert" style={styles.body}>{finishError}</Text> : null}
                <Choice centered label="Finish and return to Home" disabled={leaving} onPress={() => void finishFirstExperience()} />
              </> : null : <>
                <Choice centered label="Chat with Compass" disabled={leaving} onPress={() => void openCompass()} />
                <Text style={styles.status}>Choose what to share when you get there. Your reflections stay here.</Text>
              </>}
            </>
          )}
        </ScrollView>
          <IntroReplay kind="purpose" returnLabel="Return to Purpose Path" />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </EnvironmentBackground>
  );
}

function Choice({ label, onPress, selected, disabled, centered }: { centered?: boolean; label: string; onPress: () => void; selected?: boolean; disabled?: boolean }) {
  const { tokens } = useVisualEnvironment();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  return <Pressable accessibilityRole="button" accessibilityState={{ selected: !!selected, disabled: !!disabled }} disabled={disabled} onPress={onPress} style={[styles.choice, { backgroundColor: tokens.surface, borderColor: tokens.surfaceBorder }, selected && { backgroundColor: tokens.surfaceTint, borderColor: tokens.accentStrong, borderWidth: 2 }, disabled && styles.disabled]}><Text style={[styles.link, centered && styles.centeredAction]}>{label}</Text></Pressable>;
}
const createStyles = (tokens: VisualEnvironmentTokens) => StyleSheet.create({
  progressTrack: { height: 6, borderRadius: 999, marginVertical: 14, overflow: 'hidden' },
  flex: { flex: 1 }, container: { padding: 20, paddingBottom: 36 }, title: { fontFamily: theme.fonts.heading, ...theme.typography.screenTitle, textAlign: 'center', color: tokens.screenText, marginVertical: 16 },
  idea: { fontFamily: theme.fonts.heading, ...theme.typography.sectionTitle, color: tokens.screenText, marginVertical: 10 }, body: { fontFamily: theme.fonts.body, ...theme.typography.body, color: tokens.screenText, marginBottom: 16 },
  status: { fontFamily: theme.fonts.body, ...theme.typography.supporting, color: tokens.screenTextMuted, marginVertical: 10 }, field: { marginBottom: 18 }, label: { fontFamily: theme.fonts.body, ...theme.typography.body, color: tokens.screenText, marginBottom: 8 },
  input: { minHeight: 100, backgroundColor: tokens.surface, borderColor: theme.colors.muted, borderWidth: 1, borderRadius: 14, padding: 14, fontFamily: theme.fonts.body, ...theme.typography.input, color: tokens.screenText },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }, choice: { borderWidth: 1, borderColor: theme.colors.muted, borderRadius: 14, padding: 14, minHeight: 48, marginBottom: 8 }, selected: { backgroundColor: theme.colors.line, borderColor: theme.colors.plum }, link: { fontFamily: theme.fonts.body, ...theme.typography.button, color: tokens.screenText },
  centeredAction: { textAlign: 'center' },
  secondary: { paddingVertical: 14, minHeight: 48 }, primary: { borderRadius: 16, padding: 16, minHeight: 52, alignItems: 'center', marginVertical: 14 }, primaryText: { fontFamily: theme.fonts.body, ...theme.typography.button }, disabled: { opacity: 0.5 }, card: { backgroundColor: tokens.surface, borderRadius: 16, padding: 16, marginVertical: 14 },
});
