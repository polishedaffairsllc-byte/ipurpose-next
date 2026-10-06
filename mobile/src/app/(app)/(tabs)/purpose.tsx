import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { usePurposeCheck } from '../../../context/PurposeCheckContext';
import { useVisualEnvironment } from '../../../context/VisualEnvironmentContext';
import { buildPurposePayload, emptyPurposeAnswers, purposePairing } from '../../../lib/purposeCheck';
import { purposeProfileDetails } from '../../../lib/purposeProfiles';
import { PURPOSE_QUESTIONS, purposeCopy } from '../../../lib/purposeCheckCopy';
import { logLaunchEvent } from '../../../lib/analyticsEvents';
import { theme } from '../../../theme';
import { PurposeButton } from '../../../components/PurposeButton';
export default function PurposeScreen() {
    const { profile, identityType, loading, error, refresh, save } = usePurposeCheck();
    const { tokens } = useVisualEnvironment();
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
    const question = step !== null && step < 6 ? PURPOSE_QUESTIONS[step] : null;
    const details = profile ? purposeProfileDetails(profile) : null;
    const pairing = profile ? purposePairing(profile, identityType) : null;
    return <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safe, { backgroundColor: tokens.screenBackground }]}><KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
 <Text style={[styles.eyebrow, { color: tokens.accentStrong }]}>{purposeCopy.tab}</Text>
 <Text accessibilityRole="header" style={styles.title}>{question ? purposeCopy.progress((step || 0) + 1) : step === 6 ? purposeCopy.reflection : purposeCopy.title}</Text>
 {loading && step === null ? <><ActivityIndicator color={tokens.accentStrong}/><Text style={styles.body}>{purposeCopy.loading}</Text></> : error && step === null ? <><Text accessibilityRole="alert" style={styles.body}>{error}</Text><PurposeButton label={purposeCopy.retry} onPress={() => void refresh()}/></> : question ? <>
 <Text style={styles.question}>{question.prompt}</Text><Text style={styles.body}>{question.max === 1 ? purposeCopy.chooseOne : purposeCopy.chooseTwo}</Text>
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
                }} style={[styles.option, { backgroundColor: selected ? tokens.accentSoft : tokens.surface, borderColor: selected ? tokens.accentStrong : tokens.surfaceBorder }, disabled && styles.dim]}><Text style={styles.body}>{selected ? '✓ ' : ''}{option.label}</Text></Pressable>;
            })}
 <PurposeButton label={purposeCopy.next} disabled={!answers[question.id].length} onPress={() => move((step || 0) + 1)}/>
 <PurposeButton label={step === 0 ? purposeCopy.cancel : purposeCopy.back} onPress={() => step === 0 ? (currentStep.current = null, setStep(null)) : move((step || 0) - 1)}/>
 </> : step === 6 ? <>
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
 <PurposeButton label={purposeCopy.compass} onPress={() => router.push('/mentor')}/><PurposeButton label={purposeCopy.path} disabled/><Text style={styles.body}>{purposeCopy.pathPending}</Text><PurposeButton label={purposeCopy.retake} onPress={begin}/>
 </> : <><Text style={styles.body}>{purposeCopy.intro}</Text><PurposeButton label={purposeCopy.start} onPress={begin}/></>}
 </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1 }, content: { padding: 24, paddingBottom: 44 }, eyebrow: { fontFamily: theme.fonts.body, fontSize: 12, marginBottom: 12 }, title: { fontFamily: theme.fonts.heading, fontSize: 32, lineHeight: 40, color: theme.colors.deepIndigo, marginBottom: 20 }, body: { fontFamily: theme.fonts.body, fontSize: 15, lineHeight: 24, color: theme.colors.deepIndigo }, question: { fontFamily: theme.fonts.heading, fontSize: 24, lineHeight: 32, color: theme.colors.deepIndigo, marginVertical: 16 }, option: { borderWidth: 1, borderRadius: 18, padding: 16, marginTop: 12, minHeight: 52 }, input: { minHeight: 140, borderRadius: 18, borderWidth: 1, padding: 16, textAlignVertical: 'top', fontFamily: theme.fonts.body, color: theme.colors.deepIndigo, fontSize: 16 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }, dim: { opacity: 0.5 } });
