import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useVisualEnvironment } from '../context/VisualEnvironmentContext';
import { SIGNUP_NAME_MAX_LENGTH } from '../lib/profileIdentity';
import { theme } from '../theme';

type Field = 'name' | 'email';
const MAX_DISPLAY_NAME_LENGTH = SIGNUP_NAME_MAX_LENGTH * 2 + 1;

export function AccountIdentityEditor({
  field,
  value,
  onClose,
  onSave,
}: {
  field: Field;
  value: string;
  onClose: () => void;
  onSave: (message: string) => void;
}) {
  const { user, identity, updateDisplayName, requestEmailChange } = useAuth();
  const { tokens } = useVisualEnvironment();
  const [draft, setDraft] = useState(field === 'name' ? value : '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editingEmail = field === 'email';
  const fieldLabel = editingEmail ? 'New email address' : 'Display name';
  const needsPassword = editingEmail && user?.providerData.some(({ providerId }) => providerId === 'password');

  async function save() {
    if (saving) return;
    const nextValue = draft.trim();
    if (!nextValue) {
      setError(editingEmail ? 'Enter your new email address.' : 'Enter the name you want to display.');
      return;
    }
    if (editingEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextValue)) {
      setError('Enter a valid email address.');
      return;
    }
    if (editingEmail && nextValue.toLowerCase() === identity.email?.toLowerCase()) {
      setError('Enter an email address different from your current one.');
      return;
    }
    if (needsPassword && !password) {
      setError('Enter your current password to confirm the change.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (editingEmail) {
        await requestEmailChange(nextValue, password);
        onSave(`Verification link sent to ${nextValue}. Open it to finish changing your email.`);
      } else {
        await updateDisplayName(nextValue);
        onSave('Your display name was updated.');
      }
    } catch (caught) {
      const code = (caught as { code?: string } | null)?.code;
      switch (code) {
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('That password did not match this account.');
          break;
        case 'auth/invalid-email':
          setError('Enter a valid email address.');
          break;
        case 'auth/email-already-in-use':
          setError('Choose an email address that is not already in use.');
          break;
        case 'auth/requires-recent-login':
        case 'auth/user-token-expired':
          setError('Sign in again, then return to Account to make this change.');
          break;
        case 'auth/too-many-requests':
          setError('Please wait a few minutes before trying again.');
          break;
        default:
          setError(editingEmail
            ? 'We could not send the verification link. Please try again.'
            : 'We could not update your name. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.form}>
      <Text style={styles.label}>{fieldLabel}</Text>
      <TextInput
        accessibilityLabel={fieldLabel}
        autoCapitalize={editingEmail ? 'none' : 'words'}
        autoComplete={editingEmail ? 'email' : 'name'}
        autoCorrect={false}
        editable={!saving}
        keyboardType={editingEmail ? 'email-address' : 'default'}
        maxLength={editingEmail ? 254 : MAX_DISPLAY_NAME_LENGTH}
        onChangeText={setDraft}
        style={[styles.input, { backgroundColor: tokens.surfaceTint, borderColor: tokens.surfaceBorder }]}
        value={draft}
      />
      {editingEmail ? <Text style={styles.hint}>Your sign-in email changes after you open the verification link in your new inbox.</Text> : null}
      {needsPassword ? (
        <>
          <Text style={styles.label}>Current password</Text>
          <TextInput
            accessibilityLabel="Current password"
            autoCapitalize="none"
            autoComplete="current-password"
            editable={!saving}
            onChangeText={setPassword}
            secureTextEntry
            style={[styles.input, { backgroundColor: tokens.surfaceTint, borderColor: tokens.surfaceBorder }]}
            value={password}
          />
        </>
      ) : null}
      {error ? <Text accessibilityRole="alert" style={styles.hint}>{error}</Text> : null}
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" accessibilityState={{ busy: saving, disabled: saving }} disabled={saving} onPress={() => void save()} style={[styles.button, { backgroundColor: tokens.buttonBackground }]}>
          <Text style={[styles.label, { color: tokens.buttonText }]}>{saving ? 'Saving…' : editingEmail ? 'Send verification link' : 'Save name'}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" disabled={saving} onPress={onClose} style={styles.button}>
          <Text style={[styles.label, { color: tokens.accentStrong }]}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 8, paddingVertical: 12 },
  label: { fontFamily: theme.fonts.body, fontSize: 15, color: theme.colors.deepIndigo },
  input: { minHeight: 44, fontFamily: theme.fonts.body, fontSize: 16, color: theme.colors.deepIndigo, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  hint: { fontFamily: theme.fonts.body, fontSize: 13, lineHeight: 19, color: theme.colors.deepIndigo },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  button: { minHeight: 44, borderRadius: 12, justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 8 },
});
