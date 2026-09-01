import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Redirect } from 'expo-router';
import { BrandHeader } from '../components/BrandHeader';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';

export default function SignInScreen() {
  const { user, loading, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={theme.colors.plum} /></View>;
  }

  if (user) {
    return <Redirect href="/" />;
  }

  async function handleSignIn() {
    if (!email.trim() || !password) return;
    setSubmitting(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch {
      setError('We could not sign you in. Check your email and password and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <BrandHeader subtitle="Your Soul → Systems → AI companion" />

          <View style={styles.hero}>
            <Text style={styles.eyebrow}>WELCOME BACK</Text>
            <Text style={styles.title}>Continue where you left off.</Text>
            <Text style={styles.body}>
              Sign in with your iPurpose account to bring your Mentor conversations with you.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              placeholder="you@example.com"
              placeholderTextColor="#9B919B"
              style={styles.input}
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="password"
              placeholder="Your password"
              placeholderTextColor="#9B919B"
              style={styles.input}
              onSubmitEditing={handleSignIn}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable
              onPress={handleSignIn}
              disabled={submitting || !email.trim() || !password}
              style={({ pressed }) => [
                styles.button,
                (submitting || !email.trim() || !password) && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
            >
              {submitting ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <Text style={styles.buttonText}>Sign in to iPurpose</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: theme.colors.cream },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.cream },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 20, justifyContent: 'center' },
  hero: { marginTop: 42, marginBottom: 26 },
  eyebrow: { color: theme.colors.plum, fontWeight: '800', letterSpacing: 1.5, fontSize: 12 },
  title: { color: theme.colors.ink, fontSize: 34, lineHeight: 40, fontWeight: '700', marginTop: 8 },
  body: { color: theme.colors.muted, fontSize: 16, lineHeight: 24, marginTop: 10 },
  card: { backgroundColor: theme.colors.white, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: theme.colors.line },
  label: { color: theme.colors.ink, fontSize: 13, fontWeight: '700', marginBottom: 7, marginTop: 5 },
  input: { borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.cream, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, color: theme.colors.ink, marginBottom: 13 },
  error: { color: theme.colors.danger, fontSize: 13, lineHeight: 18, marginBottom: 10 },
  button: { marginTop: 6, minHeight: 50, borderRadius: 15, backgroundColor: theme.colors.plum, alignItems: 'center', justifyContent: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonPressed: { opacity: 0.82 },
  buttonText: { color: theme.colors.white, fontSize: 16, fontWeight: '700' },
});
