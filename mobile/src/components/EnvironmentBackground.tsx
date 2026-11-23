import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useVisualEnvironment } from '../context/VisualEnvironmentContext';

/** A fixed scenic canvas; readable surfaces scroll over the same environment. */
export function EnvironmentBackground({ children }: { children: ReactNode }) {
  const { tokens } = useVisualEnvironment();
  return (
    <LinearGradient {...tokens.screenGradient} style={styles.flex}>{children}</LinearGradient>
  );
}
const styles = StyleSheet.create({ flex: { flex: 1 } });
