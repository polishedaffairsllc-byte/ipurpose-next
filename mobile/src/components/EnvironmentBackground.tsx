import type { ReactNode } from 'react';
import { ImageBackground, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useVisualEnvironment } from '../context/VisualEnvironmentContext';

/** A fixed scenic canvas; readable surfaces scroll over the same environment. */
export function EnvironmentBackground({ children, atmosphere = false }: { children: ReactNode; atmosphere?: boolean }) {
  const { tokens } = useVisualEnvironment();
  const gradient = atmosphere ? tokens.atmosphereGradient : tokens.screenGradient;
  return (
    <ImageBackground
      source={tokens.background}
      resizeMode="cover"
      imageStyle={styles.art}
      style={[styles.canvas, { backgroundColor: atmosphere ? tokens.tabBarBackground : tokens.screenBackground }]}
    >
      <LinearGradient {...gradient} style={styles.flex}>{children}</LinearGradient>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  canvas: { flex: 1, overflow: 'hidden' },
  art: { width: '100%', height: '100%' },
  flex: { flex: 1 },
});
