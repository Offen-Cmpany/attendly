import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Eyebrow } from '../src/components/atoms';
import { colors, fonts, radius, space, hairline } from '../src/theme';
import { useAuth } from '../src/lib/auth';
import { createLeave, dbConfigured, LeaveType } from '../src/lib/db';

type Reason = 'medical' | 'duty' | 'personal' | 'other';
const reasons: { id: Reason; label: string }[] = [
  { id: 'medical', label: 'Medical' },
  { id: 'duty', label: 'Duty leave' },
  { id: 'personal', label: 'Personal' },
  { id: 'other', label: 'Other' },
];

export default function LeaveRequest() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const [reason, setReason] = useState<Reason>('duty');
  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!note.trim()) return Alert.alert('Note', 'Add a short reason for the approver.');
    if (!dbConfigured() || !user) { router.back(); return; }
    setBusy(true);
    try {
      await createLeave({
        userId: user.id,
        userName: user.name,
        reg: profile?.reg,
        type: reason as LeaveType,
        reason: note.trim(),
        fromDate: new Date(from).toISOString(),
        toDate: new Date(to).toISOString(),
      });
      router.back();
    } catch (e: any) {
      Alert.alert('Could not submit', e?.message ?? 'Try again');
    } finally { setBusy(false); }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surfaceAlt }} contentContainerStyle={{ paddingTop: insets.top + space.md, paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={() => router.back()}><Text style={styles.close}>✕</Text></Pressable>
        <Text style={styles.step}>Step 1 of 2</Text>
      </View>

      <View>
        <Eyebrow>Leaves</Eyebrow>
        <Text style={styles.h1}>Request leave</Text>
        <Text style={styles.sub}>We'll notify you when decided.</Text>
      </View>

      <View>
        <Text style={styles.label}>Reason</Text>
        <View style={styles.grid}>
          {reasons.map(r => {
            const active = reason === r.id;
            return (
              <Pressable key={r.id} onPress={() => setReason(r.id)} style={[styles.reason, active && styles.reasonActive]}>
                <Text style={[styles.reasonText, active && { color: colors.blue900, fontFamily: fonts.sansMedium }]}>{r.label}</Text>
                {active && <Text style={styles.check}>✓</Text>}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: space.md }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>From</Text>
          <TextInput style={styles.input} value={from} onChangeText={setFrom} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>To</Text>
          <TextInput style={styles.input} value={to} onChangeText={setTo} />
        </View>
      </View>

      <View>
        <Text style={styles.label}>Note</Text>
        <TextInput style={[styles.input, styles.textarea]} multiline value={note} onChangeText={setNote} placeholder="Add context for the approver…" placeholderTextColor={colors.ink300} />
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>
          {reason === 'duty'
            ? "Duty leave doesn't count absent. You'll stay at 82%."
            : 'This will count as an absence. Estimated impact: −2%.'}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: space.md }}>
        <Button title="Save draft" variant="ghost" style={{ flex: 1 }} />
        <Button title={busy ? 'Submitting…' : 'Submit'} onPress={submit} style={{ flex: 2 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  close: { fontSize: 18, color: colors.ink700 },
  step: { fontFamily: fonts.mono, fontSize: 11, color: colors.ink500 },
  h1: { fontFamily: fonts.displayBold, fontSize: 26, color: colors.ink900, marginTop: space.xs },
  sub: { fontFamily: fonts.sans, fontSize: 13, color: colors.ink500, marginTop: 2 },
  label: { fontSize: 12, color: colors.ink500, marginBottom: 6, fontFamily: fonts.sans },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  reason: {
    width: '48%', paddingVertical: space.md, paddingHorizontal: space.md,
    borderRadius: radius.md, borderWidth: hairline, borderColor: colors.ink200, backgroundColor: '#fff',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  reasonActive: { backgroundColor: colors.blue50, borderColor: colors.blue400 },
  reasonText: { fontFamily: fonts.sans, fontSize: 13, color: colors.ink700 },
  check: { color: colors.blue600, fontFamily: fonts.sansMedium },
  input: {
    height: 40, paddingHorizontal: 12, borderWidth: hairline, borderColor: colors.ink200,
    borderRadius: radius.sm, backgroundColor: '#fff', color: colors.ink900,
    fontFamily: fonts.sans, fontSize: 14,
  },
  textarea: { height: 96, paddingTop: 10, textAlignVertical: 'top' },
  info: { backgroundColor: colors.blue50, borderRadius: radius.lg, padding: space.lg, borderLeftWidth: 3, borderLeftColor: colors.blue600 },
  infoText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.blue900 },
});
