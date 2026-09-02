import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Italiana_400Regular } from '@expo-google-fonts/italiana';
import { Marcellus_400Regular } from '@expo-google-fonts/marcellus';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../context/AuthContext';
import { VisualEnvironmentProvider } from '../context/VisualEnvironmentContext';
import { theme } from '../theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Italiana_400Regular,
    Marcellus_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <VisualEnvironmentProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.colors.cream },
            }}
          />
        </VisualEnvironmentProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
