import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eyebrow, Card } from '../../src/components/atoms';
import { colors, fonts, space } from '../../src/theme';

export default function Timetable() {
  const insets = useSafeAreaInsets();
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const slots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00'];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surfaceAlt }} contentContainerStyle={{ paddingTop: insets.top + space.lg, paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.lg }}>
      <View>
        <Eyebrow>This week</Eyebrow>
        <Text style={styles.h1}>Timetable</Text>
      </View>
      <Card>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ width: 56 }} />
              {days.map(d => <Text key={d} style={styles.dayHeader}>{d}</Text>)}
            </View>
            {slots.map(s => (
              <View key={s} style={{ flexDirection: 'row', marginTop: space.sm }}>
                <Text style={styles.slot}>{s}</Text>
                {days.map(d => (
                  <View key={d} style={styles.cell}>
                    <Text style={styles.cellText}>—</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 24, fontFamily: fonts.displayBold, color: colors.ink900, marginTop: space.xs },
  dayHeader: { width: 80, textAlign: 'center', fontSize: 12, fontFamily: fonts.sansMedium, color: colors.ink500 },
  slot: { width: 56, fontSize: 11, fontFamily: fonts.mono, color: colors.ink500, paddingTop: 8 },
  cell: { width: 80, height: 56, borderRadius: 8, backgroundColor: colors.surfaceAlt, marginRight: 6, alignItems: 'center', justifyContent: 'center' },
  cellText: { fontSize: 12, color: colors.ink300, fontFamily: fonts.sans },
});
