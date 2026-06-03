import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Chip, Eyebrow, Divider } from '../../src/components/atoms';
import { colors, fonts, radius, space, hairline } from '../../src/theme';

const ROSTER = Array.from({ length: 16 }).map((_, i) => ({
  id: `s${i}`,
  reg: `CSE/22/${String(i + 1).padStart(3, '0')}`,
  name: ['Aravind R','Lakshmi M','Sreehari V','Nithya K','Adarsh P','Meera S','Karthik N','Devika R','Anand T','Pooja V','Rohit M','Sneha K','Vinay P','Anu B','Hari G','Reshma S'][i],
}));

export default function MarkAttendance() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [absent, setAbsent] = useState<Set<string>>(new Set());

  const present = ROSTER.length - absent.size;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceAlt }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + space.md, paddingHorizontal: space.lg, paddingBottom: 120, gap: space.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable onPress={() => router.back()} hitSlop={10}><Text style={styles.back}>← Back</Text></Pressable>
          <View style={{ flex: 1 }} />
          <Chip label="Offline · queued" variant="neutral" dot />
        </View>

        <View>
          <Eyebrow>Live · {id}</Eyebrow>
          <Text style={styles.h1}>Mark attendance</Text>
          <Text style={styles.sub}>Tap a student to mark absent. All present by default.</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: space.md }}>
          <Card style={{ flex: 1 }}><Eyebrow>Present</Eyebrow><Text style={[styles.kpi, { color: colors.safeFg }]}>{present}</Text></Card>
          <Card style={{ flex: 1 }}><Eyebrow>Absent</Eyebrow><Text style={[styles.kpi, { color: colors.coral400 }]}>{absent.size}</Text></Card>
        </View>

        <Card style={{ gap: space.sm }}>
          {ROSTER.map((s, i) => {
            const isAbsent = absent.has(s.id);
            return (
              <View key={s.id}>
                <Pressable
                  onPress={() => setAbsent(prev => {
                    const n = new Set(prev);
                    n.has(s.id) ? n.delete(s.id) : n.add(s.id);
                    return n;
                  })}
                  style={[styles.row, isAbsent && { opacity: 0.6 }]}
                >
                  <View style={[styles.checkbox, isAbsent ? styles.checkboxAbsent : styles.checkboxPresent]}>
                    <Text style={styles.checkText}>{isAbsent ? '✕' : '✓'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{s.name}</Text>
                    <Text style={styles.reg}>{s.reg}</Text>
                  </View>
                  <Chip label={isAbsent ? 'Absent' : 'Present'} variant={isAbsent ? 'risk' : 'safe'} dot />
                </Pressable>
                {i < ROSTER.length - 1 && <Divider style={{ marginVertical: 4 }} />}
              </View>
            );
          })}
        </Card>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
        <Button title="All present (1 tap)" variant="ghost" style={{ flex: 1 }} onPress={() => setAbsent(new Set())} />
        <Button title={`Save · ${present}/${ROSTER.length}`} onPress={() => router.back()} style={{ flex: 2 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { fontFamily: fonts.sansMedium, color: colors.ink500, fontSize: 13 },
  h1: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.ink900, marginTop: space.xs },
  sub: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 2 },
  kpi: { fontFamily: fonts.displayBold, fontSize: 32, marginTop: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 6 },
  checkbox: { width: 28, height: 28, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  checkboxPresent: { backgroundColor: colors.safeBg },
  checkboxAbsent: { backgroundColor: colors.riskBg },
  checkText: { fontFamily: fonts.sansMedium, color: colors.ink900 },
  name: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink900 },
  reg: { fontFamily: fonts.mono, fontSize: 11, color: colors.ink500, marginTop: 2 },
  footer: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: '#fff', borderTopWidth: hairline, borderTopColor: colors.border,
    paddingHorizontal: space.lg, paddingTop: space.md, flexDirection: 'row', gap: space.md,
  },
});
