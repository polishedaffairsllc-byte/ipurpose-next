import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
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
import { BrandHeader } from './BrandHeader';
import { useOnboarding } from '../context/OnboardingContext';
import {
  completeOnboarding,
  initializeCompanionFocusAreas,
  saveOnboardingDraft,
  submitClarityCheck,
} from '../lib/api';
import { CLARITY_QUESTIONS, IDENTITY_QUESTIONS } from '../lib/onboarding';
import type { ClarityCheckResult, OnboardingDraft } from '../types/onboarding';
import { theme } from '../theme';

const FIRST_CLARITY_STEP = 1;
const FIRST_IDENTITY_STEP = FIRST_CLARITY_STEP + CLARITY_QUESTIONS.length;
const FOCUS_STEP = FIRST_IDENTITY_STEP + IDENTITY_QUESTIONS.length;
const RESULT_STEP = FOCUS_STEP + 1;
const MAX_FOCUS_LENGTH = 160;

type FlowMode = 'onboarding' | 'retake';
type IdentityAnswer = keyof (typeof IDENTITY_QUESTIONS)[number]['options'];

function makeDraft(
  currentStep: number,
  clarityResponses: Record<string, number>,
  identityResponses: string[],
  focusAreasDraft: string[],
  claritySubmissionId?: string
): OnboardingDraft {
  return {
    currentStep,
    clarityResponses,
    identityResponses,
    focusAreasDraft,
    claritySubmissionId,
  };
}

