import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Eyebrow } from '../../src/components/atoms';
import { useAuth, isCollegeEmail, isStudentEmail } from '../../src/lib/auth';
import { colors, fonts, radius, space, hairline } from '../../src/theme';

export default function Signup() {
  const { signUp } = useAuth();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const submit = async () => {
    setErrorMsg('');
    const trimmedEmail = email.trim();
    if (!isCollegeEmail(trimmedEmail)) {
      setErrorMsg('Please use your college email (@cekottarakkara.ac.in)');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Use at least 8 characters.');
      return;
    }
    setBusy(true);
    try {
      await signUp(name.trim(), trimmedEmail, password);
      Alert.alert('Account Created', 'Please check your inbox and click the confirmation link to sign in.');
      import('expo-router').then(r => r.router.replace('/(auth)/login'));
    }
    catch (e: any) { setErrorMsg(e?.message ?? 'Try again'); }
    finally { setBusy(false); }
  };

  const emailHint = email.trim().length > 3
    ? isStudentEmail(email.trim())
      ? '🎓 Student account detected'
      : isCollegeEmail(email.trim())
        ? '👤 Staff account — you\'ll pick your role next'
        : ''
    : '';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={[styles.wrap, { paddingTop: insets.top + space.xxl }]}>
        <View style={styles.inner}>
          <Eyebrow>Attendly</Eyebrow>
          <Text style={styles.h1}>Create your account</Text>
          <Text style={styles.sub}>Set up your profile to start tracking attendance.</Text>

          <View style={{ height: space.xl }} />
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.ink300} />
          <View style={{ height: space.md }} />
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@cekottarakkara.ac.in" placeholderTextColor={colors.ink300} />
          {emailHint ? <Text style={styles.hint}>{emailHint}</Text> : null}
          <View style={{ height: space.md }} />
          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="At least 8 characters" placeholderTextColor={colors.ink300} />
          <View style={{ height: space.xl }} />

          {errorMsg ? (
            <Text style={{ color: colors.coral600, fontFamily: fonts.sansMedium, marginBottom: space.md, textAlign: 'center' }}>
              {errorMsg}
            </Text>
          ) : null}

          <Button title={busy ? 'Creating account…' : 'Create account'} onPress={submit} />
          <View style={{ height: space.lg }} />
          <Text style={styles.footer}>
            Already have an account?{' '}
            <Link href="/(auth)/login" style={{ color: colors.blue600, fontFamily: fonts.sansMedium }}>
              Sign in
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
  hint: { fontSize: 12, fontFamily: fonts.sans, color: colors.blue600, marginTop: 4 },
});
