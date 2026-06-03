import React from 'react';
import { ScrollView, View, Text, TextInput, StyleSheet, useWindowDimensions, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Chip, Eyebrow, Divider, Progress } from '../components/atoms';
import { useAuth } from '../lib/auth';
import { colors, fonts, radius, space, hairline } from '../theme';
import { status } from '../lib/attendance';

const KPIS = [
  { label: 'Department average', value: '81%', delta: '+1.2', tone: 'safe' as const, sub: 'vs last week' },
  { label: 'At-risk students', value: '23', delta: '−5', tone: 'safe' as const, sub: 'below 75%' },
  { label: 'Pending leaves', value: '14', delta: '+3', tone: 'warn' as const, sub: 'oldest · 2d' },
  { label: 'Hours marked today', value: '112/128', delta: null, tone: 'neutral' as const, sub: '7 classes pending' },
];

const SEM_BARS = [
  { label: 'S1', pct: 86, n: 64 },
  { label: 'S2', pct: 82, n: 64 },
  { label: 'S3', pct: 78, n: 60 },
  { label: 'S4', pct: 74, n: 60 },
  { label: 'S5', pct: 80, n: 58 },
  { label: 'S6', pct: 79, n: 58 },
  { label: 'S7', pct: 84, n: 54 },
  { label: 'S8', pct: 88, n: 54 },
];

const LEAVES = [
  { name: 'Aravind R', reg: 'CSE/22/041', type: 'duty' as const, reason: 'Hackstorm 2026 representation', dates: 'Sat 19 Apr · IEEE', proof: true },
  { name: 'Lakshmi M', reg: 'CSE/22/063', type: 'medical' as const, reason: 'Fever, advised rest 2 days', dates: 'Mon 21 – Tue 22 Apr', proof: true },
  { name: 'Sreehari V', reg: 'CSE/22/078', type: 'personal' as const, reason: 'Family function', dates: 'Wed 23 Apr', proof: false },
];

const COHORT = [
  { init: 'AN', name: 'Ananya R', reg: 'CSE/22/012', pct: 68, trend: -4, critical: 'CS303 · CS305' },
  { init: 'FT', name: 'Fathima S', reg: 'CSE/22/027', pct: 71, trend: -2, critical: 'CS305' },
  { init: 'RH', name: 'Rohan K',   reg: 'CSE/22/036', pct: 73, trend: -1, critical: 'CS301' },
  { init: 'SN', name: 'Sneha V',   reg: 'CSE/22/049', pct: 74, trend: -3, critical: 'CS303 · CS307' },
];

const NAV = ['Dashboard', 'Classes', 'Mark attendance', 'Leave approvals', 'Reports', 'Communities'];

