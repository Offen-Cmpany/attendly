import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Chip, Eyebrow } from '../../src/components/atoms';
import { colors, fonts, radius, space, hairline } from '../../src/theme';
import { dbConfigured, decideLeave, Leave, LeaveStatus, LeaveType, listLeaves } from '../../src/lib/db';
import { useAuth } from '../../src/lib/auth';

const FILTERS = ['Pending', 'Duty', 'Medical', 'Personal', 'History'] as const;
type Filter = typeof FILTERS[number];

const MOCK: Leave[] = [
  { id: '1', userId: 'u1', userName: 'Aravind R',  reg: 'CSE/22/041', type: 'duty',     reason: 'Hackstorm 2026 representation', fromDate: '2026-04-19', toDate: '2026-04-19', status: 'pending' },
  { id: '2', userId: 'u2', userName: 'Lakshmi M',  reg: 'CSE/22/063', type: 'medical',  reason: 'Fever, advised rest 2 days', fromDate: '2026-04-21', toDate: '2026-04-22', status: 'pending' },
  { id: '3', userId: 'u3', userName: 'Sreehari V', reg: 'CSE/22/078', type: 'personal', reason: 'Family function', fromDate: '2026-04-23', toDate: '2026-04-23', status: 'pending' },
];

export default function Approvals() {
  const insets = useSafeAreaInsets();
  const { user, role } = useAuth();
  const [active, setActive] = useState<Filter>('Pending');
  const [items, setItems] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    if (!dbConfigured()) { setItems(MOCK); setLoading(false); return; }
    try {
      const status: LeaveStatus | undefined = active === 'History' ? undefined : active === 'Pending' ? 'pending' : 'pending';
      const list = await listLeaves({ status });
      setItems(list);
    } catch (e: any) {
      Alert.alert('Could not load leaves', e?.message ?? 'Check Appwrite config.');
      setItems([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [active]);

  const visible = items.filter(a => {
    if (active === 'Pending' || active === 'History') return true;
    return a.type === (active.toLowerCase() as LeaveType);
  });

  const decide = async (id: string, to: 'approved' | 'declined') => {
    if (!dbConfigured()) { setItems(prev => prev.filter(i => i.id !== id)); return; }
    try { await decideLeave(id, to, user?.id ?? ''); await load(); }
    catch (e: any) { Alert.alert('Failed', e?.message ?? 'Try again'); }
  };

  const headerLabel = role === 'admin' ? 'All Requests' : 'Student Leaves';

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceAlt }}>
      <View style={{ paddingTop: insets.top + space.md, paddingHorizontal: space.lg, paddingBottom: space.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Eyebrow>{role === 'admin' ? 'Administration' : 'Faculty'} · CSE</Eyebrow>
            <Text style={styles.h1}>{headerLabel}</Text>
          </View>
          <View style={styles.pendingPill}><Text style={styles.pendingText}>{visible.length} pending</Text></View>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: space.lg, gap: space.sm, paddingVertical: space.sm }}>
        {FILTERS.map(f => {
          const on = active === f;
          return (
            <Pressable key={f} onPress={() => setActive(f)} style={[styles.pill, on && styles.pillOn]}>
              <Text style={[styles.pillText, on && { color: '#fff' }]}>{f}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={colors.blue600} style={{ marginTop: space.xl }} />
      ) : visible.length === 0 ? (
        <Text style={styles.empty}>Nothing pending. ✦</Text>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.md }}>
          {visible.map(a => (
            <Card key={a.id} style={{ gap: space.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{(a.userName ?? '??').split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase()}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{a.userName}</Text>
                  {a.reg && <Text style={styles.reg}>{a.reg}</Text>}
                </View>
                <Chip label={a.type[0].toUpperCase() + a.type.slice(1)} variant={a.type === 'duty' ? 'duty' : a.type === 'medical' ? 'warn' : 'neutral'} />
              </View>
              <Text style={styles.reason}>{a.reason}</Text>
              <Text style={styles.meta}>{fmt(a.fromDate)}{a.fromDate !== a.toDate ? ` – ${fmt(a.toDate)}` : ''}</Text>
              {active !== 'History' ? (
                <View style={{ flexDirection: 'row', gap: space.sm }}>
                  <Button title="Approve" onPress={() => decide(a.id, 'approved')} style={{ flex: 2 }} />
                  <Button title="Decline" variant="secondary" onPress={() => decide(a.id, 'declined')} style={{ flex: 1 }} />
                </View>
              ) : (
                <Chip label={a.status} variant={a.status === 'approved' ? 'safe' : 'risk'} dot />
              )}
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function fmt(iso: string) {
  try { return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' }); }
  catch { return iso; }
}

const styles = StyleSheet.create({
  h1: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.ink900, marginTop: space.xs },
  pendingPill: { backgroundColor: colors.coral400, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  pendingText: { color: '#fff', fontFamily: fonts.sansMedium, fontSize: 12 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: '#fff', borderWidth: hairline, borderColor: colors.border },
  pillOn: { backgroundColor: colors.ink900, borderColor: colors.ink900 },
  pillText: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.ink700 },
  avatar: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.blue600, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontFamily: fonts.monoMedium, fontSize: 12 },
  name: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink900 },
  reg: { fontFamily: fonts.mono, fontSize: 11, color: colors.ink500, marginTop: 2 },
  reason: { fontFamily: fonts.sans, fontSize: 13, color: colors.ink700 },
  meta: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500 },
  empty: { textAlign: 'center', marginTop: space.xl, fontFamily: fonts.sans, color: colors.ink500 },
});
