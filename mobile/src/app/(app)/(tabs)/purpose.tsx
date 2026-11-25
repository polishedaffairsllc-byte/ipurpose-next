import { EnvironmentBackground } from '../../../components/EnvironmentBackground';
import { useMemo, useCallback, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { usePurposeCheck } from '../../../context/PurposeCheckContext';
import { useVisualEnvironment } from '../../../context/VisualEnvironmentContext';
import { buildPurposePayload, emptyPurposeAnswers, purposePairing } from '../../../lib/purposeCheck';
import { purposeProfileDetails } from '../../../lib/purposeProfiles';
import { PURPOSE_QUESTIONS, purposeCopy } from '../../../lib/purposeCheckCopy';
import { logLaunchEvent } from '../../../lib/analyticsEvents';
import { theme, type VisualEnvironmentTokens } from '../../../theme';
import { PurposeButton } from '../../../components/PurposeButton';
import { IntroReplay } from '../../../components/IntroReplay';
import { BrandHeader } from '../../../components/BrandHeader';
import { JourneyHeading } from '../../../components/JourneyHeading';
export default function PurposeScreen() {
    const { profile, identityType, loading, error, refresh, save } = usePurposeCheck();
    const { tokens } = useVisualEnvironment();
    const styles = useMemo(() => createStyles(tokens), [tokens]);
    const router = useRouter();
    const [step, setStep] = useState<number | null>(null);
    const [answers, setAnswers] = useState(emptyPurposeAnswers);
    const [reflection, setReflection] = useState('');
    const [saveReflection, setSaveReflection] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const pending = useRef(false);
    const answerDraft = useRef(answers);
    const currentStep = useRef(step);
    const scroll = useRef<ScrollView>(null);
    useFocusEffect(useCallback(() => { void refresh(); return () => { currentStep.current = null; setStep(null); answerDraft.current = emptyPurposeAnswers(); setAnswers(answerDraft.current); setReflection(''); setSaveReflection(false); setSaveError(null); }; }, [refresh]));
    const begin = () => { answerDraft.current = emptyPurposeAnswers(); setAnswers(answerDraft.current); currentStep.current = 0; setReflection(''); setSaveReflection(false); setSaveError(null); setStep(0); logLaunchEvent('purpose_check_start'); scroll.current?.scrollTo({ y: 0 }); };
    const move = (next: number) => { currentStep.current = next; setStep(next); scroll.current?.scrollTo({ y: 0 }); };
    const submit = async () => {
        if (pending.current)
            return;
        pending.current = true;
        setSaving(true);
        setSaveError(null);
        try {
            await save(buildPurposePayload(answerDraft.current, reflection, saveReflection));
            setReflection('');
            setSaveReflection(false);
            setStep(null);
            logLaunchEvent('purpose_check_complete');
            scroll.current?.scrollTo({ y: 0 });
        }
        catch {
            setSaveError(purposeCopy.saveError);
        }
        finally {
            pending.current = false;
            setSaving(false);
        }
    };
    const question = step !== null ? PURPOSE_QUESTIONS[step] : undefined;
    const questionNumber = (step ?? 0) + 1;
    const details = profile ? purposeProfileDetails(profile) : null;
    const pairing = profile ? purposePairing(profile, identityType) : null;
    return <EnvironmentBackground><SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}><KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
 <BrandHeader subtitle="Clarity → Purpose → Action" />
 <JourneyHeading title={purposeCopy.tab} subtitle={step === null && !profile ? purposeCopy.title : undefined} />
 {loading && step === null ? <><ActivityIndicator color={tokens.accentStrong}/><Text style={styles.body}>{purposeCopy.loading}</Text></> : error && step === null ? <><Text accessibilityRole="alert" style={styles.body}>{error}</Text><PurposeButton label={purposeCopy.retry} onPress={() => void refresh()}/></> : question ? <>
 <View style={styles.progressRow}>
   <View
     accessibilityLabel="Purpose Check progress"
     accessibilityRole="progressbar"
     aria-valuemin={0}
     aria-valuemax={PURPOSE_QUESTIONS.length}
     aria-valuenow={questionNumber}
     style={styles.progressTrack}
   >
     <View style={[styles.progressFill, { width: `${(questionNumber / PURPOSE_QUESTIONS.length) * 100}%` }]} />
   </View>
   <Text style={styles.progressLabel}>{purposeCopy.progress(questionNumber)}</Text>
 </View>
 <View style={styles.questionCard}>
 <Text style={[styles.question, styles.questionPrompt]}>{question.prompt}</Text><Text style={styles.body}>{question.max === 1 ? purposeCopy.chooseOne : purposeCopy.chooseTwo}</Text>
 {question.options.map(option => {
                const selected = answers[question.id].includes(option.id);
                const disabled = !selected && question.max === 2 && answers[question.id].length >= 2;
                return <Pressable key={option.id} accessibilityRole={question.max === 1 ? 'radio' : 'checkbox'} accessibilityState={{ checked: selected, disabled }} disabled={disabled || saving} onPress={() => {
                    // A stale tap from the previous screen cannot answer/advance again.
                    if (pending.current || currentStep.current !== step) return;
                    const previous = answerDraft.current[question.id];
                    const removing = previous.includes(option.id);
                    if (!removing && previous.length >= question.max && question.max !== 1) return;
                    const nextSelection = question.max === 1 ? [option.id] : removing ? previous.filter(id => id !== option.id) : [...previous, option.id];
                    const nextAnswers = { ...answerDraft.current, [question.id]: nextSelection };
                    answerDraft.current = nextAnswers;
                    setAnswers(nextAnswers);
                    if ((question.max === 1 || !removing) && nextSelection.length === question.max) move((step || 0) + 1);
                }} style={[styles.option, { backgroundColor: selected ? tokens.accentSoft : tokens.surfaceTint, borderColor: selected ? tokens.accentStrong : tokens.surfaceBorder }, disabled && styles.dim]}><Text style={styles.body}>{selected ? '✓ ' : ''}{option.label}</Text></Pressable>;
            })}
 </View>
 <PurposeButton label={purposeCopy.next} disabled={!answers[question.id].length} onPress={() => move((step || 0) + 1)}/>
 <PurposeButton label={step === 0 ? purposeCopy.cancel : purposeCopy.back} onPress={() => step === 0 ? (currentStep.current = null, setStep(null)) : move((step || 0) - 1)}/>
 </> : step === 6 ? <>
 <Text style={styles.reflectionPrompt}>{purposeCopy.reflection}</Text>
 <TextInput accessibilityLabel={purposeCopy.reflection} multiline maxLength={2000} editable={!saving} value={reflection} onChangeText={setReflection} style={[styles.input, { backgroundColor: tokens.surface, borderColor: tokens.surfaceBorder }]}/>
 <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: saveReflection, disabled: saving }} disabled={saving} onPress={() => setSaveReflection(!saveReflection)} style={[styles.option, { borderColor: tokens.surfaceBorder, backgroundColor: tokens.surface }]}><Text style={styles.body}>{saveReflection ? '☑ ' : '☐ '}{purposeCopy.reflectionSave}</Text></Pressable>
 <Text style={styles.body}>{purposeCopy.reflectionHelper}</Text>{saveError ? <Text accessibilityRole="alert" style={styles.body}>{saveError}</Text> : null}
 <PurposeButton label={saving ? purposeCopy.saving : purposeCopy.save} disabled={saving} onPress={() => void submit()}/><PurposeButton label={purposeCopy.back} disabled={saving} onPress={() => move(5)}/>
 </> : profile ? <>
 <Text style={styles.question}>{details?.name}</Text>
 <View style={styles.chips}>{profile.signals.map(s => <View key={s.signal} style={[styles.chip, { backgroundColor: tokens.accentSoft }]}><Text style={styles.body}>{s.signal}</Text></View>)}</View>
 <Text style={styles.question}>{profile.direction}</Text><Text style={styles.body}>{purposeCopy.drawn}</Text>
 <Text style={styles.question}>People you want to serve</Text><Text style={styles.body}>{profile.audience.join(' · ')}</Text>
 <Text style={styles.question}>Impact you hope to make</Text><Text style={styles.body}>{profile.impact.label}</Text>
 {details?.signals.map(signal => <View key={signal.name}><Text style={styles.question}>{signal.name}</Text><Text style={styles.body}>{signal.interpretation}</Text><Text style={styles.body}>Strengths to notice: {signal.strengths.join(' · ')}</Text></View>)}
 <Text style={styles.body}>These patterns are clues, not a fixed label. Purpose can travel across roles and change with your season.</Text>
 {profile.reflectionSaved && profile.reflection ? <><Text style={styles.question}>{purposeCopy.reflectionLabel}</Text><Text style={styles.body}>{profile.reflection}</Text></> : null}
 {pairing ? <Text style={styles.body}>{pairing}</Text> : <PurposeButton label={purposeCopy.clarity} onPress={() => router.push('/clarity-check')}/>}
 <PurposeButton label={purposeCopy.compass} onPress={() => router.push('/mentor')}/><PurposeButton label={purposeCopy.path} onPress={() => router.navigate('/purpose-path')}/><PurposeButton label={purposeCopy.retake} onPress={begin}/>
 </> : <><Text style={styles.body}>{purposeCopy.intro}</Text><PurposeButton label={purposeCopy.start} onPress={begin}/><PurposeButton label="Explore the Purpose Path" onPress={() => router.navigate('/purpose-path')}/></>}
 </ScrollView>
 <IntroReplay kind="purpose" returnLabel="Return to Purpose" autoShowOnFirstVisit={step === null} />
 </KeyboardAvoidingView></SafeAreaView></EnvironmentBackground>;
}
const createStyles = (tokens: VisualEnvironmentTokens) => StyleSheet.create({ safe: { flex: 1 }, content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 44 },
    progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
    progressTrack: { flex: 1, height: 6, borderRadius: 999, overflow: 'hidden', backgroundColor: tokens.surfaceTint },
    progressFill: { height: 6, borderRadius: 999, backgroundColor: tokens.accentStrong },
    progressLabel: { fontFamily: theme.fonts.body, ...theme.typography.label, color: tokens.screenTextMuted },
    questionCard: { borderRadius: 22, borderWidth: 1, borderColor: tokens.surfaceBorder, backgroundColor: tokens.surface, padding: 16 },
    body: { fontFamily: theme.fonts.body, ...theme.typography.body, color: tokens.screenText },
    question: { fontFamily: theme.fonts.heading, ...theme.typography.question, color: tokens.screenText, marginVertical: 16 },
    questionPrompt: { marginBottom: 8, marginTop: 4 },
    reflectionPrompt: { fontFamily: theme.fonts.heading, ...theme.typography.sectionTitle, color: tokens.screenText, marginBottom: 12 },
    option: { borderWidth: 1, borderRadius: 18, padding: 16, marginTop: 12, minHeight: 52 },
    input: { minHeight: 140, borderRadius: 18, borderWidth: 1, padding: 16, textAlignVertical: 'top', fontFamily: theme.fonts.body, color: tokens.screenText, ...theme.typography.input },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
    dim: { opacity: 0.5 },
});
