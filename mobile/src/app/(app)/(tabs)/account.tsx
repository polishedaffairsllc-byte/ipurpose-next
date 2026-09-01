import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { BrandHeader } from '../../../components/BrandHeader';
import { useAuth } from '../../../context/AuthContext';
import { theme } from '../../../theme';

export default function AccountScreen() {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <BrandHeader subtitle="Your iPurpose account" />
        <View style={styles.card}>
          <Text style={styles.label}>SIGNED IN AS</Text>
          <Text style={styles.email}>{user?.email || 'iPurpose member'}</Text>
          <Text style={styles.help}>
            This prototype uses the same Firebase identity as the iPurpose website.
          </Text>
          <Pressable onPress={signOut} style={styles.button}>
            <Text style={styles.buttonText}>Sign out</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.cream },
  container: { flex: 1, padding: 22 },
  card: { marginTop: 44, backgroundColor: theme.colors.white, borderWidth: 1, borderColor: theme.colors.line, borderRadius: 24, padding: 20 },
  label: { color: theme.colors.plum, fontSize: 11, letterSpacing: 1.3, fontWeight: '800' },
  email: { color: theme.colors.ink, fontSize: 22, fontWeight: '700', marginTop: 8 },
  help: { color: theme.colors.muted, fontSize: 15, lineHeight: 22, marginTop: 10 },
  button: { alignSelf: 'flex-start', marginTop: 24, borderWidth: 1, borderColor: theme.colors.plum, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 12 },
  buttonText: { color: theme.colors.plum, fontWeight: '700' },
});
