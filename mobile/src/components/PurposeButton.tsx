import { Pressable, StyleSheet, Text } from 'react-native';
import { useVisualEnvironment } from '../context/VisualEnvironmentContext';
import { theme } from '../theme';
export function PurposeButton({ label, onPress, disabled = false }: {
    label: string;
    onPress?: () => void;
    disabled?: boolean;
}) {
    const { tokens } = useVisualEnvironment();
    return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, { backgroundColor: tokens.buttonBackground }, (pressed || disabled) && styles.dim]}><Text style={[styles.text, { color: tokens.buttonText }]}>{label}</Text></Pressable>;
}
const styles = StyleSheet.create({ button: { minHeight: 48, padding: 14, borderRadius: 18, justifyContent: 'center', marginTop: 12 }, text: { fontFamily: theme.fonts.body, fontSize: 15, textAlign: 'center' }, dim: { opacity: 0.5 } });
