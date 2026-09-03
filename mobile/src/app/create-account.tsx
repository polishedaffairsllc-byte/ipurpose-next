import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { FirebaseError } from 'firebase/app';
import { Redirect, useRouter } from 'expo-router';
import { BrandHeader } from '../components/BrandHeader';
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
    return <View style={styles.center}><ActivityIndicator color={theme.colors.plum} /></View>;
  }
  if (user) return <Redirect href="/" />;

  const normalizedEmail = email.trim();
  const canSubmit = Boolean(
    normalizedEmail
    && password.length >= 6
    && password === confirmation
    && !submitting
  );

  async function handleCreateAccount() {
    if (!canSubmit) return;
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
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BrandHeader
            subtitle="Your Soul → Systems → AI companion"
            variant="light-background"
          />

          <View style={styles.hero}>
            <Text style={styles.eyebrow}>NEW TO IPURPOSE</Text>
            <Text style={styles.title}>Create your account.</Text>
            <Text style={styles.body}>
              Start with a short Clarity Check so Compass can meet you with useful context.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#9B919B"
              style={styles.input}
              textContentType="emailAddress"
              value={email}
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
              autoCapitalize="none"
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              placeholderTextColor="#9B919B"
              secureTextEntry
              style={styles.input}
              textContentType="newPassword"
              value={password}
            />
            <Text style={styles.label}>Confirm password</Text>
            <TextInput
              autoCapitalize="none"
              onChangeText={setConfirmation}
              onSubmitEditing={() => void handleCreateAccount()}
              placeholder="Enter your password again"
              placeholderTextColor="#9B919B"
              secureTextEntry
              style={styles.input}
              textContentType="newPassword"
              value={confirmation}
            />
            {confirmation && password !== confirmation ? (
              <Text style={styles.error}>Passwords do not match.</Text>
            ) : error ? (
              <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
            ) : null}
            <Pressable
              accessibilityRole="button"
              disabled={!canSubmit}
              onPress={() => void handleCreateAccount()}
              style={({ pressed }) => [
                styles.button,
                !canSubmit && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
            >
              {submitting ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={submitting}
              onPress={() => router.replace('/sign-in')}
              style={({ pressed }) => [styles.signInLink, pressed && styles.buttonPressed]}
            >
              <Text style={styles.signInLinkText}>Already have an account? Sign in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { backgroundColor: theme.colors.cream, flex: 1 },
  center: {
    alignItems: 'center',
    backgroundColor: theme.colors.cream,
    flex: 1,
    justifyContent: 'center',
  },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 20 },
  hero: { marginBottom: 26, marginTop: 42 },
  eyebrow: { color: theme.colors.plum, fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: theme.colors.ink, fontSize: 34, fontWeight: '700', lineHeight: 40, marginTop: 8 },
  body: { color: theme.colors.muted, fontSize: 16, lineHeight: 24, marginTop: 10 },
  card: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.line,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  label: { color: theme.colors.ink, fontSize: 13, fontWeight: '700', marginBottom: 7, marginTop: 5 },
  input: {
    backgroundColor: theme.colors.cream,
    borderColor: theme.colors.line,
    borderRadius: 14,
    borderWidth: 1,
    color: theme.colors.ink,
    fontSize: 16,
    marginBottom: 13,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  error: { color: theme.colors.danger, fontSize: 13, lineHeight: 18, marginBottom: 10 },
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.plum,
    borderRadius: 15,
    justifyContent: 'center',
    marginTop: 6,
    minHeight: 50,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonPressed: { opacity: 0.82 },
  buttonText: { color: theme.colors.white, fontSize: 16, fontWeight: '700' },
  signInLink: { alignItems: 'center', marginTop: 18, padding: 8 },
  signInLinkText: { color: theme.colors.plum, fontSize: 14, fontWeight: '700' },
});
