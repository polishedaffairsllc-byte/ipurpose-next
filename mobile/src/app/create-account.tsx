import { CLARITY_LIFECYCLE_COPY } from '../lib/clarityLifecycleCopy';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { FirebaseError } from 'firebase/app';
import { Redirect, useRouter } from 'expo-router';
import { AuthPanel, AuthScaffold, authStyles } from '../components/AuthScaffold';
import { SignupDisclosure } from '../components/SignupDisclosure';
import { SignupSetupError, useAuth } from '../context/AuthContext';
import { parseSignupName, SIGNUP_NAME_MAX_LENGTH } from '../lib/profileIdentity';
import { theme } from '../theme';

function getAccountError(error: unknown): string {
  if (error instanceof SignupSetupError) return error.message;
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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [disclosureAcknowledged, setDisclosureAcknowledged] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator color={theme.colors.champagne} /></View>;
  }
  if (user) return <Redirect href="/" />;

  const normalizedEmail = email.trim();
  const name = parseSignupName(firstName, lastName);
  const passwordsMatch = password === confirmation;
  const disabled = !name || !normalizedEmail || password.length < 6 || !passwordsMatch || !disclosureAcknowledged || submitting;

  async function handleCreateAccount() {
    if (disabled || !name) return;
    setSubmitting(true);
    setError(null);
    try {
      await createAccount(normalizedEmail, password, {
        ...name,
        marketingOptIn,
        disclosureAcknowledged,
      });
    } catch (caught) {
      if (caught instanceof SignupSetupError) setAccountCreated(true);
      setError(getAccountError(caught));
      setSubmitting(false);
    }
  }

  return (
    <AuthScaffold
      title="Create your account."
      variant="signup"
    >
      <AuthPanel>
        <Text style={authStyles.label}>FIRST NAME</Text>
        <TextInput
          accessibilityLabel="First name"
          autoCapitalize="words"
          autoCorrect={false}
          editable={!submitting}
          maxLength={SIGNUP_NAME_MAX_LENGTH}
          onChangeText={setFirstName}
          style={authStyles.input}
          textContentType="givenName"
          value={firstName}
        />
        <Text style={authStyles.label}>LAST NAME</Text>
        <TextInput
          accessibilityLabel="Last name"
          autoCapitalize="words"
          autoCorrect={false}
          editable={!submitting}
          maxLength={SIGNUP_NAME_MAX_LENGTH}
          onChangeText={setLastName}
          style={authStyles.input}
          textContentType="familyName"
          value={lastName}
        />
        <Text style={authStyles.label}>EMAIL</Text>
        <TextInput
          accessibilityLabel="Email"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!submitting && !accountCreated}
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={theme.colors.muted}
          style={authStyles.input}
          textContentType="emailAddress"
          value={email}
        />
        <Text style={authStyles.label}>PASSWORD</Text>
        <View style={styles.passwordField}>
          <TextInput
            accessibilityLabel="Password"
            autoCapitalize="none"
            editable={!submitting && !accountCreated}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            placeholderTextColor={theme.colors.muted}
            secureTextEntry={!passwordVisible}
            style={[authStyles.input, styles.passwordInput]}
            textContentType="newPassword"
            value={password}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
            accessibilityState={{ disabled: submitting }}
            disabled={submitting}
            onPress={() => setPasswordVisible(visible => !visible)}
            style={styles.visibilityButton}
          >
            <Ionicons name={passwordVisible ? 'eye-off-outline' : 'eye-outline'} size={24} color={theme.colors.deepIndigo} />
          </Pressable>
        </View>
        <Text style={authStyles.label}>CONFIRM PASSWORD</Text>
        <View style={styles.passwordField}>
          <TextInput
            accessibilityLabel="Confirm password"
            autoCapitalize="none"
            editable={!submitting && !accountCreated}
            onChangeText={setConfirmation}
            onSubmitEditing={() => void handleCreateAccount()}
            placeholder="Enter your password again"
            placeholderTextColor={theme.colors.muted}
            secureTextEntry={!confirmationVisible}
            style={[authStyles.input, styles.passwordInput]}
            textContentType="newPassword"
            value={confirmation}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={confirmationVisible ? 'Hide confirm password' : 'Show confirm password'}
            accessibilityState={{ disabled: submitting }}
            disabled={submitting}
            onPress={() => setConfirmationVisible(visible => !visible)}
            style={styles.visibilityButton}
          >
            <Ionicons name={confirmationVisible ? 'eye-off-outline' : 'eye-outline'} size={24} color={theme.colors.deepIndigo} />
          </Pressable>
        </View>
        <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: marketingOptIn }}
          accessibilityLabel={CLARITY_LIFECYCLE_COPY.consent} disabled={submitting}
          onPress={() => setMarketingOptIn(value => !value)} style={styles.consentRow}>
          <Ionicons name={marketingOptIn ? 'checkbox' : 'square-outline'} size={24} color={theme.colors.champagne} />
          <Text style={styles.consentText}>{CLARITY_LIFECYCLE_COPY.consent}</Text>
        </Pressable>
        <SignupDisclosure inline acknowledged={disclosureAcknowledged} disabled={submitting}
          onToggle={() => setDisclosureAcknowledged(value => !value)} />
        {confirmation && !passwordsMatch ? (
          <Text accessibilityRole="alert" style={authStyles.error}>Passwords do not match.</Text>
        ) : error ? (
          <Text accessibilityRole="alert" style={authStyles.error}>{error}</Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled, busy: submitting }}
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
            <Text style={authStyles.primaryButtonText}>{accountCreated ? 'Try again' : 'Create Account'}</Text>
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
  passwordField: { position: 'relative' },
  passwordInput: { paddingRight: 60 },
  visibilityButton: { position: 'absolute', right: 4, top: 0, bottom: 0, minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  consentRow: { flexDirection: 'row', gap: 10, paddingVertical: 14, alignItems: 'flex-start' },
  consentText: { flex: 1, color: theme.colors.textOnDarkMuted, fontFamily: theme.fonts.body, ...theme.typography.body },
  loading: {
    alignItems: 'center',
    backgroundColor: theme.colors.midnightIndigo,
    flex: 1,
    justifyContent: 'center',
  },
});
