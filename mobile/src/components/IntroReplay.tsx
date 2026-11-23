import { useCallback, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { IntroVideo, INTRO_VIDEOS } from './IntroVideo';
import { useAuth } from '../context/AuthContext';
import { useVisualEnvironment } from '../context/VisualEnvironmentContext';
import { getCompanionProfile, markIntroCompleted } from '../lib/api';
import type { IntroKind } from '../lib/introVideos';
import { theme } from '../theme';

export function IntroReplay({ kind, returnLabel, autoShowCompass = false }: {
  kind: IntroKind;
  returnLabel: string;
  autoShowCompass?: boolean;
}) {
  const { user } = useAuth();
  const { tokens } = useVisualEnvironment();
  const [mode, setMode] = useState<'first' | 'replay' | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const uid = user?.uid;

  useFocusEffect(useCallback(() => {
    let focused = true;
    if (autoShowCompass && uid && !dismissed) {
      void getCompanionProfile(uid).then(profile => {
        if (focused && profile.introVideos && !profile.introVideos.hasSeenCompassIntro) {
          setMode(current => current ?? 'first');
        }
      }).catch(() => { /* Compass remains available if preferences fail to load. */ });
    }
    return () => { focused = false; setMode(null); };
  }, [autoShowCompass, dismissed, uid]));

  async function close() {
    if (mode === 'first' && uid) await markIntroCompleted('compass', uid);
    setMode(null);
  }

  function dismiss() {
    if (mode === 'first') setDismissed(true);
    setMode(null);
  }

  return <>
    <Pressable accessibilityRole="button" onPress={() => setMode('replay')}
      style={[styles.button, { backgroundColor: tokens.surface, borderColor: tokens.surfaceBorder }]}>
      <Text style={styles.label}>{kind === 'welcome' ? 'Replay Welcome' : `About ${INTRO_VIDEOS[kind].label}`}</Text>
    </Pressable>
    <Modal visible={mode !== null} animationType="fade" onRequestClose={dismiss}>
      {mode ? <IntroVideo kind={kind} replay={mode === 'replay'}
        returnLabel={mode === 'replay' ? returnLabel : undefined}
        onContinue={close} onContinueForToday={dismiss} /> : null}
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  button: { minHeight: 44, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, marginVertical: 6 },
  label: { color: theme.colors.ink, fontFamily: theme.fonts.body, fontSize: 14 },
});
