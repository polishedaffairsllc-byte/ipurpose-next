import { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BrandHeader } from '../../../components/BrandHeader';
import { useAuth } from '../../../context/AuthContext';
import { theme } from '../../../theme';

function getDisplayName(displayName?: string | null, email?: string | null) {
  if (displayName?.trim()) return displayName.trim();

  const emailName = email?.split('@')[0]?.replace(/[._-]+/g, ' ').trim();
  if (!emailName) return 'iPurpose member';

  return emailName.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

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

export default function AccountScreen() {
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const email = user?.email || 'No email available';
  const displayName = getDisplayName(user?.displayName, user?.email);
  const initials = getInitials(displayName);
  const provider = getProviderLabel(user?.providerData[0]?.providerId);

  async function handleSignOut() {
    if (signingOut) return;

    setSigningOut(true);
    setError(null);

    try {
      await signOut();
    } catch {
      setError('We could not sign you out. Please try again.');
      setSigningOut(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <BrandHeader subtitle="Your profile and account" />

        <View style={styles.intro}>
          <Text style={styles.eyebrow}>ACCOUNT &amp; PROFILE</Text>
          <Text style={styles.title}>Your iPurpose identity.</Text>
          <Text style={styles.introBody}>
            The account details connected to your private reflection and Mentor
            experience.
          </Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar} accessibilityLabel={`${displayName} initials`}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <View style={styles.profileCopy}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{email}</Text>

            <View style={styles.memberBadge}>
              <Ionicons
                name="sparkles-outline"
                size={14}
                color={theme.colors.deepIndigo}
              />
              <Text style={styles.memberBadgeText}>iPurpose member</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PROFILE DETAILS</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={[styles.detailIcon, styles.identityIcon]}>
                <Ionicons
                  name="person-outline"
                  size={19}
                  color={theme.colors.deepIndigo}
                />
              </View>
              <View style={styles.detailCopy}>
                <Text style={styles.detailLabel}>Name</Text>
                <Text style={styles.detailValue}>{displayName}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={[styles.detailIcon, styles.emailIcon]}>
                <Ionicons
                  name="mail-outline"
                  size={19}
                  color={theme.colors.deepIndigo}
                />
              </View>
              <View style={styles.detailCopy}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{email}</Text>
              </View>
              {user?.emailVerified ? (
                <View style={styles.verifiedBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={15}
                    color={theme.colors.sageGreen}
                  />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={[styles.detailIcon, styles.securityIcon]}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={19}
                  color={theme.colors.deepIndigo}
                />
              </View>
              <View style={styles.detailCopy}>
                <Text style={styles.detailLabel}>Sign-in method</Text>
                <Text style={styles.detailValue}>{provider}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.methodCard}>
          <Text style={styles.methodLabel}>SOUL → SYSTEMS → AI™</Text>
          <Text style={styles.methodTitle}>One identity across your journey.</Text>
          <Text style={styles.methodBody}>
            Your mobile profile uses the same Firebase identity that protects
            your iPurpose account and keeps your Mentor experience connected.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT ACTIONS</Text>

          {error ? (
            <View style={styles.errorCard}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={theme.colors.deepIndigo}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={handleSignOut}
            disabled={signingOut}
            accessibilityRole="button"
            accessibilityLabel="Sign out of iPurpose"
            style={({ pressed }) => [
              styles.signOutButton,
              signingOut && styles.signOutButtonDisabled,
              pressed && styles.signOutButtonPressed,
            ]}
          >
            {signingOut ? (
              <ActivityIndicator color={theme.colors.deepIndigo} />
            ) : (
              <>
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={theme.colors.deepIndigo}
                />
                <Text style={styles.signOutText}>Sign out</Text>
              </>
            )}
          </Pressable>
        </View>

        <Text style={styles.privacyNote}>
          Your account details are used only to provide your authenticated
          iPurpose experience.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.cream,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  intro: {
    marginTop: 34,
  },
  eyebrow: {
    color: theme.colors.lavenderPurple,
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
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.deepIndigo,
    borderRadius: 26,
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
    padding: 20,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: theme.colors.salmonPeach,
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
  profileCopy: {
    flex: 1,
  },
  profileName: {
    color: theme.colors.white,
    fontFamily: theme.fonts.heading,
    fontSize: 24,
    lineHeight: 29,
  },
  profileEmail: {
    color: theme.colors.lightMistGray,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  memberBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.champagne,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 5,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  memberBadgeText: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.body,
    fontSize: 11,
  },
  section: {
    marginTop: 32,
  },
  sectionLabel: {
    color: theme.colors.lavenderPurple,
    fontFamily: theme.fonts.body,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  detailsCard: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.line,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 18,
  },
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 80,
    paddingVertical: 14,
  },
  detailIcon: {
    alignItems: 'center',
    borderRadius: 14,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  identityIcon: {
    backgroundColor: theme.colors.soulTint,
  },
  emailIcon: {
    backgroundColor: theme.colors.systemsTint,
  },
  securityIcon: {
    backgroundColor: theme.colors.aiTint,
  },
  detailCopy: {
    flex: 1,
  },
  detailLabel: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  detailValue: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 3,
  },
  divider: {
    backgroundColor: theme.colors.line,
    height: 1,
    marginLeft: 54,
  },
  verifiedBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  verifiedText: {
    color: theme.colors.sageGreen,
    fontFamily: theme.fonts.body,
    fontSize: 11,
  },
  methodCard: {
    backgroundColor: theme.colors.aiTint,
    borderColor: theme.colors.champagne,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 32,
    padding: 20,
  },
  methodLabel: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.body,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  methodTitle: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.heading,
    fontSize: 21,
    lineHeight: 27,
    marginTop: 8,
  },
  methodBody: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  errorCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.blush,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    padding: 12,
  },
  errorText: {
    color: theme.colors.deepIndigo,
    flex: 1,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  signOutButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.deepIndigo,
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 18,
  },
  signOutButtonDisabled: {
    opacity: 0.6,
  },
  signOutButtonPressed: {
    opacity: 0.78,
  },
  signOutText: {
    color: theme.colors.deepIndigo,
    fontFamily: theme.fonts.body,
    fontSize: 15,
  },
  privacyNote: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 20,
    textAlign: 'center',
  },
});
