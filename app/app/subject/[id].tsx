import React from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Chip, Divider, Eyebrow, Progress } from '../../src/components/atoms';
import { colors, fonts, radius, space, hairline } from '../../src/theme';
import { classesNeeded, skipsAllowed, status } from '../../src/lib/attendance';

const MOCK = {
  code: 'CS21B',
  name: 'Data Structures',
  faculty: 'Dr. Anjali Menon',
  credits: 4,
  attended: 42,
  total: 54,
  trend: [10, 15, 12, 18, 22, 28, 32, 26],
  log: [
    { date: 'Mon 14 Apr', time: '09:00', status: 'present' as const },
    { date: 'Fri 11 Apr', time: '09:00', status: 'present' as const },
    { date: 'Wed 09 Apr', time: '09:00', status: 'absent' as const },
    { date: 'Mon 07 Apr', time: '09:00', status: 'duty' as const },
    { date: 'Fri 04 Apr', time: '09:00', status: 'present' as const },
    { date: 'Wed 02 Apr', time: '09:00', status: 'present' as const },
  ],
};

export default function SubjectDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const s = MOCK; // wire to Appwrite later, keyed by `id`
  const pct = Math.round((s.attended / s.total) * 100);
  const st = status(pct);
  const skips = skipsAllowed(s.attended, s.total, 0.75);
  const need = classesNeeded(s.attended, s.total, 0.8);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surfaceAlt }} contentContainerStyle={{ paddingTop: insets.top + space.md, paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.lg }}>
      <Pressable onPress={() => router.back()} hitSlop={10}><Text style={styles.back}>← Back</Text></Pressable>

      <View>
        <Text style={styles.code}>{s.code}</Text>
        <Text style={styles.h1}>{s.name}</Text>
        <Text style={styles.meta}>{s.faculty} · {s.credits} credits</Text>
      </View>

      <Card style={{ borderRadius: radius.xl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.heroPct}>{pct}%</Text>
          <View style={{ flex: 1 }} />
          <Chip label={st === 'safe' ? 'Safe' : st === 'warn' ? 'Watch' : 'Risk'} variant={st} dot />
        </View>
        <Text style={styles.heroSub}>{s.attended}/{s.total} hrs</Text>
        <View style={{ height: space.md }} />
        <Progress value={pct} color={st === 'risk' ? colors.coral400 : st === 'warn' ? '#E2A53A' : colors.blue600} />
      </Card>

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>
          {need > 0 ? `Attend the next ${need} classes to reach 80%.` : `You can skip ${skips} more before crossing 75%.`}
        </Text>
        <Text style={styles.bannerSub}>{skips <= 1 ? 'Skip one more = Risk' : `Skips remaining: ${skips}`}</Text>
      </View>

      <View>
        <Eyebrow>Trend</Eyebrow>
        <View style={{ height: space.sm }} />
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 6 }}>
            {s.trend.map((v, i) => (
              <View key={i} style={{ flex: 1, height: `${(v / 50) * 100}%`, backgroundColor: colors.blue400, borderRadius: 4 }} />
            ))}
          </View>
          <Text style={styles.trendFoot}>−3% vs mid-sem</Text>
        </Card>
      </View>

      <View>
        <Eyebrow>Attendance log</Eyebrow>
        <View style={{ height: space.sm }} />
        <Card>
          {s.log.map((row, i) => (
            <View key={i}>
              <View style={styles.logRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.logDate}>{row.date}</Text>
                  <Text style={styles.logTime}>{row.time}</Text>
                </View>
                <Chip
                  label={row.status === 'present' ? 'Present' : row.status === 'absent' ? 'Absent' : 'Duty'}
                  variant={row.status === 'present' ? 'safe' : row.status === 'absent' ? 'risk' : 'duty'}
                  dot
                />
              </View>
              {i < s.log.length - 1 && <Divider style={{ marginVertical: space.sm }} />}
            </View>
          ))}
        </Card>
      </View>

      <Link href="/leave" asChild>
        <Button title="Request duty leave" variant="accent" />
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  back: { fontFamily: fonts.sansMedium, color: colors.ink500, fontSize: 13 },
  code: { fontFamily: fonts.monoMedium, fontSize: 11, color: colors.ink500, letterSpacing: 0.4 },
  h1: { fontFamily: fonts.displayBold, fontSize: 26, color: colors.ink900, marginTop: 4 },
  meta: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 2 },
  heroPct: { fontFamily: fonts.monoMedium, fontSize: 44, color: colors.ink900 },
  heroSub: { fontFamily: fonts.mono, fontSize: 12, color: colors.ink500, marginTop: 2 },
  banner: { backgroundColor: colors.warnBg, borderRadius: radius.lg, padding: space.lg, borderLeftWidth: 3, borderLeftColor: colors.warnFg },
  bannerTitle: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.warnFg },
  bannerSub: { fontFamily: fonts.sans, fontSize: 12, color: colors.warnFg, marginTop: 4, opacity: 0.8 },
  trendFoot: { marginTop: space.sm, fontFamily: fonts.mono, fontSize: 11, color: colors.ink500 },
  logRow: { flexDirection: 'row', alignItems: 'center' },
  logDate: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink900 },
  logTime: { fontFamily: fonts.mono, fontSize: 11, color: colors.ink500, marginTop: 2 },
});