export function ClarityCheckFlow({ mode }: { mode: FlowMode }) {
  const router = useRouter();
  const { onboarding, refresh } = useOnboarding();
  const [hydrated, setHydrated] = useState(mode === 'retake');
  const [step, setStep] = useState(0);
  const [clarityResponses, setClarityResponses] = useState<Record<string, number>>({});
  const [identityResponses, setIdentityResponses] = useState<string[]>([]);
  const [firstFocus, setFirstFocus] = useState('');
  const [secondFocus, setSecondFocus] = useState('');
  const [result, setResult] = useState<ClarityCheckResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== 'onboarding' || hydrated || !onboarding) return;
    setStep(onboarding.currentStep === RESULT_STEP && !onboarding.result
      ? FOCUS_STEP
      : onboarding.currentStep);
    setClarityResponses(onboarding.clarityResponses);
    setIdentityResponses(onboarding.identityResponses);
    setFirstFocus(onboarding.focusAreasDraft[0] || '');
    setSecondFocus(onboarding.focusAreasDraft[1] || '');
    setResult(onboarding.result || null);
    setHydrated(true);
  }, [hydrated, mode, onboarding]);

  const focusAreas = [firstFocus, secondFocus]
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 2);

  async function persist(nextDraft: OnboardingDraft) {
    if (mode === 'onboarding') await saveOnboardingDraft(nextDraft);
  }

  async function begin() {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      await persist(makeDraft(FIRST_CLARITY_STEP, clarityResponses, identityResponses, focusAreas));
      setStep(FIRST_CLARITY_STEP);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'We could not start your Clarity Check.');
    } finally {
      setSaving(false);
    }
  }

  async function answerClarity(value: number) {
    if (saving) return;
    const questionIndex = step - FIRST_CLARITY_STEP;
    const nextResponses = { ...clarityResponses, [String(questionIndex + 1)]: value };
    const nextStep = step + 1;
    setClarityResponses(nextResponses);
    setSaving(true);
    setError(null);
    try {
      await persist(makeDraft(nextStep, nextResponses, identityResponses, focusAreas));
      setStep(nextStep);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'We could not save that answer.');
    } finally {
      setSaving(false);
    }
  }

  async function answerIdentity(value: IdentityAnswer) {
    if (saving) return;
    const questionIndex = step - FIRST_IDENTITY_STEP;
    const nextResponses = [...identityResponses];
    nextResponses[questionIndex] = value;
    const nextStep = step + 1;
    const shouldSubmitRetake = mode === 'retake'
      && questionIndex === IDENTITY_QUESTIONS.length - 1;
    setIdentityResponses(nextResponses);
    setSaving(true);
    setError(null);
    try {
      if (shouldSubmitRetake) {
        const submission = await submitClarityCheck({
          responses: clarityResponses,
          identityResponses: nextResponses,
          onboarding: false,
        });
        setResult(submission);
        setStep(RESULT_STEP);
      } else {
        await persist(makeDraft(nextStep, clarityResponses, nextResponses, focusAreas));
        setStep(nextStep);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'We could not save that answer.');
    } finally {
      setSaving(false);
    }
  }

  async function submit() {
    if (saving || (mode === 'onboarding' && focusAreas.length < 1)) return;
    setSaving(true);
    setError(null);
    try {
      await persist(makeDraft(FOCUS_STEP, clarityResponses, identityResponses, focusAreas));
      const submission = await submitClarityCheck({
        responses: clarityResponses,
        identityResponses,
        onboarding: mode === 'onboarding',
      });
      setResult(submission);
      setStep(RESULT_STEP);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'We could not save your Clarity Check.');
    } finally {
      setSaving(false);
    }
  }

  async function finish() {
    if (saving) return;
    if (mode === 'retake') {
      router.replace('/account');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await initializeCompanionFocusAreas(focusAreas);
      await completeOnboarding();
      const nextState = await refresh();
      if (nextState?.status !== 'complete') {
        throw new Error('Your answers are safe, but setup could not be confirmed. Please try again.');
      }
      router.replace('/');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'We could not finish setup.');
    } finally {
      setSaving(false);
    }
  }

  async function goBack() {
    if (saving) return;
    if (step === 0) {
      if (mode === 'retake') router.back();
      return;
    }
    const nextStep = mode === 'retake' && step === RESULT_STEP
      ? FOCUS_STEP - 1
      : Math.max(0, step - 1);
    setStep(nextStep);
    setError(null);
    try {
      await persist(makeDraft(nextStep, clarityResponses, identityResponses, focusAreas));
    } catch {
      // Answers remain on screen. The next successful action persists the full draft.
    }
  }

  if (!hydrated) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={theme.colors.plum} />
      </View>
    );
  }

  const progress = step === 0 ? 0 : Math.min(1, step / RESULT_STEP);

  return (
    <LinearGradient
      colors={theme.homeGradient.colors}
      locations={theme.homeGradient.locations}
      start={theme.homeGradient.start}
      end={theme.homeGradient.end}
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
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerRow}>
              {(mode === 'retake' || step > 0) ? (
                <Pressable
                  accessibilityLabel="Go back"
                  accessibilityRole="button"
                  disabled={saving}
                  onPress={() => void goBack()}
                  style={styles.backButton}
                >
                  <Ionicons color={theme.colors.white} name="chevron-back" size={20} />
                </Pressable>
              ) : <View style={styles.backPlaceholder} />}
              <BrandHeader subtitle="Soul → Systems → AI™" variant="dark-background" />
            </View>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>

            {step === 0 ? (
              <Intro mode={mode} onBegin={() => void begin()} saving={saving} />
            ) : step < FIRST_IDENTITY_STEP ? (
              <ClarityQuestion
                index={step - FIRST_CLARITY_STEP}
                onAnswer={(value) => void answerClarity(value)}
                saving={saving}
                selected={clarityResponses[String(step)]}
              />
            ) : step < FOCUS_STEP ? (
              <IdentityQuestion
                index={step - FIRST_IDENTITY_STEP}
                onAnswer={(value) => void answerIdentity(value)}
                saving={saving}
                selected={identityResponses[step - FIRST_IDENTITY_STEP] as IdentityAnswer | undefined}
              />
            ) : step === FOCUS_STEP ? (
              <FocusQuestion
                first={firstFocus}
                onFirstChange={setFirstFocus}
                onSecondChange={setSecondFocus}
                onSubmit={() => void submit()}
                saving={saving}
                second={secondFocus}
              />
            ) : result ? (
              <Results mode={mode} onFinish={() => void finish()} result={result} saving={saving} />
            ) : (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Your answers are safe.</Text>
                <Text style={styles.cardBody}>Continue to rebuild your results.</Text>
                <PrimaryButton disabled={saving} label="Continue" loading={saving} onPress={() => setStep(FOCUS_STEP)} />
              </View>
            )}

            {error ? (
              <View accessibilityRole="alert" style={styles.errorCard}>
                <Text style={styles.errorText}>{error}</Text>
                <Text style={styles.errorHint}>Your previous answers are still here. Try this step again.</Text>
              </View>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function Intro({ mode, onBegin, saving }: { mode: FlowMode; onBegin: () => void; saving: boolean }) {
  return (
    <View style={styles.heroCard}>
      <Text style={styles.eyebrow}>{mode === 'retake' ? 'CLARITY CHECK' : 'WELCOME TO IPURPOSE'}</Text>
      <Text style={styles.heroTitle}>{mode === 'retake' ? 'Check in with where you are now.' : 'Find your north.'}</Text>
      <Text style={styles.heroBody}>
        A short reflection will help Compass understand what feels clear, what needs movement,
        and what deserves your attention right now.
      </Text>
      <View style={styles.principleCard}>
        <Text style={styles.principle}>Alignment before action.</Text>
        <Text style={styles.principle}>Structure before scale.</Text>
        <Text style={styles.principle}>Automation after clarity.</Text>
      </View>
      <PrimaryButton disabled={saving} label={mode === 'retake' ? 'Begin again' : 'Begin Clarity Check'} loading={saving} onPress={onBegin} />
    </View>
  );
}

function ClarityQuestion({
  index,
  onAnswer,
  saving,
  selected,
}: {
  index: number;
  onAnswer: (value: number) => void;
  saving: boolean;
  selected?: number;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>CLARITY · {index + 1} OF {CLARITY_QUESTIONS.length}</Text>
      <Text style={styles.cardTitle}>{CLARITY_QUESTIONS[index]}</Text>
      <View style={styles.scaleLabels}>
        <Text style={styles.scaleLabel}>Not true yet</Text>
        <Text style={styles.scaleLabel}>Very true</Text>
      </View>
      <View style={styles.scaleRow}>
        {[1, 2, 3, 4, 5].map((value) => (
          <Pressable
            accessibilityLabel={`${value} out of 5`}
            accessibilityRole="button"
            accessibilityState={{ selected: selected === value }}
            disabled={saving}
            key={value}
            onPress={() => onAnswer(value)}
            style={[styles.scaleButton, selected === value && styles.selectedScaleButton]}
          >
            <Text style={[styles.scaleNumber, selected === value && styles.selectedScaleNumber]}>{value}</Text>
          </Pressable>
        ))}
      </View>
      {saving ? <ActivityIndicator color={theme.colors.champagne} style={styles.savingIndicator} /> : null}
    </View>
  );
}

function IdentityQuestion({
  index,
  onAnswer,
  saving,
  selected,
}: {
  index: number;
  onAnswer: (value: IdentityAnswer) => void;
  saving: boolean;
  selected?: IdentityAnswer;
}) {
  const question = IDENTITY_QUESTIONS[index];
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>PATTERN · {index + 1} OF {IDENTITY_QUESTIONS.length}</Text>
      <Text style={styles.cardTitle}>{question.text}</Text>
      <View style={styles.options}>
        {(Object.entries(question.options) as [IdentityAnswer, string][]).map(([key, label]) => (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: selected === key }}
            disabled={saving}
            key={key}
            onPress={() => onAnswer(key)}
            style={[styles.option, selected === key && styles.selectedOption]}
          >
            <View style={[styles.optionMark, selected === key && styles.selectedOptionMark]}>
              <Text style={styles.optionMarkText}>{key}</Text>
            </View>
            <Text style={styles.optionText}>{label}</Text>
          </Pressable>
        ))}
      </View>
      {saving ? <ActivityIndicator color={theme.colors.champagne} style={styles.savingIndicator} /> : null}
    </View>
  );
}

