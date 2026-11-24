import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, ActivityIndicator, AppState, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { EnvironmentBackground } from './EnvironmentBackground';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVisualEnvironment } from '../context/VisualEnvironmentContext';
import type { IntroKind } from '../lib/introVideos';
import { theme } from '../theme';

export const INTRO_VIDEOS = {
  welcome: { source: require('../../assets/onboarding/welcome.mp4'), title: 'Welcome to\niPurpose Compass™', label: 'Welcome' },
  clarity: { source: require('../../assets/onboarding/iPurpose_Clarity_Check_Intro.mp4'), title: 'About Clarity Check', label: 'Clarity Check' },
  purpose: { source: require('../../assets/onboarding/iPurpose_Purpose_Intro.mp4'), title: 'About Purpose', label: 'Purpose' },
  compass: { source: require('../../assets/onboarding/iPurpose_Compass_Intro.mp4'), title: 'About Compass', label: 'Compass' },
};
const VIDEO_ASPECT_RATIO = 576 / 704;

export function IntroVideo({ kind, replay = false, returnLabel, onContinue }: { kind: IntroKind; replay?: boolean; returnLabel?: string; onContinue: () => Promise<void> }) {
  const intro = INTRO_VIDEOS[kind];
  const active = useRef(true);
  // Register before useVideoPlayer: Expo releases its native shared object in
  // passive cleanup, before this component's later focus/listener cleanups.
  useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);
  const { tokens } = useVisualEnvironment();
  const opacity = useRef(new Animated.Value(0)).current;
  const endCardOpacity = useRef(new Animated.Value(0)).current;
  const reduceMotion = useRef(false);
  useEffect(() => {
    let animationActive = true;
    void AccessibilityInfo.isReduceMotionEnabled().catch(() => false).then((reduce) => {
      if (animationActive) { reduceMotion.current = reduce; Animated.timing(opacity, { toValue: 1, duration: reduce ? 0 : 350, useNativeDriver: true }).start(); }
    });
    return () => { animationActive = false; opacity.stopAnimation(); endCardOpacity.stopAnimation(); };
  }, [opacity, endCardOpacity]);
  const fade = (toValue: number) => new Promise<void>((resolve) => {
    Animated.timing(opacity, { toValue, duration: reduceMotion.current ? 0 : 350, useNativeDriver: true }).start(() => resolve());
  });
  // Fill the available width; short screens scroll the video content while
  // Continue and Skip stay outside the scroll area. Keep the asset proportions.
  const { width } = useWindowDimensions();
  const videoWidth = Math.min(Math.max(width - 48, 1), 420);
  const finishing = useRef(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [ended, setEnded] = useState(false);
  const endedRef = useRef(false);
  const focused = useRef(false);
  const player = useVideoPlayer(intro.source, (video) => {
    video.loop = false;
    video.staysActiveInBackground = false;
  });
  const [status, setStatus] = useState(player.status);
  const [playing, setPlaying] = useState(player.playing);

  useEffect(() => {
    const statusSubscription = player.addListener('statusChange', (event) => { if (active.current) setStatus(event.status); });
    const playingSubscription = player.addListener('playingChange', ({ isPlaying }) => {
      if (active.current) setPlaying(isPlaying);
    });
    const endSubscription = player.addListener('playToEnd', () => {
      if (!active.current) return;
      setEnded(true);
      endedRef.current = true;
      if (kind === 'clarity') {
        Animated.timing(endCardOpacity, { toValue: 1, duration: reduceMotion.current ? 0 : 350, useNativeDriver: true }).start();
      }
    });
    const appSubscription = AppState.addEventListener('change', (state) => {
      if (!active.current) return;
      if (state !== 'active') player.pause();
      else if (focused.current && !endedRef.current && !finishing.current) player.play();
    });
    return () => {
      statusSubscription.remove();
      playingSubscription.remove();
      endSubscription.remove();
      appSubscription.remove();
    };
  }, [player, kind, endCardOpacity]);

  useFocusEffect(useCallback(() => {
    focused.current = true;
    if (active.current && !endedRef.current && AppState.currentState === 'active') player.play();
    return () => { focused.current = false; if (active.current) player.pause(); };
  }, [player]));

  // On web the view can mount after the modal opens. Wait for the actual
  // media element to report readiness before retrying an early play request.
  useEffect(() => {
    if (Platform.OS === 'web' && status === 'readyToPlay' && !player.playing && focused.current
      && !endedRef.current && !finishing.current && AppState.currentState === 'active') {
      player.play();
    }
  }, [player, status]);

  const finish = async () => {
    if (!active.current || finishing.current) return;
    finishing.current = true;
    player.pause();
    setSaving(true);
    setSaveError(null);
    try {
      await fade(0);
      if (active.current) await onContinue();
    } catch {
      if (!active.current) return;
      setSaveError('Your intro preference could not be saved. Please try again.');
      await fade(1);
      if (!active.current) return;
      finishing.current = false;
      setSaving(false);
      if (focused.current && !endedRef.current && AppState.currentState === 'active') player.play();
    }
  };

  return (
    <EnvironmentBackground>
      <SafeAreaView style={styles.flex}>
        {saving ? <View pointerEvents="none" accessibilityLabel="Continuing" style={[styles.loading, { zIndex: 1 }]}><ActivityIndicator color={tokens.accentStrong} /></View> : null}
        <Animated.View style={[styles.flex, { opacity }]}><ScrollView style={styles.flex} contentContainerStyle={styles.content}>
          <Image accessibilityLabel="iPurpose logo" source={require('../../assets/release/adaptive-icon-foreground.png')} resizeMode="contain" style={{ width: 44, height: 44 }} />
          <Text style={[styles.title, { color: theme.colors.ink }]}>{intro.title}</Text>
          <View style={[styles.videoContainer, { width: videoWidth, height: videoWidth / VIDEO_ASPECT_RATIO, backgroundColor: tokens.surface, borderColor: tokens.surfaceBorder }]}>
            <VideoView
              accessibilityLabel={`iPurpose Compass ${intro.label} video`}
              player={player}
              style={styles.flex}
              contentFit="contain"
              nativeControls={false}
              playsInline
              allowsFullscreen={false}
              allowsPictureInPicture={false}
              surfaceType="textureView"
              useExoShutter={false}
            />
            {kind === 'clarity' ? <Animated.View pointerEvents="none" accessibilityLabel="Clarity Check introduction complete" accessibilityElementsHidden={!ended} importantForAccessibility={ended ? 'auto' : 'no-hide-descendants'} style={[styles.loading, styles.endCard, { backgroundColor: tokens.screenBackground, opacity: endCardOpacity }]}>
              <Image accessibilityLabel="iPurpose logo" source={require('../../assets/release/adaptive-icon-foreground.png')} resizeMode="contain" style={{ width: 80, height: 80 }} />
              <Text style={[styles.title, { color: theme.colors.ink }]}>Ready when you are.</Text>
            </Animated.View> : null}
            {status === 'loading' ? <View pointerEvents="none" style={styles.loading}><ActivityIndicator color={tokens.accentStrong} /></View> : null}
          </View>
          {status === 'error' ? <Text accessibilityRole="alert" style={[styles.message, { color: theme.colors.ink }]}>This video could not play. You can still continue.</Text> : null}
          {status === 'readyToPlay' && !playing && !ended && !saving ? (
            <Pressable accessibilityRole="button" onPress={() => player.play()} style={styles.replay}>
              <Text style={[styles.linkText, { color: tokens.accentStrong }]}>Play video</Text>
            </Pressable>
          ) : null}
          {ended ? <Pressable accessibilityRole="button" onPress={() => { if (!active.current) return; player.currentTime = 0; endedRef.current = false; setEnded(false); player.play(); if (kind === 'clarity') Animated.timing(endCardOpacity, { toValue: 0, duration: reduceMotion.current ? 0 : 350, useNativeDriver: true }).start(); }} style={styles.replay}>
            <Text style={[styles.linkText, { color: tokens.accentStrong }]}>Replay video</Text>
          </Pressable> : null}
          {saveError ? <Text accessibilityRole="alert" style={[styles.message, { color: theme.colors.ink }]}>{saveError}</Text> : null}
        </ScrollView>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" accessibilityLabel={returnLabel || `Continue to ${kind === 'welcome' ? 'app' : intro.label}`} accessibilityState={{ disabled: saving, busy: saving }} disabled={saving} onPress={() => void finish()} style={({ pressed }) => [styles.continue, { backgroundColor: tokens.buttonBackground, opacity: pressed || saving ? 0.75 : 1 }]}>
              {saving ? <ActivityIndicator color={tokens.buttonText} /> : <Text style={[styles.continueText, { color: tokens.buttonText }]}>{returnLabel || 'Continue'}</Text>}
            </Pressable>
            {!replay ? <Pressable accessibilityRole="button" accessibilityLabel={`Skip ${intro.label.toLowerCase()} video`} disabled={saving} onPress={() => void finish()} style={styles.skip}>
              <Text style={[styles.linkText, { color: theme.colors.muted }]}>Skip</Text>
            </Pressable> : null}
          </View>
        </Animated.View>
      </SafeAreaView>
    </EnvironmentBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  title: { fontFamily: theme.fonts.heading, fontSize: 28, lineHeight: 34, textAlign: 'center' },
  videoContainer: { borderRadius: 26, borderWidth: 1, overflow: 'hidden' },
  loading: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
  endCard: { padding: 24, gap: 20 },
  actions: { width: '100%', maxWidth: 468, alignSelf: 'center', flexShrink: 0, paddingHorizontal: 24, paddingBottom: 12, gap: 4 },
  continue: { minHeight: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 14 },
  continueText: { fontFamily: 'System', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  skip: { minHeight: 44, padding: 12, alignItems: 'center', justifyContent: 'center' },
  replay: { minHeight: 44, paddingHorizontal: 20, justifyContent: 'center' },
  linkText: { fontFamily: 'System', fontSize: 14, textAlign: 'center' },
  message: { fontFamily: 'System', fontSize: 14, lineHeight: 20, textAlign: 'center', maxWidth: 420 },
});
