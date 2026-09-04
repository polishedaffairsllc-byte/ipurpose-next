import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { BrandHeader } from '../../../components/BrandHeader';
import { VisualEnvironmentPicker } from '../../../components/VisualEnvironmentPicker';
import { useAuth } from '../../../context/AuthContext';
import { useVisualEnvironment } from '../../../context/VisualEnvironmentContext';
import { getCompanionProfile } from '../../../lib/api';
import { getDisplayName } from '../../../lib/profileIdentity';
import { theme } from '../../../theme';
import type { CompanionProfile } from '../../../types/companion';

const PROFILE_ERROR_MESSAGE =
  'Your Compass could not be loaded right now. Your account details are still available.';

function getInitials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'iP';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getProviderLabel(providerId?: string) {
  if (providerId === 'google.com') return 'Google';
  if (providerId === 'apple.com') return 'Apple';
  if (providerId === 'password') return 'Email and password';
  return 'Firebase account';
}

function IdentityRow({
  icon,
  iconBackground,
  label,
  value,
  trailing,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconBackground: string;
  label: string;
  value: string;
  trailing?: ReactNode;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIcon, { backgroundColor: iconBackground }]}>
        <Ionicons color={theme.colors.deepIndigo} name={icon} size={19} />
      </View>
      <View style={styles.infoCopy}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text selectable style={styles.infoValue}>{value}</Text>
      </View>
      {trailing}
    </View>
  );
}

function CompassField({
  label,
  value,
  emptyCopy,
}: {
  label: string;
  value?: string;
  emptyCopy: string;
}) {
  return (
    <View style={styles.compassField}>
      <Text style={styles.compassFieldLabel}>{label}</Text>
      <Text style={value ? styles.compassFieldValue : styles.compassFieldEmpty}>
        {value || emptyCopy}
      </Text>
    </View>
  );
}