function FocusQuestion({
  first,
  onFirstChange,
  onSecondChange,
  onSubmit,
  saving,
  second,
}: {
  first: string;
  onFirstChange: (value: string) => void;
  onSecondChange: (value: string) => void;
  onSubmit: () => void;
  saving: boolean;
  second: string;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>RIGHT NOW</Text>
      <Text style={styles.cardTitle}>What deserves your attention?</Text>
      <Text style={styles.cardBody}>Give Compass one clear place to begin. A second focus is optional.</Text>
      <Text style={styles.inputLabel}>WHAT BRINGS YOU HERE RIGHT NOW?</Text>
      <TextInput
        maxLength={MAX_FOCUS_LENGTH}
        multiline
        onChangeText={onFirstChange}
        placeholder="Name what needs clarity or movement"
        placeholderTextColor={theme.colors.muted}
        style={styles.input}
        value={first}
      />
      <Text style={styles.inputLabel}>WHAT ELSE DESERVES ATTENTION? · OPTIONAL</Text>
      <TextInput
        maxLength={MAX_FOCUS_LENGTH}
        multiline
        onChangeText={onSecondChange}
        placeholder="Add a second focus if it helps"
        placeholderTextColor={theme.colors.muted}
        style={styles.input}
        value={second}
      />
      <PrimaryButton disabled={saving || !first.trim()} label="See my Clarity Check" loading={saving} onPress={onSubmit} />
    </View>
  );
}