export default function HodDashboard() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const wide = width >= 1024;
  const tablet = width >= 768;

  const initials = (user?.name ?? 'HD').split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase();

  const main = (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surfaceAlt }} contentContainerStyle={{ padding: space.xl, gap: space.lg, paddingTop: insets.top + space.lg }}>
      <View style={{ flexDirection: tablet ? 'row' : 'column', alignItems: tablet ? 'flex-end' : 'flex-start', gap: space.md }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>Tuesday, 14 April 2026 · Week 14</Text>
          <Text style={styles.h1}>Department dashboard</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
          <TextInput style={[styles.search, { width: tablet ? 260 : '100%' }]} placeholder="Search student, register number…" placeholderTextColor={colors.ink300} />
          <Button title="Export report" />
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
        {KPIS.map(k => (
          <Card key={k.label} style={{ flex: 1, minWidth: tablet ? 180 : '46%' }}>
            <Text style={styles.kpiLabel}>{k.label}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.sm, marginTop: space.sm }}>
              <Text style={styles.kpiValue}>{k.value}</Text>
              {k.delta && (
                <Text style={[styles.kpiDelta, { color: k.tone === 'safe' ? colors.safeFg : k.tone === 'warn' ? colors.warnFg : colors.ink500 }]}>
                  {k.delta}
                </Text>
              )}
            </View>
            <Text style={styles.kpiSub}>{k.sub}</Text>
          </Card>
        ))}
      </View>

      <View style={{ flexDirection: tablet ? 'row' : 'column', gap: space.lg }}>
        <Card style={{ flex: 1.6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Attendance by semester</Text>
              <Text style={styles.cardSub}>Computer Science · running average</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {['Week', 'Month', 'Semester'].map((t, i) => (
                <View key={t} style={[styles.toggle, i === 1 && styles.toggleOn]}>
                  <Text style={[styles.toggleText, i === 1 && { color: '#fff' }]}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={{ height: space.lg }} />
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 160, gap: 10 }}>
            {SEM_BARS.map(b => {
              const st = status(b.pct);
              const c = st === 'risk' ? colors.coral400 : st === 'warn' ? '#E2A53A' : colors.blue600;
              return (
                <View key={b.label} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                  <Text style={styles.barVal}>{b.pct}%</Text>
                  <View style={{ width: '100%', height: b.pct * 1.4, backgroundColor: c, borderRadius: 4 }} />
                  <Text style={styles.barLabel}>{b.label}</Text>
                  <Text style={styles.barN}>n={b.n}</Text>
                </View>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', gap: space.lg, marginTop: space.md, flexWrap: 'wrap' }}>
            <Legend color={colors.blue600} label="Safe ≥80%" />
            <Legend color="#E2A53A" label="Watch 75–79%" />
            <Legend color={colors.coral400} label="Risk <75%" />
          </View>
        </Card>

        <Card style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.cardTitle, { flex: 1 }]}>Leave approvals</Text>
            <Link href="/approvals"><Text style={styles.link}>View all 3</Text></Link>
          </View>
          <View style={{ height: space.md }} />
          {LEAVES.map((l, i) => (
            <View key={l.reg}>
              <View style={{ gap: space.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                  <Text style={styles.lvName}>{l.name}</Text>
                  <Text style={styles.lvReg}>{l.reg}</Text>
                  <View style={{ flex: 1 }} />
                  <Chip label={l.type[0].toUpperCase() + l.type.slice(1)} variant={l.type === 'duty' ? 'duty' : l.type === 'medical' ? 'warn' : 'neutral'} />
                </View>
                <Text style={styles.lvReason}>{l.reason}</Text>
                <Text style={styles.lvDates}>{l.dates}</Text>
                <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
                  <Button title="Approve" size="sm" />
                  <Button title="Decline" size="sm" variant="ghost" />
                  <View style={{ flex: 1 }} />
                  {l.proof && <Text style={styles.proof}>Proof attached</Text>}
                </View>
              </View>
              {i < LEAVES.length - 1 && <Divider style={{ marginVertical: space.md }} />}
            </View>
          ))}
        </Card>
      </View>

      <Card>
        <View style={{ flexDirection: tablet ? 'row' : 'column', alignItems: tablet ? 'center' : 'flex-start', gap: space.sm }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>At-risk cohort</Text>
            <Text style={styles.cardSub}>Students below 75% · S6 CSE-B</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <Button title="Message class" variant="secondary" size="sm" />
            <Button title="Flag for mentor" size="sm" />
          </View>
        </View>
        <View style={{ height: space.md }} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={[styles.tr, styles.thRow]}>
              <Text style={[styles.th, { width: 180 }]}>Student</Text>
              <Text style={[styles.th, { width: 120 }]}>Reg. no.</Text>
              <Text style={[styles.th, { width: 110 }]}>Attendance</Text>
              <Text style={[styles.th, { width: 160 }]}>Progress</Text>
              <Text style={[styles.th, { width: 80 }]}>Trend</Text>
              <Text style={[styles.th, { width: 160 }]}>Critical in</Text>
              <Text style={[styles.th, { width: 70 }]}></Text>
            </View>
            {COHORT.map(r => (
              <View key={r.reg} style={styles.tr}>
                <View style={[styles.td, { width: 180, flexDirection: 'row', alignItems: 'center', gap: space.sm }]}>
                  <View style={styles.avatar}><Text style={styles.avatarText}>{r.init}</Text></View>
                  <Text style={styles.tdName}>{r.name}</Text>
                </View>
                <Text style={[styles.td, styles.mono, { width: 120 }]}>{r.reg}</Text>
                <View style={[styles.td, { width: 110 }]}>
                  <Chip label={`${r.pct}%`} variant={status(r.pct)} dot />
                </View>
                <View style={[styles.td, { width: 160 }]}>
                  <Progress value={r.pct} color={colors.coral400} />
                </View>
                <Text style={[styles.td, styles.mono, { width: 80, color: colors.coral600 }]}>{r.trend}%</Text>
                <Text style={[styles.td, styles.mono, { width: 160, color: colors.ink700 }]}>{r.critical}</Text>
                <View style={[styles.td, { width: 70 }]}>
                  <Pressable><Text style={styles.link}>View</Text></Pressable>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </Card>
    </ScrollView>
  );

  if (!wide) return main;

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: colors.surfaceAlt }}>
      <View style={[styles.sidebar, { paddingTop: insets.top + space.lg }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg }}>
          <View style={styles.brandBadge}><Text style={styles.brandBadgeText}>a</Text></View>
          <View>
            <Text style={styles.brand}>Attendly</Text>
            <Text style={styles.brandMeta}>GCEK · v1.0</Text>
          </View>
        </View>
        <View style={{ height: space.xl }} />
        <View style={{ paddingHorizontal: space.sm, gap: 2 }}>
          {NAV.map((n, i) => {
            const active = i === 0;
            const badge = n === 'Leave approvals' ? 3 : null;
            return (
              <View key={n} style={[styles.navItem, active && styles.navItemActive]}>
                <Text style={[styles.navText, active && { color: colors.blue800 }]}>{n}</Text>
                <View style={{ flex: 1 }} />
                {badge != null && <View style={styles.navBadge}><Text style={styles.navBadgeText}>{badge}</Text></View>}
              </View>
            );
          })}
        </View>
        <View style={{ flex: 1 }} />
        <View style={[styles.userCard, { marginBottom: insets.bottom + space.lg }]}>
          <View style={[styles.avatar, { backgroundColor: colors.coral200 }]}><Text style={styles.avatarText}>{initials}</Text></View>
          <View>
            <Text style={styles.lvName}>{user?.name ?? 'Dr. Suja N'}</Text>
            <Text style={styles.lvReg}>CSE · HoD</Text>
          </View>
        </View>
      </View>
      <View style={{ flex: 1 }}>{main}</View>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: color }} />
      <Text style={styles.legend}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500 },
  h1: { fontFamily: fonts.displayBold, fontSize: 28, color: colors.ink900, marginTop: 4 },
  search: {
    height: 40, paddingHorizontal: 12, borderWidth: hairline, borderColor: colors.ink200,
    borderRadius: radius.sm, backgroundColor: '#fff', color: colors.ink900,
    fontFamily: fonts.sans, fontSize: 14,
  },
  kpiLabel: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500 },
  kpiValue: { fontFamily: fonts.displayBold, fontSize: 28, color: colors.ink900 },
  kpiDelta: { fontFamily: fonts.monoMedium, fontSize: 12 },
  kpiSub: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 4 },
  cardTitle: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.ink900 },
  cardSub: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 2 },
  toggle: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt },
  toggleOn: { backgroundColor: colors.ink900 },
  toggleText: { fontFamily: fonts.sansMedium, fontSize: 11, color: colors.ink700 },
  barVal: { fontFamily: fonts.mono, fontSize: 10, color: colors.ink500 },
  barLabel: { fontFamily: fonts.sansMedium, fontSize: 11, color: colors.ink700, marginTop: 4 },
  barN: { fontFamily: fonts.mono, fontSize: 10, color: colors.ink500 },
  legend: { fontFamily: fonts.sans, fontSize: 11, color: colors.ink500 },
  link: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.blue600 },
  lvName: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink900 },
  lvReg: { fontFamily: fonts.mono, fontSize: 10, color: colors.ink500, marginTop: 2 },
  lvReason: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink700 },
  lvDates: { fontFamily: fonts.mono, fontSize: 11, color: colors.ink500 },
  proof: { fontFamily: fonts.sans, fontSize: 11, color: colors.blue600 },
  thRow: { borderBottomWidth: hairline, borderBottomColor: colors.border, paddingBottom: space.sm },
  tr: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.sm, gap: space.sm },
  th: { fontFamily: fonts.sansMedium, fontSize: 11, color: colors.ink500, textTransform: 'uppercase', letterSpacing: 0.4 },
  td: { paddingVertical: 4 } as any,
  tdName: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink900 },
  mono: { fontFamily: fonts.mono, fontSize: 12 },
  avatar: { width: 28, height: 28, borderRadius: radius.md, backgroundColor: colors.blue600, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontFamily: fonts.monoMedium, fontSize: 11 },
  sidebar: { width: 230, backgroundColor: '#fff', borderRightWidth: hairline, borderRightColor: colors.border },
  brandBadge: { width: 28, height: 28, borderRadius: radius.sm, backgroundColor: colors.blue600, alignItems: 'center', justifyContent: 'center' },
  brandBadgeText: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 16 },
  brand: { fontFamily: fonts.displayBold, fontSize: 15, color: colors.ink900 },
  brandMeta: { fontFamily: fonts.mono, fontSize: 10, color: colors.ink500 },
  navItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.md, paddingVertical: 10, borderRadius: radius.md },
  navItemActive: { backgroundColor: colors.blue50 },
  navText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink700 },
  navBadge: { backgroundColor: colors.coral400, borderRadius: 999, paddingHorizontal: 6, minWidth: 18, alignItems: 'center' },
  navBadgeText: { color: '#fff', fontSize: 10, fontFamily: fonts.sansMedium },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg, paddingTop: space.md, borderTopWidth: hairline, borderTopColor: colors.border },
});
