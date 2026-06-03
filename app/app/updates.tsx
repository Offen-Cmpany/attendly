import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Chip, Eyebrow } from '../src/components/atoms';
import { colors, fonts, radius, space, hairline } from '../src/theme';

type Kind = 'exam' | 'result' | 'holiday' | 'circular';
const filters: ('All' | Kind)[] = ['All', 'exam', 'result', 'holiday', 'circular'];
const kindVariant: Record<Kind, 'risk' | 'safe' | 'streak' | 'duty'> = {
  exam: 'risk', result: 'safe', holiday: 'streak', circular: 'duty',
};

const items: { tag: string; kind: Kind; title: string; body: string; time: string; pinned?: boolean }[] = [
  { tag: 'KTU', kind: 'exam', title: 'S6 supply exam timetable released', body: 'Supply exam for S6 will commence on 28 Apr. Hall tickets from 24 Apr.', time: '2h', pinned: true },
  { tag: 'GCEK', kind: 'circular', title: 'Internal exam fee deadline', body: 'Pay internal exam fee on or before 22 Apr to avoid late fine.', time: '6h' },
  { tag: 'KTU', kind: 'result', title: 'S4 results published', body: 'Revaluation window opens 21 Apr.', time: '1d' },
  { tag: 'GCEK', kind: 'holiday', title: 'Holiday on 23 Apr', body: 'College closed for state festival. Labs operating per skeleton schedule.', time: '3d' },
];

export default function Updates() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [active, setActive] = useState<'All' | Kind>('All');
  const visible = items.filter(i => active === 'All' || i.kind === active);

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceAlt }}>
      <View style={{ paddingTop: insets.top + space.md, paddingHorizontal: space.lg, paddingBottom: space.sm }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={styles.back}>← Back</Text></Pressable>
        <Eyebrow>GCEK · KTU</Eyebrow>
        <Text style={styles.h1}>University updates</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: space.lg, gap: space.sm, paddingVertical: space.sm }}>
        {filters.map(f => {
          const on = active === f;
          return (
            <Pressable key={f} onPress={() => setActive(f)} style={[styles.pill, on && styles.pillOn]}>
              <Text style={[styles.pillText, on && { color: '#fff' }]}>{f === 'All' ? 'All' : f[0].toUpperCase() + f.slice(1)}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.md }}>
        {visible.map((it, i) => (
          <Card key={i}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <Chip label={it.tag} variant="neutral" />
              <Chip label={it.kind} variant={kindVariant[it.kind]} dot />
              <View style={{ flex: 1 }} />
              <Text style={styles.time}>{it.time}</Text>
              {it.pinned && <Text style={styles.pinned}>📌</Text>}
            </View>
            <Text style={styles.title}>{it.title}</Text>
            <Text style={styles.body}>{it.body}</Text>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { fontFamily: fonts.sansMedium, color: colors.ink500, fontSize: 13, marginBottom: space.sm },
  h1: { fontFamily: fonts.displayBold, fontSize: 26, color: colors.ink900, marginTop: space.xs },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: '#fff', borderWidth: hairline, borderColor: colors.border },
  pillOn: { backgroundColor: colors.ink900, borderColor: colors.ink900 },
  pillText: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.ink700 },
  time: { fontFamily: fonts.mono, fontSize: 11, color: colors.ink500 },
  pinned: { fontSize: 12, marginLeft: 4 },
  title: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink900, marginTop: space.sm },
  body: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 4, lineHeight: 17 },
});
