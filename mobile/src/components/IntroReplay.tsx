import { useCallback, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Modal, Pressable, StyleSheet, Text } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { IntroVideo, INTRO_VIDEOS } from './IntroVideo';
import { useAuth } from '../context/AuthContext';
import { useVisualEnvironment } from '../context/VisualEnvironmentContext';
import { getCompanionProfile, markIntroCompleted } from '../lib/api';
import { compassIntroStorageKey, type IntroKind } from '../lib/introVideos';
import { theme } from '../theme';

export function IntroReplay({ kind, returnLabel, autoShowCompass = false }: {
  kind: IntroKind;
  returnLabel: string;
  autoShowCompass?: boolean;
}) {
  const { user } = useAuth();
  const { tokens } = useVisualEnvironment();
  const [mode, setMode] = useState<'first' | 'replay' | null>(null);
  const shownThisSession = useRef(new Set<string>());
  const uid = user?.uid;

  useFocusEffect(useCallback(() => {
    if (!autoShowCompass || !uid) return () => setMode(null);
    let focused = true;

    async function checkIntro(accountId: string) {
      const key = compassIntroStorageKey(accountId);
      const saved = await AsyncStorage.getItem(key).catch(() => null);
      if (!focused || saved === 'synced') return;

      if (saved !== 'seen' && !shownThisSession.current.has(accountId)) {
        const { introVideos } = await getCompanionProfile(accountId);
        if (!focused || !introVideos || introVideos.hasSeenCompassIntro) return;

        // Count showing the intro once, including when the video is dismissed.
        shownThisSession.current.add(accountId);
        setMode(current => current ?? 'first');
        await AsyncStorage.setItem(key, 'seen').catch(() => {});
      }

      // Keep the device preference if the account update fails, and retry
      // silently on a later visit.
      const { introVideos } = await markIntroCompleted('compass', accountId);
      if (introVideos?.hasSeenCompassIntro === true) await AsyncStorage.setItem(key, 'synced');
    }

    void checkIntro(uid).catch(() => { /* Compass stays available when preferences cannot sync. */ });
    return () => { focused = false; setMode(null); };
  }, [autoShowCompass, uid]));

  async function close() {
    setMode(null);
  }

  return <>
    <Pressable accessibilityRole="button" onPress={() => setMode('replay')}
      style={[styles.button, { backgroundColor: tokens.surface, borderColor: tokens.surfaceBorder }]}>
      <Text style={styles.label}>{kind === 'welcome' ? 'Replay Welcome' : kind === 'compass' ? 'Replay Compass video' : `About ${INTRO_VIDEOS[kind].label}`}</Text>
    </Pressable>
    <Modal visible={mode !== null} animationType="fade" onRequestClose={close}>
      {mode ? <IntroVideo kind={kind} replay={mode === 'replay'}
        returnLabel={mode === 'replay' ? returnLabel : undefined}
        onContinue={close} /> : null}
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  button: { minHeight: 44, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, marginVertical: 6 },
  label: { color: theme.colors.ink, fontFamily: theme.fonts.body, fontSize: 14 },
});
