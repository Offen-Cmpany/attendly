import React from 'react';
import { View, Text, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Eyebrow } from '../src/components/atoms';
import { useAuth } from '../src/lib/auth';
import { colors, fonts, space } from '../src/theme';

export default function Pending() {
  const { signOut, user } = useAuth();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.wrap}>
        <View style={styles.inner}>
          <Eyebrow>Account Created</Eyebrow>
          <Text style={styles.h1}>Pending Approval</Text>
          <Text style={styles.sub}>
            Hi {user?.name?.split(' ')[0] ?? 'there'}, your account has been created successfully! However, since you signed up with a staff email, an Administrator must approve your account and assign your role before you can access the dashboard.
          </Text>
          
          <View style={{ height: space.xl }} />
          
          <View style={styles.card}>
            <Text style={{ fontSize: 40, marginBottom: space.sm }}>⏳</Text>
            <Text style={styles.cardTitle}>Please wait</Text>
            <Text style={styles.cardText}>
              Contact your system administrator or Head of Department to expedite the approval process. Once approved, just open the app again!
            </Text>
          </View>
          
          <View style={{ height: space.xxl }} />
          <Button title="Sign out" variant="secondary" onPress={signOut} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  wrap: { flex: 1, paddingHorizontal: space.xl, justifyContent: 'center' },
  inner: { width: '100%', maxWidth: 420, alignSelf: 'center' },
  h1: { fontSize: 28, fontFamily: fonts.displayBold, color: colors.ink900, marginTop: space.sm },
  sub: { fontSize: 15, fontFamily: fonts.sans, color: colors.ink500, marginTop: space.md, lineHeight: 22 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: space.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontFamily: fonts.sansMedium, color: colors.ink900, marginBottom: space.xs },
  cardText: { fontSize: 14, fontFamily: fonts.sans, color: colors.ink500, textAlign: 'center', lineHeight: 20 },
});
