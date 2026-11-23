import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Redirect, Stack, useSegments } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { FirstRunProvider, useFirstRun } from '../../context/FirstRunContext';
import { PurposeProvider } from '../../context/PurposeContext';
import { SignupAdmissionGate } from '../../components/SignupAdmissionGate';
import { acknowledgeSignupDisclosure, getSignupAdmission } from '../../lib/api';
import { firstRunRedirect } from '../../lib/firstRun';
import { theme } from '../../theme';

export default function AuthenticatedLayout() {
  const { user, loading: authLoading } = useAuth();
  const { refresh } = useOnboarding();
  const [admissionState, setAdmissionState] = useState<{ uid: string; status: 'checking' | 'required' | 'complete' | 'error' } | null>(null);
  const [checkVersion, setCheckVersion] = useState(0);
  // Never reuse a previous user's approval during an account switch.
  const admission = admissionState && admissionState.uid === user?.uid ? admissionState.status : 'checking';

  useEffect(() => {
    let active = true;
    if (!user?.uid) {
      setAdmissionState(null);
      return () => { active = false; };
    }
    const uid = user.uid;
    setAdmissionState({ uid, status: 'checking' });
    getSignupAdmission()
      .then(completed => { if (active) setAdmissionState({ uid, status: completed ? 'complete' : 'required' }); })
      .catch(() => { if (active) setAdmissionState({ uid, status: 'error' }); });
    return () => { active = false; };
  }, [user?.uid, checkVersion]);

  async function finishSignup() {
    await acknowledgeSignupDisclosure();
    // The first onboarding fetch may have been blocked before admission.
    await refresh();
    if (user?.uid) setAdmissionState({ uid: user.uid, status: 'complete' });
  }


  if (authLoading || (user && admission === 'checking')) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.cream }}>
        <ActivityIndicator color={theme.colors.plum} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/welcome" />;
  }

  if (admission === 'error') {
    return <SignupAdmissionGate unavailable onComplete={finishSignup}
      onRetry={() => setCheckVersion(value => value + 1)} />;
  }
  if (admission === 'required') {
    return <SignupAdmissionGate onComplete={finishSignup} />;
  }
  return <FirstRunProvider key={user.uid} uid={user.uid}>
    <PurposeProvider><AdmittedLayout /></PurposeProvider>
  </FirstRunProvider>;
}

function AdmittedLayout() {
  const { signOut } = useAuth();
  const { onboarding, loading, error, refresh } = useOnboarding();
  const firstRun = useFirstRun();
  const leaf = useSegments().at(-1);
  const openingClarity = leaf === 'onboarding';
  if (!firstRun.error && (!firstRun.state || (openingClarity && loading))) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.cream }}>
        <ActivityIndicator color={theme.colors.plum} />
      </View>
    );
  }
  if (firstRun.error || (openingClarity && (error || !onboarding))) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>We could not load your saved starting point.</Text>
        <Text style={styles.errorBody}>Check your connection, then try again.</Text>
        <Pressable onPress={firstRun.error ? firstRun.retry : () => void refresh()} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Try again</Text>
        </Pressable>
        <Pressable onPress={() => void signOut()} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Sign out</Text>
        </Pressable>
      </View>
    );
  }
  if (!firstRun.state) return null;
  const redirect = firstRunRedirect(firstRun.state, leaf);
  if (redirect) return <Redirect href={redirect} />;
  if (openingClarity && firstRun.state.stage === 'complete' && onboarding?.status === 'complete') {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="welcome-video" options={{ animation: 'fade', gestureEnabled: false }} />
    <Stack.Screen name="starting-point" options={{ gestureEnabled: false }} />
    <Stack.Screen name="starting-intro" options={{ gestureEnabled: false }} />
  </Stack>;
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.cream,
    padding: 28,
  },
  errorTitle: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.heading,
    fontSize: 28,
    textAlign: 'center',
  },
  errorBody: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    marginTop: 10,
    textAlign: 'center',
  },
  primaryButton: {
    minWidth: 180,
    alignItems: 'center',
    backgroundColor: theme.colors.plum,
    borderRadius: 16,
    marginTop: 24,
    padding: 15,
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.body,
    fontSize: 15,
  },
  secondaryButton: { marginTop: 16, padding: 10 },
  secondaryButtonText: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.body,
    fontSize: 14,
  },
});
