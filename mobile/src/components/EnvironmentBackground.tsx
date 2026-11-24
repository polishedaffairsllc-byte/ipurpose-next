import type { ReactNode } from 'react';
import { ImageBackground, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useVisualEnvironment } from '../context/VisualEnvironmentContext';

/** A fixed scenic canvas; readable surfaces scroll over the same environment. */
export function EnvironmentBackground({ children, atmosphere = false }: { children: ReactNode; atmosphere?: boolean }) {
  const { tokens } = useVisualEnvironment();
  const gradient = atmosphere ? tokens.atmosphereGradient : tokens.screenGradient;
  return (
    <ImageBackground source={tokens.background} resizeMode="cover" style={[styles.flex, { backgroundColor: tokens.screenBackground }]}>
      <LinearGradient {...gradient} style={styles.flex}>{children}</LinearGradient>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({ flex: { flex: 1 } });
