import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Eyebrow } from '../../src/components/atoms';
import { useAuth, isCollegeEmail } from '../../src/lib/auth';
import { colors, fonts, radius, space, hairline } from '../../src/theme';

export default function Login() {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const submit = async () => {
    setErrorMsg('');
    const trimmed = email.trim();
    if (!isCollegeEmail(trimmed)) {
      setErrorMsg('Please use your college email (@cek.ac.in or @cekottarakkara.ac.in)');
      return;
    }
    
    console.log('Login attempt started for:', trimmed);
    setBusy(true);
    try { 
      await Promise.race([
        signIn(trimmed, password),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Login Request Timed Out (Supabase is not responding)')), 10000))
      ]);
      console.log('Login successful in auth context!');
    } catch (e: any) { 
      console.error('Login failed error object:', e);
      setErrorMsg(e?.message || 'Try again'); 
    } finally { 
      console.log('Setting busy to false');
      setBusy(false); 
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={[styles.wrap, { paddingTop: insets.top + space.xxl }]}>
        <View style={styles.inner}>
          <Eyebrow>Attendly</Eyebrow>
          <Text style={styles.h1}>Welcome back</Text>
          <Text style={styles.sub}>Sign in to track attendance, leaves, and more.</Text>

          <View style={{ height: space.xl }} />
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@cekottarakkara.ac.in"
            placeholderTextColor={colors.ink300}
          />
          <View style={{ height: space.md }} />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={colors.ink300}
          />
          <View style={{ height: space.xl }} />

          {errorMsg ? (
            <Text style={{ color: colors.coral600, fontFamily: fonts.sansMedium, marginBottom: space.md, textAlign: 'center' }}>
              {errorMsg}
            </Text>
          ) : null}

          <Button title={busy ? 'Signing in…' : 'Sign in'} onPress={submit} />
          <View style={{ height: space.lg }} />
          <Text style={styles.footer}>
            New here?{' '}
            <Link href="/(auth)/signup" style={{ color: colors.blue600, fontFamily: fonts.sansMedium }}>
              Create an account
            </Link>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.surfaceAlt, paddingHorizontal: space.xl },
  inner: { width: '100%', maxWidth: 420, alignSelf: 'center' },
  h1: { fontSize: 28, fontFamily: fonts.displayBold, color: colors.ink900, marginTop: space.sm },
  sub: { fontSize: 14, fontFamily: fonts.sans, color: colors.ink500, marginTop: space.xs },
  label: { fontSize: 12, color: colors.ink500, marginBottom: 6, fontFamily: fonts.sans },
  input: {
    height: 40, paddingHorizontal: 12, borderWidth: hairline, borderColor: colors.ink200,
    borderRadius: radius.sm, backgroundColor: '#fff', color: colors.ink900,
    fontFamily: fonts.sans, fontSize: 14,
  },
  footer: { textAlign: 'center', fontSize: 14, color: colors.ink500, fontFamily: fonts.sans },
});
