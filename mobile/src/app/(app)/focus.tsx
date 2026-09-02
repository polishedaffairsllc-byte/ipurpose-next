import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { BrandHeader } from '../../components/BrandHeader';
import { getCompanionProfile, updateCompanionFocusAreas } from '../../lib/api';
import { theme } from '../../theme';

const MAX_FOCUS_LENGTH = 160;
export default function FocusScreen() {
  const router = useRouter();
  const [first, setFirst] = useState(''); const [second, setSecond] = useState('');
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [saved, setSaved] = useState(false); const [error, setError] = useState<string | null>(null);

  useFocusEffect(useCallback(() => { let active = true; setLoading(true); getCompanionProfile().then((p) => { if (!active) return; setFirst(p.focusAreas?.[0] || ''); setSecond(p.focusAreas?.[1] || ''); }).catch(() => { if (active) setError('Unable to load your current focus.'); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []));

  async function save() {
    if (saving) return;
    const focusAreas = [first, second].map((v) => v.trim()).filter(Boolean).slice(0, 2);
    setSaving(true); setSaved(false); setError(null);
    try { await updateCompanionFocusAreas(focusAreas); setFirst(focusAreas[0] || ''); setSecond(focusAreas[1] || ''); setSaved(true); }
    catch { setError('Compass could not save your focus. Please try again.'); }
    finally { setSaving(false); }
  }

  return <LinearGradient colors={theme.homeGradient.colors} locations={theme.homeGradient.locations} start={theme.homeGradient.start} end={theme.homeGradient.end} style={styles.gradient}>
    <SafeAreaView style={styles.safe}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.container}>
      <View style={styles.topRow}><Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.backButton}><Ionicons name="chevron-back" size={20} color={theme.colors.textOnDark} /></Pressable><BrandHeader subtitle="What matters now" variant="dark-background" /></View>
      <View style={styles.hero}><Text style={styles.kicker}>CURRENT FOCUS</Text><Text style={styles.title}>What deserves your attention right now?</Text><Text style={styles.subtitle}>Keep this to one or two priorities. Compass will use them to orient your Home experience.</Text></View>
      {loading ? <ActivityIndicator color={theme.colors.champagneText} /> : <BlurView intensity={30} tint="dark" style={styles.card}>
        <Text style={styles.label}>PRIMARY FOCUS</Text><TextInput value={first} onChangeText={(v) => { setFirst(v); setSaved(false); }} maxLength={MAX_FOCUS_LENGTH} placeholder="What matters most right now?" placeholderTextColor={theme.colors.textOnDarkFaint} style={styles.input} />
        <Text style={[styles.label, styles.secondLabel]}>SECOND FOCUS · OPTIONAL</Text><TextInput value={second} onChangeText={(v) => { setSecond(v); setSaved(false); }} maxLength={MAX_FOCUS_LENGTH} placeholder="Add another focus if it helps" placeholderTextColor={theme.colors.textOnDarkFaint} style={styles.input} />
        {error ? <Text style={styles.error}>{error}</Text> : null}{saved ? <Text style={styles.saved}>Your current focus is saved.</Text> : null}
        <Pressable accessibilityRole="button" accessibilityLabel="Save current focus" onPress={save} disabled={saving} style={({pressed}) => [styles.button, (pressed || saving) && styles.buttonPressed]}>{saving ? <ActivityIndicator color={theme.colors.textOnDark} /> : <Text style={styles.buttonText}>Save Focus</Text>}</Pressable>
      </BlurView>}
    </ScrollView></SafeAreaView>
  </LinearGradient>;
}

const styles = StyleSheet.create({ gradient:{flex:1},safe:{flex:1},container:{paddingHorizontal:20,paddingTop:8,paddingBottom:36},topRow:{flexDirection:'row',alignItems:'center',gap:12},backButton:{width:44,height:44,borderRadius:22,alignItems:'center',justifyContent:'center',backgroundColor:theme.colors.glassPillBg,borderWidth:1,borderColor:theme.colors.glassPillBorder},hero:{marginTop:30,marginBottom:20},kicker:{fontFamily:theme.fonts.body,fontSize:10,letterSpacing:1.2,color:theme.colors.champagneText},title:{fontFamily:theme.fonts.heading,fontSize:30,lineHeight:37,color:theme.colors.textOnDark,marginTop:7},subtitle:{fontFamily:theme.fonts.body,fontSize:14,lineHeight:21,color:theme.colors.textOnDarkMuted,marginTop:8},card:{borderRadius:20,borderWidth:1,borderColor:theme.colors.glassCardBorder,backgroundColor:theme.colors.glassCardBg,padding:18,overflow:'hidden'},label:{fontFamily:theme.fonts.body,fontSize:10,letterSpacing:1.1,color:theme.colors.champagneText,marginBottom:8},secondLabel:{marginTop:18},input:{minHeight:52,borderRadius:16,borderWidth:1,borderColor:theme.colors.glassPillBorder,backgroundColor:theme.colors.glassPillBg,paddingHorizontal:14,paddingVertical:13,color:theme.colors.textOnDark,fontFamily:theme.fonts.body,fontSize:15},button:{marginTop:22,borderRadius:18,backgroundColor:theme.colors.lavenderPurple,paddingVertical:16,alignItems:'center'},buttonPressed:{opacity:.75},buttonText:{fontFamily:theme.fonts.body,fontSize:15,color:theme.colors.textOnDark},error:{fontFamily:theme.fonts.body,fontSize:12,lineHeight:18,color:theme.colors.salmonPeach,marginTop:12},saved:{fontFamily:theme.fonts.body,fontSize:12,lineHeight:18,color:theme.colors.champagneText,marginTop:12} });
