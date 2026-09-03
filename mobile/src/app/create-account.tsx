import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { FirebaseError } from 'firebase/app';
import { Redirect, useRouter } from 'expo-router';
import { AuthPanel, AuthScaffold, authStyles } from '../components/AuthScaffold';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';

function getAccountError(error: unknown): string {
  if (error instanceof FirebaseError) {
    if (error.code === 'auth/email-already-in-use') {
      return 'An account already uses this email. Sign in instead.';
    }
    if (error.code === 'auth/invalid-email') return 'Enter a valid email address.';
    if (error.code === 'auth/weak-password') return 'Choose a password with at least 6 characters.';
  }
  return 'We could not create your account. Please try again.';
}

export default function CreateAccountScreen() {
  const router = useRouter();
  const { createAccount, loading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator color={theme.colors.champagne} /></View>;
  }
  if (user) return <Redirect href="/" />;

  const normalizedEmail = email.trim();
  const passwordsMatch = password === confirmation;
  const disabled = !normalizedEmail || password.length < 6 || !passwordsMatch || submitting;

  async function handleCreateAccount() {
    if (disabled) return;
    setSubmitting(true);
    setError(null);
    try {
      await createAccount(normalizedEmail, password);
    } catch (caught) {
      setError(getAccountError(caught));
      setSubmitting(false);
    }
  }

  return (
    <AuthScaffold
      body="Your Clarity Check will establish the first layer of context Compass needs to support you well."
      eyebrow="BEGIN YOUR JOURNEY"
      title="Create your account."
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
          autoCapitalize="none"
          onChangeText={setPassword}
          placeholder="At least 6 characters"
          placeholderTextColor="#767A94"
          secureTextEntry
          style={authStyles.input}
          textContentType="newPassword"
          value={password}
        />
        <Text style={authStyles.label}>CONFIRM PASSWORD</Text>
        <TextInput
          accessibilityLabel="Confirm password"
          autoCapitalize="none"
          onChangeText={setConfirmation}
          onSubmitEditing={() => void handleCreateAccount()}
          placeholder="Enter your password again"
          placeholderTextColor="#767A94"
          secureTextEntry
          style={authStyles.input}
          textContentType="newPassword"
          value={confirmation}
        />
        {confirmation && !passwordsMatch ? (
          <Text accessibilityRole="alert" style={authStyles.error}>Passwords do not match.</Text>
        ) : error ? (
          <Text accessibilityRole="alert" style={authStyles.error}>{error}</Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={() => void handleCreateAccount()}
          style={({ pressed }) => [
            authStyles.primaryButton,
            disabled && authStyles.buttonDisabled,
            pressed && authStyles.buttonPressed,
          ]}
        >
          {submitting ? (
            <ActivityIndicator color={theme.colors.midnightIndigo} />
          ) : (
            <Text style={authStyles.primaryButtonText}>Create Account</Text>
          )}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={submitting}
          onPress={() => router.replace('/sign-in')}
          style={({ pressed }) => [authStyles.textLink, pressed && authStyles.buttonPressed]}
        >
          <Text style={authStyles.textLinkText}>Already have an account? Sign in</Text>
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
