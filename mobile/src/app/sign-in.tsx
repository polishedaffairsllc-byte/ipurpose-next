import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { AuthPanel, AuthScaffold, authStyles } from '../components/AuthScaffold';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';

export default function SignInScreen() {
  const router = useRouter();
  const { user, loading, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator color={theme.colors.champagne} /></View>;
  }
  if (user) return <Redirect href="/" />;

  async function handleSignIn() {
    if (!email.trim() || !password || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch {
      setError('We could not sign you in. Check your email and password and try again.');
      setSubmitting(false);
    }
  }

  const disabled = submitting || !email.trim() || !password;

  return (
    <AuthScaffold
      body="Return to your saved Clarity Check, Current Focus, and Compass conversations."
      eyebrow="WELCOME BACK"
      title="Continue where you left off."
    >
      <AuthPanel>
        <Text style={authStyles.label}>EMAIL</Text>
        <TextInput
          accessibilityLabel="Email"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor="#767A94"
          style={authStyles.input}
          textContentType="emailAddress"
          value={email}
        />
        <Text style={authStyles.label}>PASSWORD</Text>
        <TextInput
          accessibilityLabel="Password"
          onChangeText={setPassword}
          onSubmitEditing={() => void handleSignIn()}
          placeholder="Your password"
          placeholderTextColor="#767A94"
          secureTextEntry
          style={authStyles.input}
          textContentType="password"
          value={password}
        />
        {error ? <Text accessibilityRole="alert" style={authStyles.error}>{error}</Text> : null}
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={() => void handleSignIn()}
          style={({ pressed }) => [
            authStyles.primaryButton,
            disabled && authStyles.buttonDisabled,
            pressed && authStyles.buttonPressed,
          ]}
        >
          {submitting ? (
            <ActivityIndicator color={theme.colors.midnightIndigo} />
          ) : (
            <Text style={authStyles.primaryButtonText}>Sign In</Text>
          )}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={submitting}
          onPress={() => router.push('/create-account')}
          style={({ pressed }) => [authStyles.secondaryButton, pressed && authStyles.buttonPressed]}
        >
          <Text style={authStyles.secondaryButtonText}>New to iPurpose? Create Account</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={submitting}
          onPress={() => router.replace('/welcome')}
          style={({ pressed }) => [authStyles.textLink, pressed && authStyles.buttonPressed]}
        >
          <Text style={authStyles.textLinkText}>Back to welcome</Text>
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
});
