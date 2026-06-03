import 'react-native-url-polyfill/auto';
import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { Manjari_400Regular, Manjari_700Bold } from '@expo-google-fonts/manjari';
import { JetBrainsMono_400Regular, JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import { AuthProvider, useAuth } from '../src/lib/auth';
import { colors } from '../src/theme';

function Gate() {
  const { user, loading, needsOnboarding } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [minSplashDone, setMinSplashDone] = React.useState(false);

  useEffect(() => {
    // Hold splash for at least 1.5 seconds
    const t = setTimeout(() => setMinSplashDone(true), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loading || !minSplashDone) return;
    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!user && !inAuth) {
      router.replace('/(auth)/login');
    } else if (user && needsOnboarding && !inOnboarding) {
      router.replace('/onboarding');
    } else if (user && !needsOnboarding && (inAuth || inOnboarding)) {
      router.replace('/(tabs)');
    }
  }, [user, loading, needsOnboarding, segments, minSplashDone]);

  if (loading || !minSplashDone) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.blue600 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: 'Manjari_700Bold', fontSize: 48, color: '#fff' }}>Attendly</Text>
        </View>
        <View style={{ paddingBottom: 40, alignItems: 'center' }}>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>by, offen.company</Text>
        </View>
      </View>
    );
  }
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.surfaceAlt } }} />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular, Inter_500Medium,
    Manjari_400Regular, Manjari_700Bold,
    JetBrainsMono_400Regular, JetBrainsMono_500Medium,
  });
  if (!fontsLoaded) return null;
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Gate />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
