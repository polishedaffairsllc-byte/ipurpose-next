import { useMemo, useRef, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { usePurposeCheck } from '../context/PurposeCheckContext';
import { useVisualEnvironment } from '../context/VisualEnvironmentContext';
import { purposeCopy } from '../lib/purposeCheckCopy';
import { theme, type VisualEnvironmentTokens } from '../theme';
import { PurposeButton } from './PurposeButton';
export function PurposeDeletionControl() {
    const { clear, profile } = usePurposeCheck();
    const { tokens } = useVisualEnvironment();
    const styles = useMemo(() => createStyles(tokens), [tokens]);
    const [visible, setVisible] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deleted, setDeleted] = useState(false);
    const pending = useRef(false);
    const remove = async () => { if (pending.current)
        return; pending.current = true; setBusy(true); setError(null); try {
        await clear();
        setVisible(false);
        setDeleted(true);
    }
    catch {
        setError(purposeCopy.deleteError);
    }
    finally {
        pending.current = false;
        setBusy(false);
    } };
    return <View><PurposeButton label={purposeCopy.delete} disabled={!profile} onPress={() => { setError(null); setVisible(true); }}/>{deleted ? <Text accessibilityLiveRegion="polite" style={styles.body}>{purposeCopy.deleted}</Text> : null}
 <Modal visible={visible} transparent animationType="fade" onRequestClose={() => { if (!busy)
        setVisible(false); }}><View style={[styles.backdrop, { backgroundColor: theme.colors.glassCardBgDeep }]}><ScrollView contentContainerStyle={styles.center}><View accessibilityViewIsModal style={[styles.card, { backgroundColor: tokens.surface }]}><Text accessibilityRole="header" style={styles.title}>{purposeCopy.deleteTitle}</Text><Text style={styles.body}>{purposeCopy.deleteBody}</Text>{error ? <Text accessibilityRole="alert" style={styles.body}>{error}</Text> : null}<PurposeButton label={busy ? purposeCopy.deleting : purposeCopy.delete} disabled={busy} onPress={() => void remove()}/><PurposeButton label={purposeCopy.cancel} disabled={busy} onPress={() => setVisible(false)}/></View></ScrollView></View></Modal></View>;
}
const createStyles = (tokens: VisualEnvironmentTokens) => StyleSheet.create({ backdrop: { flex: 1 }, center: { flexGrow: 1, justifyContent: 'center', padding: 24 }, card: { borderRadius: 24, padding: 24 }, title: { fontFamily: theme.fonts.heading, ...theme.typography.question, color: tokens.screenText, marginBottom: 16 }, body: { fontFamily: theme.fonts.body, ...theme.typography.body, color: tokens.screenText } });
