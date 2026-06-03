import React from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Chip, Eyebrow, Divider, Progress } from '../../src/components/atoms';
import { colors, fonts, radius, space } from '../../src/theme';
import { status } from '../../src/lib/attendance';

const atRisk = [
  { init: 'AR', name: 'Aravind R', reg: 'CSE/22/041', pct: 68 },
  { init: 'LM', name: 'Lakshmi M', reg: 'CSE/22/063', pct: 71 },
  { init: 'SV', name: 'Sreehari V', reg: 'CSE/22/078', pct: 73 },
];

export default function ClassDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const avg = 79;
  const st = status(avg);

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceAlt }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + space.md, paddingHorizontal: space.lg, paddingBottom: 120, gap: space.lg }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={styles.back}>← Back</Text></Pressable>

        <View>
          <Text style={styles.code}>{id} · S6 · 58 students</Text>
          <Text style={styles.h1}>Operating Systems</Text>
        </View>

        <Card style={{ borderRadius: radius.xl }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.heroPct}>{avg}%</Text>
            <View style={{ flex: 1 }} />
            <Chip label={st === 'safe' ? 'Safe' : st === 'warn' ? 'Watch' : 'Risk'} variant={st} dot />
          </View>
          <Text style={styles.heroSub}>1624/2054 hrs marked</Text>
          <View style={{ height: space.md }} />
          <Progress value={avg} color={st === 'risk' ? colors.coral400 : st === 'warn' ? '#E2A53A' : colors.blue600} />
        </Card>

        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <DistTile label="Safe" value={34} color={colors.safeFg} />
          <DistTile label="Watch" value={12} color="#E2A53A" />
          <DistTile label="Risk" value={12} color={colors.coral400} />
        </View>

        <View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.sm }}>
            <Eyebrow>At risk</Eyebrow>
            <Text style={styles.count}>12</Text>
          </View>
          <View style={{ height: space.sm }} />
          <Card>
            {atRisk.map((s, i) => (
              <View key={s.reg}>
                <View style={styles.row}>
                  <View style={styles.avatar}><Text style={styles.avatarText}>{s.init}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{s.name}</Text>
                    <Text style={styles.reg}>{s.reg}</Text>
                  </View>
                  <Chip label={`${s.pct}%`} variant="risk" dot />
                </View>
                {i < atRisk.length - 1 && <Divider style={{ marginVertical: space.sm }} />}
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
        <Button title="Message class" variant="secondary" style={{ flex: 1 }} />
        <Link href={{ pathname: '/mark/[id]', params: { id: String(id) } }} asChild>
          <Button title="Mark now" style={{ flex: 1 }} />
        </Link>
      </View>
    </View>
  );
}

function DistTile({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: color }} />
        <Text style={styles.distLabel}>{label}</Text>
      </View>
      <Text style={styles.distValue}>{value}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  back: { fontFamily: fonts.sansMedium, color: colors.ink500, fontSize: 13 },
  code: { fontFamily: fonts.mono, fontSize: 11, color: colors.ink500, letterSpacing: 0.4 },
  h1: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.ink900, marginTop: 4 },
  heroPct: { fontFamily: fonts.monoMedium, fontSize: 44, color: colors.ink900 },
  heroSub: { fontFamily: fonts.mono, fontSize: 12, color: colors.ink500, marginTop: 2 },
  count: { fontFamily: fonts.mono, fontSize: 11, color: colors.ink500 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  avatar: { width: 32, height: 32, borderRadius: radius.md, backgroundColor: colors.coral400, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontFamily: fonts.monoMedium, fontSize: 11 },
  name: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink900 },
  reg: { fontFamily: fonts.mono, fontSize: 11, color: colors.ink500, marginTop: 2 },
  distLabel: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500 },
  distValue: { fontFamily: fonts.displayBold, fontSize: 28, color: colors.ink900, marginTop: space.sm },
  footer: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: colors.border,
    paddingHorizontal: space.lg, paddingTop: space.md, flexDirection: 'row', gap: space.md,
  },
});