function Results({
  mode,
  onFinish,
  result,
  saving,
}: {
  mode: FlowMode;
  onFinish: () => void;
  result: ClarityCheckResult;
  saving: boolean;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>YOUR CLARITY CHECK</Text>
      <Text style={styles.resultType}>{result.identityType}</Text>
      <Text style={styles.resultSummary}>{result.resultSummary}</Text>
      <View style={styles.scoreGrid}>
        <Score label="Internal clarity" value={result.scores.internalClarity} />
        <Score label="Readiness for support" value={result.scores.readinessForSupport} />
        <Score label="Insight → action" value={result.scores.frictionBetweenInsightAndAction} />
        <Score label="Momentum" value={result.scores.integrationAndMomentum} />
      </View>
      <View style={styles.nextStepCard}>
        <Text style={styles.inputLabel}>YOUR NEXT STEP</Text>
        <Text style={styles.nextStepText}>{result.nextStep}</Text>
      </View>
      <PrimaryButton
        disabled={saving}
        label={mode === 'onboarding' ? 'Continue to Home' : 'Return to Account'}
        loading={saving}
        onPress={onFinish}
      />
    </View>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.scoreCard}>
      <Text style={styles.scoreValue}>{value}</Text>
      <Text style={styles.scoreLabel}>{label}</Text>
    </View>
  );
}

