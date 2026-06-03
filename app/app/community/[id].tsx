import React from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Chip, Eyebrow, Divider } from '../../src/components/atoms';
import { colors, fonts, radius, space } from '../../src/theme';

export default function CommunityDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surfaceAlt }} contentContainerStyle={{ paddingTop: insets.top + space.md, paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.lg }}>
      <Pressable onPress={() => router.back()} hitSlop={10}><Text style={styles.back}>← Back</Text></Pressable>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{(id ?? 'CO').slice(0,2).toUpperCase()}</Text></View>
        <View style={{ flex: 1 }}>
          <Eyebrow>Community</Eyebrow>
          <Text style={styles.h1}>IEEE Student Branch</Text>
          <Text style={styles.meta}>142 members · 4 organisers</Text>
        </View>
      </View>

      <Card>
        <Text style={styles.body}>Student chapter of IEEE GCEK. We host TechFest, workshops, and study circles. Duty leave is supported for official events.</Text>
      </Card>

      <View>
        <Eyebrow>Pinned event</Eyebrow>
        <View style={{ height: space.sm }} />
        <Link href={{ pathname: '/community/event/[id]', params: { id: 'e1' } }} asChild>
          <Card>
            <View style={{ flexDirection: 'row', gap: space.md }}>
              <View style={styles.dateBadge}><Text style={styles.dateDay}>19</Text><Text style={styles.dateMonth}>APR</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.eTitle}>TechFest opening night</Text>
                <Text style={styles.eMeta}>6:00 PM · Main Auditorium</Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                  <Chip label="Duty leave ok" variant="duty" />
                  <Chip label="34 going" variant="neutral" />
                </View>
              </View>
            </View>
          </Card>
        </Link>
      </View>

      <Button title="Joined ✓" variant="secondary" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  back: { fontFamily: fonts.sansMedium, color: colors.ink500, fontSize: 13 },
  avatar: { width: 56, height: 56, borderRadius: radius.lg, backgroundColor: colors.blue600, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontFamily: fonts.monoMedium, fontSize: 16 },
  h1: { fontFamily: fonts.displayBold, fontSize: 22, color: colors.ink900 },
  meta: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 2 },
  body: { fontFamily: fonts.sans, fontSize: 14, color: colors.ink700, lineHeight: 20 },
  dateBadge: { width: 48, paddingVertical: space.sm, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, alignItems: 'center', borderWidth: 0.5, borderColor: colors.border },
  dateDay: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.ink900 },
  dateMonth: { fontFamily: fonts.mono, fontSize: 10, color: colors.ink500 },
  eTitle: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink900 },
  eMeta: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 2 },
});
