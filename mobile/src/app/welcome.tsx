import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { AuthPanel, AuthScaffold, authStyles } from '../components/AuthScaffold';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.colors.champagne} />
      </View>
    );
  }
  if (user) return <Redirect href="/" />;

  return (
    <AuthScaffold
      body="A grounded companion for finding clarity, building what supports you, and moving with intention."
      eyebrow="YOUR SOUL · YOUR SYSTEMS · YOUR NORTH"
      title="Welcome, Beautiful Soul"
      variant="welcome"
    >
      <AuthPanel>
        <Text style={styles.panelTitle}>Begin where you are.</Text>
        <Text style={styles.panelBody}>
          Return to your Compass or create an account to find your starting point.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/sign-in')}
          style={({ pressed }) => [authStyles.primaryButton, pressed && authStyles.buttonPressed]}
        >
          <Text style={authStyles.primaryButtonText}>Sign In</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/create-account')}
          style={({ pressed }) => [authStyles.secondaryButton, pressed && authStyles.buttonPressed]}
        >
          <Text style={authStyles.secondaryButtonText}>Create Account</Text>
        </Pressable>
      </AuthPanel>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: theme.colors.midnightIndigo,
    flex: 1,
    justifyContent: 'center',
  },
  panelTitle: {
    color: theme.colors.white,
    fontFamily: theme.fonts.heading,
    fontSize: 24,
    textAlign: 'center',
  },
  panelBody: {
    color: theme.colors.textOnDarkMuted,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 7,
    textAlign: 'center',
  },
});