function PrimaryButton({
  disabled,
  label,
  loading = false,
  onPress,
}: {
  disabled: boolean;
  label: string;
  loading?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        (pressed || disabled) && styles.primaryButtonPressed,
      ]}
    >
      {loading ? <ActivityIndicator color={theme.colors.white} /> : <Text style={styles.primaryButtonText}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gradient: { flex: 1 },
  safe: { flex: 1 },
  loadingScreen: {
    alignItems: 'center',
    backgroundColor: theme.colors.cream,
    flex: 1,
    justifyContent: 'center',
  },
  container: { flexGrow: 1, paddingBottom: 40, paddingHorizontal: 20, paddingTop: 8 },
  headerRow: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  backButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.glassPillBg,
    borderColor: theme.colors.glassPillBorder,
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  backPlaceholder: { width: 44 },
  progressTrack: {
    backgroundColor: theme.colors.glassPillBg,
    borderRadius: 999,
    height: 4,
    marginBottom: 28,
    marginTop: 22,
    overflow: 'hidden',
  },
  progressFill: { backgroundColor: theme.colors.champagne, height: 4 },
  heroCard: { flex: 1, justifyContent: 'center', minHeight: 560, paddingBottom: 48 },
  eyebrow: {
    color: theme.colors.champagne,
    fontFamily: theme.fonts.body,
    fontSize: 11,
    letterSpacing: 1.7,
    marginBottom: 12,
  },
  heroTitle: {
    color: theme.colors.white,
    fontFamily: theme.fonts.heading,
    fontSize: 45,
    lineHeight: 52,
  },
  heroBody: {
    color: theme.colors.textOnDarkMuted,
    fontFamily: theme.fonts.body,
    fontSize: 16,
    lineHeight: 25,
    marginTop: 16,
  },
  principleCard: {
    backgroundColor: theme.colors.glassCardBg,
    borderColor: theme.colors.glassCardBorder,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 26,
    padding: 18,
  },
  principle: {
    color: theme.colors.textOnDark,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    lineHeight: 25,
  },
  card: {
    backgroundColor: 'rgba(27, 29, 51, 0.78)',
    borderColor: theme.colors.glassCardBorder,
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
  },
  cardTitle: {
    color: theme.colors.white,
    fontFamily: theme.fonts.heading,
    fontSize: 30,
    lineHeight: 38,
  },
  cardBody: {
    color: theme.colors.textOnDarkMuted,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
  scaleLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 34 },
  scaleLabel: { color: theme.colors.textOnDarkFaint, fontFamily: theme.fonts.body, fontSize: 11 },
  scaleRow: { flexDirection: 'row', gap: 9, justifyContent: 'space-between', marginTop: 10 },
  scaleButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.glassPillBg,
    borderColor: theme.colors.glassPillBorder,
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  selectedScaleButton: { backgroundColor: theme.colors.lavenderPurple, borderColor: theme.colors.lavenderPurple },
  scaleNumber: { color: theme.colors.white, fontFamily: theme.fonts.body, fontSize: 16 },
  selectedScaleNumber: { fontWeight: '700' },
  savingIndicator: { marginTop: 20 },
  options: { gap: 11, marginTop: 24 },
  option: {
    alignItems: 'center',
    backgroundColor: theme.colors.glassPillBg,
    borderColor: theme.colors.glassPillBorder,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  selectedOption: { borderColor: theme.colors.champagne },
  optionMark: {
    alignItems: 'center',
    backgroundColor: theme.colors.deepIndigo,
    borderRadius: 17,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  selectedOptionMark: { backgroundColor: theme.colors.lavenderPurple },
  optionMarkText: { color: theme.colors.white, fontFamily: theme.fonts.body, fontSize: 13 },
  optionText: { color: theme.colors.textOnDark, flex: 1, fontFamily: theme.fonts.body, fontSize: 14, lineHeight: 20 },
  inputLabel: {
    color: theme.colors.champagne,
    fontFamily: theme.fonts.body,
    fontSize: 10,
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 24,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.line,
    borderRadius: 16,
    borderWidth: 1,
    color: theme.colors.ink,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 72,
    padding: 14,
    textAlignVertical: 'top',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.lavenderPurple,
    borderRadius: 18,
    justifyContent: 'center',
    marginTop: 28,
    minHeight: 54,
    paddingHorizontal: 18,
  },
  primaryButtonPressed: { opacity: 0.62 },
  primaryButtonText: { color: theme.colors.white, fontFamily: theme.fonts.body, fontSize: 16 },
  errorCard: {
    backgroundColor: 'rgba(252, 196, 183, 0.16)',
    borderColor: theme.colors.salmonPeach,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 16,
    padding: 14,
  },
  errorText: { color: theme.colors.white, fontFamily: theme.fonts.body, fontSize: 14, lineHeight: 20 },
  errorHint: { color: theme.colors.textOnDarkMuted, fontFamily: theme.fonts.body, fontSize: 12, marginTop: 5 },
  resultType: { color: theme.colors.white, fontFamily: theme.fonts.heading, fontSize: 42 },
  resultSummary: { color: theme.colors.textOnDarkMuted, fontFamily: theme.fonts.body, fontSize: 15, lineHeight: 24, marginTop: 12 },
  scoreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 24 },
  scoreCard: {
    backgroundColor: theme.colors.glassPillBg,
    borderColor: theme.colors.glassPillBorder,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 96,
    padding: 13,
    width: '48%',
  },
  scoreValue: { color: theme.colors.champagne, fontFamily: theme.fonts.heading, fontSize: 28 },
  scoreLabel: { color: theme.colors.textOnDarkMuted, fontFamily: theme.fonts.body, fontSize: 11, lineHeight: 16 },
  nextStepCard: {
    backgroundColor: theme.colors.glassCardBg,
    borderColor: theme.colors.glassCardBorder,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 22,
    padding: 16,
  },
  nextStepText: { color: theme.colors.white, fontFamily: theme.fonts.body, fontSize: 14, lineHeight: 22 },
});
