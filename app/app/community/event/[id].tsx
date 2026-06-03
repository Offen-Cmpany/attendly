import React from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Chip, Eyebrow, Divider } from '../../../src/components/atoms';
import { colors, fonts, radius, space } from '../../../src/theme';

export default function EventDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surfaceAlt }} contentContainerStyle={{ paddingTop: insets.top + space.md, paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.lg }}>
      <Pressable onPress={() => router.back()} hitSlop={10}><Text style={styles.back}>← Back</Text></Pressable>

      <View>
        <Eyebrow>IEEE · Event</Eyebrow>
        <Text style={styles.h1}>TechFest opening night</Text>
        <Text style={styles.meta}>Sat 19 Apr · 6:00 PM – 9:00 PM</Text>
      </View>

      <Card style={{ gap: space.md }}>
        <Row label="Location" value="Main Auditorium" />
        <Divider />
        <Row label="Organiser" value="IEEE Student Branch" />
        <Divider />
        <Row label="Going" value="34 students" />
        <Divider />
        <Row label="Duty leave" value="Eligible" />
      </Card>

      <Card>
        <Text style={styles.body}>
          Curtain-raiser for the annual TechFest with keynote, sponsor showcase and dorm-block performances. Bring your ID. Snacks at the lobby.
        </Text>
      </Card>

      <View style={{ flexDirection: 'row', gap: space.md }}>
        <Link href="/leave" asChild>
          <Button title="Apply duty leave" variant="secondary" style={{ flex: 1 }} />
        </Link>
        <Button title="I'll be there" style={{ flex: 1 }} />
      </View>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { fontFamily: fonts.sansMedium, color: colors.ink500, fontSize: 13 },
  h1: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.ink900, marginTop: 4 },
  meta: { fontFamily: fonts.mono, fontSize: 12, color: colors.ink500, marginTop: 4 },
  body: { fontFamily: fonts.sans, fontSize: 14, color: colors.ink700, lineHeight: 20 },
  rowLabel: { fontFamily: fonts.sans, fontSize: 13, color: colors.ink500 },
  rowValue: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink900 },
});
