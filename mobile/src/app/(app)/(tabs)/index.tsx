import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BrandHeader } from '../../../components/BrandHeader';
import { theme } from '../../../theme';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <BrandHeader subtitle="Alignment before action" />
        <View style={styles.hero}>
          <Text style={styles.kicker}>WELCOME BACK</Text>
          <Text style={styles.title}>Your purpose work can travel with you.</Text>
          <Text style={styles.body}>
            Your iPurpose Mentor now carries your conversation history between the web and this mobile prototype.
          </Text>
          <Pressable onPress={() => router.push('/mentor')} style={styles.button}>
            <Text style={styles.buttonText}>Open my Mentor</Text>
          </Pressable>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>SOUL → SYSTEMS → AI</Text>
          <Text style={styles.cardTitle}>Start with what is true.</Text>
          <Text style={styles.cardBody}>
            Reflect, organize the next step, then use AI where it actually helps.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.cream },
  container: { flex: 1, padding: 22 },
  hero: { marginTop: 54 },
  kicker: { color: theme.colors.plum, fontWeight: '800', letterSpacing: 1.2, fontSize: 12 },
  title: { color: theme.colors.ink, fontSize: 36, lineHeight: 42, fontWeight: '700', marginTop: 10 },
  body: { color: theme.colors.muted, fontSize: 17, lineHeight: 25, marginTop: 14 },
  button: { alignSelf: 'flex-start', backgroundColor: theme.colors.plum, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 14, marginTop: 24 },
  buttonText: { color: theme.colors.white, fontSize: 15, fontWeight: '700' },
  card: { marginTop: 'auto', backgroundColor: theme.colors.blush, borderRadius: 24, padding: 20, marginBottom: 18 },
  cardLabel: { color: theme.colors.plum, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  cardTitle: { color: theme.colors.ink, fontSize: 21, fontWeight: '700', marginTop: 8 },
  cardBody: { color: theme.colors.muted, fontSize: 15, lineHeight: 22, marginTop: 6 },
});
