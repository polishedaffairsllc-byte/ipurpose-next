import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Redirect, Stack, useSegments } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { SignupAdmissionGate } from '../../components/SignupAdmissionGate';
import { acknowledgeSignupDisclosure, getSignupAdmission } from '../../lib/api';
import { getOnboardingRedirect, type OnboardingRouteKind } from '../../lib/onboarding';
import { theme } from '../../theme';

export default function AuthenticatedLayout() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { onboarding, loading: onboardingLoading, error, refresh } = useOnboarding();
  const segments = useSegments();
  const [admissionState, setAdmissionState] = useState<{ uid: string; status: 'checking' | 'required' | 'complete' | 'error' } | null>(null);
  const [checkVersion, setCheckVersion] = useState(0);
  // Never reuse a previous user's approval during an account switch.
  const admission = admissionState?.uid === user?.uid ? admissionState.status : 'checking';

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
  if (onboardingLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.cream }}>
        <ActivityIndicator color={theme.colors.plum} />
      </View>
    );
  }
  if (error || !onboarding) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>We could not load your Compass setup.</Text>
        <Text style={styles.errorBody}>Check your connection, then try again.</Text>
        <Pressable onPress={() => void refresh()} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Try again</Text>
        </Pressable>
        <Pressable onPress={() => void signOut()} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Sign out</Text>
        </Pressable>
      </View>
    );
  }

  const leaf = segments.at(-1);
  const route: OnboardingRouteKind = leaf === 'onboarding'
    ? 'onboarding'
    : leaf === 'clarity-check'
      ? 'clarity-check'
      : 'other';
  const redirect = getOnboardingRedirect(onboarding.status, route);
  if (redirect) return <Redirect href={redirect} />;

  return <Stack screenOptions={{ headerShown: false }} />;
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