export default function AccountScreen() {
  const router = useRouter();
  const { user, deleteAccount, signOut } = useAuth();
  const { tokens, savedTimezone, effectiveTimezone } = useVisualEnvironment();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [profile, setProfile] = useState<CompanionProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const loadProfile = useCallback(async (isActive: () => boolean) => {
    setProfileLoading(true);
    try {
      const nextProfile = await getCompanionProfile();
      if (!isActive()) return;
      setProfile(nextProfile);
      setProfileError(null);
    } catch {
      if (isActive()) setProfileError(PROFILE_ERROR_MESSAGE);
    } finally {
      if (isActive()) setProfileLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void loadProfile(() => active);
      return () => {
        active = false;
      };
    }, [loadProfile])
  );

  const email = user?.email || 'No email available';
  const displayName = getDisplayName(
    profile?.displayName || user?.displayName,
    user?.email
  );
  const initials = getInitials(displayName);
  const provider = getProviderLabel(user?.providerData[0]?.providerId);
  const focusAreas = profile?.focusAreas.slice(0, 2) ?? [];

  async function handleProfileRetry() {
    await loadProfile(() => true);
  }

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutError(null);
    try {
      await signOut();
    } catch {
      setSignOutError('We could not sign you out. Please try again.');
      setSigningOut(false);
    }
  }

  function openDeleteConfirmation() {
    setDeletePassword('');
    setDeleteError(null);
    setDeleteModalVisible(true);
  }

  function closeDeleteConfirmation() {
    if (deletingAccount) return;
    setDeleteModalVisible(false);
    setDeletePassword('');
    setDeleteError(null);
  }

  async function handleDeleteAccount() {
    if (deletingAccount || !deletePassword) return;
    setDeletingAccount(true);
    setDeleteError(null);

    try {
      await deleteAccount(deletePassword);
    } catch (error) {
      const code = typeof error === 'object' && error && 'code' in error
        ? String(error.code)
        : '';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setDeleteError('That password did not match this account. Please try again.');
      } else if (code === 'auth/too-many-requests') {
        setDeleteError('Too many attempts. Please wait a little while and try again.');
      } else if (code === 'auth/requires-recent-login') {
        setDeleteError('For your security, sign in again and then retry account deletion.');
      } else {
        setDeleteError(
          error instanceof Error
            ? error.message
            : 'We could not delete your account. Nothing was converted into a sign-out.'
        );
      }
      setDeletingAccount(false);
    }
  }

  return (
    <LinearGradient
      colors={tokens.screenGradient.colors}
      locations={tokens.screenGradient.locations}
      start={tokens.screenGradient.start}
      end={tokens.screenGradient.end}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <BrandHeader subtitle="What shapes your experience" variant="light-background" />

          <View style={styles.intro}>
            <Text style={[styles.eyebrow, { color: tokens.accentStrong }]}>ACCOUNT</Text>
            <Text style={styles.title}>What iPurpose knows about you.</Text>
            <Text style={styles.introBody}>
              Your account facts, Compass-developed identity, and the preferences
              you control in one calm place.
            </Text>
          </View>

          <View style={[styles.profileCard, { backgroundColor: tokens.profileCardBackground }]}>
            <View style={[styles.avatar, { backgroundColor: tokens.accentSoft }]}>
              <Text accessibilityLabel={`${displayName} initials`} style={styles.avatarText}>
                {initials}
              </Text>
            </View>
            <View style={styles.profileCopy}>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileEmail}>{email}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: tokens.accentStrong }]}>1 · IDENTITY</Text>
            <View
              style={[
                styles.sectionCard,
                { backgroundColor: tokens.surface, borderColor: tokens.surfaceBorder },
              ]}
            >
              {/* Display Name is intentionally read-only in mobile v2. Firebase Auth
                  and Firestore cannot be updated atomically in the current architecture. */}
              <IdentityRow
                icon="person-outline"
                iconBackground={tokens.accentSoft}
                label="Display Name"
                value={displayName}
              />
              <View style={[styles.divider, { backgroundColor: tokens.surfaceBorder }]} />
              <IdentityRow
                icon="mail-outline"
                iconBackground={theme.colors.systemsTint}
                label="Email"
                trailing={(
                  <View style={[styles.statusBadge, { backgroundColor: tokens.surfaceTint }]}>
                    <Ionicons
                      color={user?.emailVerified ? theme.colors.sageGreen : theme.colors.muted}
                      name={user?.emailVerified ? 'checkmark-circle' : 'ellipse-outline'}
                      size={14}
                    />
                    <Text style={styles.statusText}>
                      {user?.emailVerified ? 'Verified' : 'Not verified'}
                    </Text>
                  </View>
                )}
                value={email}
              />
              <View style={[styles.divider, { backgroundColor: tokens.surfaceBorder }]} />
              <IdentityRow
                icon="shield-checkmark-outline"
                iconBackground={theme.colors.aiTint}
                label="Sign-in method"
                value={provider}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: tokens.accentStrong }]}>2 · MY COMPASS</Text>
            <Text style={styles.sectionIntro}>
              Identity and purpose take shape through your work with Compass.
            </Text>

            {profileLoading ? (
              <View
                style={[
                  styles.statusCard,
                  { backgroundColor: tokens.surface, borderColor: tokens.surfaceBorder },
                ]}
              >
                <ActivityIndicator color={tokens.accentStrong} />
                <Text style={styles.statusCardText}>Reading your Compass…</Text>
              </View>
            ) : profileError ? (
              <View
                style={[
                  styles.statusCard,
                  { backgroundColor: tokens.surface, borderColor: tokens.surfaceBorder },
                ]}
              >
                <Ionicons color={theme.colors.deepIndigo} name="cloud-offline-outline" size={21} />
                <Text style={styles.statusCardText}>{profileError}</Text>
                <Pressable
                  accessibilityLabel="Retry loading My Compass"
                  accessibilityRole="button"
                  onPress={handleProfileRetry}
                  style={({ pressed }) => [
                    styles.retryButton,
                    { borderColor: tokens.accentStrong },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.retryText, { color: tokens.accentStrong }]}>Try again</Text>
                </Pressable>
              </View>
            ) : (
              <View
                style={[
                  styles.sectionCard,
                  { backgroundColor: tokens.surface, borderColor: tokens.surfaceBorder },
                ]}
              >
                <CompassField
                  emptyCopy="Compass is still developing this."
                  label="Primary archetype"
                  value={profile?.archetypePrimary}
                />
                {profile?.archetypeSecondary ? (
                  <>
                    <View style={[styles.divider, { backgroundColor: tokens.surfaceBorder }]} />
                    <CompassField
                      emptyCopy=""
                      label="Secondary archetype"
                      value={profile.archetypeSecondary}
                    />
                  </>
                ) : null}
                <View style={[styles.divider, { backgroundColor: tokens.surfaceBorder }]} />
                <CompassField
                  emptyCopy="This will take shape as you work with Compass."
                  label="Identity Anchor"
                  value={profile?.identityAnchor}
                />
                <View style={[styles.divider, { backgroundColor: tokens.surfaceBorder }]} />
                <CompassField
                  emptyCopy="This will take shape as you work with Compass."
                  label="Purpose Statement"
                  value={profile?.purposeStatement}
                />
                <View style={[styles.divider, { backgroundColor: tokens.surfaceBorder }]} />

                <View style={styles.focusBlock}>
                  <Text style={styles.compassFieldLabel}>Current Focus</Text>
                  {focusAreas.length ? (
                    <View style={styles.focusAreas}>
                      {focusAreas.map((focusArea) => (
                        <View
                          key={focusArea}
                          style={[
                            styles.focusChip,
                            {
                              backgroundColor: tokens.surfaceTint,
                              borderColor: tokens.accentStrong,
                            },
                          ]}
                        >
                          <Text style={styles.focusChipText}>{focusArea}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.compassFieldEmpty}>
                      Set what deserves your attention right now.
                    </Text>
                  )}
                  <Pressable
                    accessibilityLabel="Edit current focus"
                    accessibilityRole="button"
                    onPress={() => router.push('/focus')}
                    style={({ pressed }) => [
                      styles.inlineAction,
                      {
                        backgroundColor: tokens.buttonBackground,
                        borderColor: tokens.accentStrong,
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.inlineActionText, { color: tokens.buttonText }]}>
                      Edit current focus
                    </Text>
                    <Ionicons color={tokens.buttonText} name="arrow-forward" size={16} />
                  </Pressable>
                </View>
                <View style={[styles.divider, { backgroundColor: tokens.surfaceBorder }]} />
                <View style={styles.clarityCheckBlock}>
                  <Text style={styles.compassFieldLabel}>Clarity Check</Text>
                  <Text style={styles.clarityCheckCopy}>
                    Check in again when your direction or season changes.
                  </Text>
                  <Pressable
                    accessibilityLabel="Retake Clarity Check"
                    accessibilityRole="button"
                    onPress={() => router.push('/clarity-check')}
                    style={({ pressed }) => [
                      styles.inlineAction,
                      {
                        backgroundColor: tokens.buttonBackground,
                        borderColor: tokens.accentStrong,
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.inlineActionText, { color: tokens.buttonText }]}>Retake Clarity Check</Text>
                    <Ionicons color={tokens.buttonText} name="refresh" size={16} />
                  </Pressable>
                </View>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: tokens.accentStrong }]}>3 · PREFERENCES</Text>
            <Text style={styles.sectionIntro}>
              Choose the atmosphere and local rhythm that shape your experience.
            </Text>
            <VisualEnvironmentPicker />

            <Pressable
              accessibilityLabel={`Edit timezone. Current timezone ${effectiveTimezone}`}
              accessibilityRole="button"
              onPress={() => router.push('/timezone')}
              style={({ pressed }) => [
                styles.timezoneCard,
                { backgroundColor: tokens.surface, borderColor: tokens.surfaceBorder },
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.timezoneIcon, { backgroundColor: tokens.accentSoft }]}>
                <Ionicons color={tokens.accentStrong} name="time-outline" size={20} />
              </View>
              <View style={styles.timezoneCopy}>
                <Text style={styles.timezoneLabel}>Timezone</Text>
                <Text style={styles.timezoneValue}>{effectiveTimezone}</Text>
                <Text style={styles.timezoneSource}>
                  {savedTimezone ? 'Saved preference' : 'Using device timezone'}
                </Text>
              </View>
              <Ionicons color={tokens.accentStrong} name="chevron-forward" size={20} />
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: tokens.accentStrong }]}>4 · ACCOUNT &amp; SECURITY</Text>
            {signOutError ? (
              <View style={[styles.errorCard, { backgroundColor: tokens.surfaceTint }]}>
                <Ionicons color={theme.colors.deepIndigo} name="information-circle-outline" size={18} />
                <Text style={styles.errorText}>{signOutError}</Text>
              </View>
            ) : null}
            <Pressable
              accessibilityLabel="Sign out of iPurpose"
              accessibilityRole="button"
              disabled={signingOut}
              onPress={handleSignOut}
              style={({ pressed }) => [
                styles.signOutButton,
                {
                  backgroundColor: tokens.surface,
                  borderColor: tokens.profileCardBackground,
                },
                (pressed || signingOut) && styles.pressed,
              ]}
            >
              {signingOut ? (
                <ActivityIndicator color={theme.colors.deepIndigo} />
              ) : (
                <>
                  <Ionicons color={theme.colors.deepIndigo} name="log-out-outline" size={20} />
                  <Text style={styles.signOutText}>Sign out</Text>
                </>
              )}
            </Pressable>

            <View style={[styles.accountDivider, { backgroundColor: tokens.surfaceBorder }]} />
            <Text style={styles.deleteAccountIntro}>
              Permanently remove your iPurpose profile, Clarity Check results,
              Compass history, and Firebase sign-in.
            </Text>
            <Pressable
              accessibilityLabel="Delete iPurpose account"
              accessibilityRole="button"
              disabled={signingOut || deletingAccount}
              onPress={openDeleteConfirmation}
              style={({ pressed }) => [
                styles.deleteAccountButton,
                { backgroundColor: tokens.surface, borderColor: theme.colors.salmonPeach },
                (pressed || signingOut || deletingAccount) && styles.pressed,
              ]}
            >
              <Ionicons color={theme.colors.deepIndigo} name="trash-outline" size={20} />
              <Text style={styles.deleteAccountText}>Delete account</Text>
            </Pressable>
          </View>

          <Text style={styles.privacyNote}>
            Your information is used only to provide your authenticated iPurpose experience.
          </Text>
        </ScrollView>

        <Modal
          animationType="fade"
          onRequestClose={closeDeleteConfirmation}
          presentationStyle="overFullScreen"
          transparent
          visible={deleteModalVisible}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalBackdrop}
          >
            <View
              accessibilityViewIsModal
              style={[styles.deleteModal, { backgroundColor: tokens.surface }]}
            >
              <View style={[styles.deleteModalIcon, { backgroundColor: tokens.surfaceTint }]}>
                <Ionicons color={theme.colors.deepIndigo} name="warning-outline" size={25} />
              </View>
              <Text style={styles.deleteModalTitle}>Delete your account?</Text>
              <Text style={styles.deleteModalBody}>
                This permanently deletes your account and iPurpose data. This action cannot be undone.
              </Text>
              <Text style={styles.deletePasswordLabel}>Confirm with your password</Text>
              <TextInput
                accessibilityLabel="Password to confirm account deletion"
                autoCapitalize="none"
                autoComplete="current-password"
                editable={!deletingAccount}
                onChangeText={setDeletePassword}
                placeholder="Password"
                placeholderTextColor={theme.colors.muted}
                secureTextEntry
                style={[styles.deletePasswordInput, { borderColor: tokens.surfaceBorder }]}
                value={deletePassword}
              />
              {deleteError ? <Text style={styles.deleteError}>{deleteError}</Text> : null}
              <Pressable
                accessibilityLabel="Permanently delete account"
                accessibilityRole="button"
                disabled={deletingAccount || !deletePassword}
                onPress={handleDeleteAccount}
                style={({ pressed }) => [
                  styles.confirmDeleteButton,
                  { backgroundColor: theme.colors.deepIndigo },
                  (pressed || deletingAccount || !deletePassword) && styles.confirmDeleteDisabled,
                ]}
              >
                {deletingAccount ? (
                  <ActivityIndicator color={theme.colors.white} />
                ) : (
                  <Text style={styles.confirmDeleteText}>Permanently delete account</Text>
                )}
              </Pressable>
              <Pressable
                accessibilityLabel="Cancel account deletion"
                accessibilityRole="button"
                disabled={deletingAccount}
                onPress={closeDeleteConfirmation}
                style={({ pressed }) => [styles.cancelDeleteButton, pressed && styles.pressed]}
              >
                <Text style={styles.cancelDeleteText}>Cancel</Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { backgroundColor: 'transparent', flex: 1 },
  container: { paddingBottom: 44, paddingHorizontal: 20, paddingTop: 8 },
  intro: { marginTop: 32 },
  eyebrow: {
    fontFamily: theme.fonts.body,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  title: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.heading,
    fontSize: 32,
    lineHeight: 39,
    marginTop: 8,
  },
  introBody: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 9,
  },
  profileCard: {
    alignItems: 'center',
    borderRadius: 26,
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
    padding: 20,
  },
  avatar: {
    alignItems: 'center',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  avatarText: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.heading,
    fontSize: 22,
  },
  profileCopy: { flex: 1 },
  profileName: {
    color: theme.colors.white,
    fontFamily: theme.fonts.heading,
    fontSize: 24,
    lineHeight: 29,
  },
  profileEmail: {
    color: theme.colors.lightMistGray,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  section: { marginTop: 32 },
  sectionLabel: {
    fontFamily: theme.fonts.body,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.3,
  },
  sectionIntro: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
    marginTop: 7,
  },
  sectionCard: {
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 12,
    overflow: 'hidden',
    paddingHorizontal: 17,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 76,
    paddingVertical: 13,
  },
  infoIcon: {
    alignItems: 'center',
    borderRadius: 14,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  infoCopy: { flex: 1 },
  infoLabel: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 10,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  infoValue: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 3,
  },
  divider: { height: StyleSheet.hairlineWidth },
  statusBadge: {
    alignItems: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  statusText: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.body,
    fontSize: 9,
  },
  statusCard: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    gap: 10,
    marginTop: 12,
    padding: 20,
  },
  statusCardText: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  retryButton: {
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 2,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  retryText: { fontFamily: theme.fonts.body, fontSize: 12 },
  compassField: { paddingVertical: 17 },
  compassFieldLabel: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  compassFieldValue: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.heading,
    fontSize: 19,
    lineHeight: 26,
    marginTop: 7,
  },
  compassFieldEmpty: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 20,
    marginTop: 7,
  },
  focusBlock: { paddingBottom: 18, paddingTop: 17 },
  clarityCheckBlock: { paddingTop: 17 },
  clarityCheckCopy: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
  },
  focusAreas: { gap: 8, marginTop: 10 },
  focusChip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  focusChipText: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    lineHeight: 17,
  },
  inlineAction: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    marginTop: 14,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  inlineActionText: { fontFamily: theme.fonts.body, fontSize: 12 },
  timezoneCard: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
    padding: 16,
  },
  timezoneIcon: {
    alignItems: 'center',
    borderRadius: 15,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  timezoneCopy: { flex: 1 },
  timezoneLabel: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.heading,
    fontSize: 18,
  },
  timezoneValue: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    marginTop: 4,
  },
  timezoneSource: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 10,
    marginTop: 3,
  },
  errorCard: {
    alignItems: 'flex-start',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    padding: 12,
  },
  errorText: {
    color: theme.colors.deepIndigo,
    flex: 1,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  signOutButton: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    marginTop: 12,
    minHeight: 54,
    paddingHorizontal: 18,
  },
  signOutText: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.body,
    fontSize: 14,
  },
  accountDivider: { height: StyleSheet.hairlineWidth, marginTop: 22 },
  deleteAccountIntro: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 18,
  },
  deleteAccountButton: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    marginTop: 12,
    minHeight: 54,
    paddingHorizontal: 18,
  },
  deleteAccountText: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.body,
    fontSize: 14,
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(27, 29, 51, 0.64)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  deleteModal: {
    borderRadius: 26,
    maxWidth: 420,
    padding: 24,
    width: '100%',
  },
  deleteModalIcon: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  deleteModalTitle: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.heading,
    fontSize: 25,
    marginTop: 16,
    textAlign: 'center',
  },
  deleteModalBody: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
    textAlign: 'center',
  },
  deletePasswordLabel: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.body,
    fontSize: 11,
    letterSpacing: 0.5,
    marginTop: 22,
    textTransform: 'uppercase',
  },
  deletePasswordInput: {
    borderRadius: 16,
    borderWidth: 1,
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    marginTop: 8,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  deleteError: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },
  confirmDeleteButton: {
    alignItems: 'center',
    borderRadius: 18,
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 54,
    paddingHorizontal: 18,
  },
  confirmDeleteDisabled: { opacity: 0.48 },
  confirmDeleteText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.body,
    fontSize: 14,
  },
  cancelDeleteButton: { alignItems: 'center', marginTop: 10, padding: 12 },
  cancelDeleteText: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.body,
    fontSize: 14,
  },
  pressed: { opacity: 0.72 },
  privacyNote: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 28,
    textAlign: 'center',
  },
});
