import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { Manjari_400Regular, Manjari_700Bold } from '@expo-google-fonts/manjari';
import { JetBrainsMono_400Regular, JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import { AuthProvider, useAuth } from '../src/lib/auth';
import { supabase } from '../src/lib/supabase';
import { colors } from '../src/theme';
import * as Linking from 'expo-linking';

function Gate() {
  const { user, profile, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [minSplashDone, setMinSplashDone] = React.useState(false);

  useEffect(() => {
    // Hold splash for at least 1.5 seconds
    const t = setTimeout(() => setMinSplashDone(true), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleUrl = async (url: string | null) => {
      if (!url) return;
      
      // Implicit flow: access_token in hash
      if (url.includes('#access_token=')) {
        const hash = url.split('#')[1];
        const params = new URLSearchParams(hash);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token });
        }
      }
      
      // PKCE flow: code in query params
      if (url.includes('?code=') || url.includes('&code=')) {
        const query = url.split('?')[1]?.split('#')[0];
        const params = new URLSearchParams(query);
        const code = params.get('code');
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        }
      }
    };

    Linking.getInitialURL().then(handleUrl);
    const sub = Linking.addEventListener('url', (e) => handleUrl(e.url));
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (loading || !minSplashDone) return;
    const inAuth = segments[0] === '(auth)';
    const isPending = profile?.designation === 'pending_staff';
    const inPendingScreen = segments[0] === 'pending';

    if (!user && !inAuth) {
      router.replace('/(auth)/login');
    } else if (user && isPending && !inPendingScreen) {
      router.replace('/pending');
    } else if (user && !isPending && (inAuth || inPendingScreen)) {
      router.replace('/(tabs)');
    }
  }, [user, profile, loading, segments, minSplashDone]);

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
