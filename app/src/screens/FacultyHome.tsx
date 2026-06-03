import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Chip, Eyebrow } from '../components/atoms';
import { useAuth } from '../lib/auth';
import { colors, fonts, radius, space, hairline } from '../theme';

const schedule = [
  { time: '09:00', name: 'Operating Systems', code: 'CS303', room: 'CS-201', state: 'now' as const },
  { time: '11:00', name: 'Compiler Design', code: 'CS305', room: 'CS-204', state: 'later' as const },
  { time: '14:00', name: 'OS Lab', code: 'CS307', room: 'CS-Lab 3', state: 'later' as const },
  { time: '08:00', name: 'Algorithms', code: 'CS301', room: 'CS-201', state: 'done' as const, marked: '52/58' },
];

export default function FacultyHome() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const initials = (user?.name ?? 'FA').split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surfaceAlt }} contentContainerStyle={{ paddingTop: insets.top + space.lg, paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
        <View style={{ flex: 1 }}>
          <Eyebrow>Sat 19 Apr</Eyebrow>
          <Text style={styles.greeting}>Good morning, {user?.name?.split(' ')[0] ?? 'faculty'}</Text>
        </View>
      </View>

      <View style={styles.hero}>
        <Eyebrow>Pending</Eyebrow>
        <Text style={styles.heroH1}>3 classes need marking</Text>
        <Text style={styles.heroSub}>Operating Systems is live now.</Text>
        <View style={{ height: space.md }} />
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <Link href="/mark/CS303" asChild>
            <Button title="Mark now" variant="accent" style={{ flex: 1 }} />
          </Link>
          <Button title="All present (1 tap)" variant="ghost" style={{ flex: 1 }} />
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: space.md }}>
        <Link href="/approvals" asChild>
          <Card style={{ flex: 1 }}>
            <Eyebrow>Leave queue</Eyebrow>
            <Text style={styles.tileBig}>5</Text>
            <Text style={styles.tileSub}>pending</Text>
          </Card>
        </Link>
        <Link href={{ pathname: '/class/[id]', params: { id: 'CS303' } }} asChild>
          <Card style={{ flex: 1 }}>
            <Eyebrow>At risk</Eyebrow>
            <Text style={[styles.tileBig, { color: colors.coral400 }]}>12</Text>
            <Text style={styles.tileSub}>below 75%</Text>
          </Card>
        </Link>
      </View>

      <View>
        <Eyebrow>Teaching today</Eyebrow>
        <View style={{ height: space.sm }} />
        <Card style={{ gap: space.md }}>
          {schedule.map((c, i) => (
            <Link key={i} href={c.state === 'done' ? { pathname: '/class/[id]', params: { id: c.code } } : { pathname: '/mark/[id]', params: { id: c.code } }} asChild>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                <Text style={styles.time}>{c.time}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cName}>{c.name}</Text>
                  <Text style={styles.cMeta}>{c.code} · {c.room}</Text>
                </View>
                {c.state === 'done' && <Chip label={`Marked · ${c.marked}`} variant="safe" dot />}
                {c.state === 'now' && <Chip label="Mark now" variant="duty" dot />}
                {c.state === 'later' && <Text style={styles.later}>Later</Text>}
              </View>
            </Link>
          ))}
        </Card>
      </View>

      <Link href="/dashboard" asChild>
        <Button title="Open department dashboard" variant="secondary" />
      </Link>

      <View style={styles.dutyBanner}>
        <Eyebrow>Community duty leave</Eyebrow>
        <Text style={styles.dutyTitle}>3 duty leaves for Hackstorm 2026</Text>
        <Text style={styles.dutySub}>IEEE · Sat 19 Apr</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 44, height: 44, borderRadius: radius.lg, backgroundColor: colors.blue600, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontFamily: fonts.monoMedium, fontSize: 14 },
  greeting: { fontSize: 22, fontFamily: fonts.displayBold, color: colors.ink900, marginTop: space.xs },
  hero: { backgroundColor: colors.blue900, borderRadius: radius.xl, padding: space.lg },
  heroH1: { fontSize: 22, fontFamily: fonts.displayBold, color: '#fff', marginTop: space.xs },
  heroSub: { fontSize: 13, fontFamily: fonts.sans, color: colors.blue100, marginTop: space.xs },
  tileBig: { fontSize: 36, fontFamily: fonts.displayBold, color: colors.ink900, marginTop: space.sm },
  tileSub: { fontSize: 12, fontFamily: fonts.sans, color: colors.ink500 },
  time: { fontSize: 13, fontFamily: fonts.monoMedium, color: colors.ink700, width: 48 },
  cName: { fontSize: 14, fontFamily: fonts.sansMedium, color: colors.ink900 },
  cMeta: { fontSize: 12, fontFamily: fonts.sans, color: colors.ink500, marginTop: 2 },
  later: { fontSize: 12, fontFamily: fonts.sans, color: colors.ink300 },
  dutyBanner: { backgroundColor: colors.coral50, borderRadius: radius.lg, padding: space.lg, borderLeftWidth: 3, borderLeftColor: colors.coral400 },
  dutyTitle: { fontSize: 14, fontFamily: fonts.sansMedium, color: colors.coral900, marginTop: space.xs },
  dutySub: { fontSize: 12, fontFamily: fonts.sans, color: colors.coral800, marginTop: 2 },
});
