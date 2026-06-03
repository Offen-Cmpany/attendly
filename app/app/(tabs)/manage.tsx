import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, radius, hairline } from '../../src/theme';
import { useAuth } from '../../src/lib/auth';

const sections = [
  {
    emoji: '👥',
    title: 'Manage Batches',
    desc: 'Create batches, assign students, set advisors',
    route: '/manage-batches',
    count: '4 batches',
  },
  {
    emoji: '📖',
    title: 'Manage Courses',
    desc: 'Create courses, assign to teachers and batches',
    route: '/manage-courses',
    count: '6 courses',
  },
  {
    emoji: '👤',
    title: 'Manage Users',
    desc: 'View and manage students, teachers, and admins',
    route: '/manage-users',
    count: '258 users',
  },
];

export default function ManageTab() {
  const { designation } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Manage</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.grid, isWide && styles.gridWide]}>
          {sections.map((s, i) => (
            <TouchableOpacity
              key={i}
              style={styles.card}
              onPress={() => router.push(s.route as any)}
              activeOpacity={0.7}
            >
              <View style={styles.cardIcon}>
                <Text style={{ fontSize: 28 }}>{s.emoji}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{s.title}</Text>
                <Text style={styles.cardDesc}>{s.desc}</Text>
                <Text style={styles.cardCount}>{s.count}</Text>
              </View>
              <Text style={styles.cardArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Stats */}
        <Text style={styles.sectionTitle}>System Health</Text>
        <View style={styles.statsRow}>
          {[
            { label: 'Active Sessions', value: '12', color: '#1B8F5A' },
            { label: 'Forms Published', value: '3', color: colors.blue600 },
            { label: 'Pending Approvals', value: '5', color: colors.coral },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  headerBar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerTitle: { fontFamily: fonts.display, fontSize: 24, color: colors.ink900 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },

  grid: { gap: spacing.sm },
  gridWide: {},

  card: {
    backgroundColor: '#fff',
    borderRadius: radius.md,
    borderWidth: hairline,
    borderColor: colors.border,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EBF2FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  cardTitle: { fontFamily: fonts.sansMedium, fontSize: 17, color: colors.ink900 },
  cardDesc: { fontFamily: fonts.sans, fontSize: 13, color: colors.ink500, marginTop: 2 },
  cardCount: { fontFamily: fonts.mono, fontSize: 12, color: colors.blue600, marginTop: 4 },
  cardArrow: { fontFamily: fonts.sansMedium, fontSize: 20, color: colors.ink300 },

  sectionTitle: {
    fontFamily: fonts.sansMedium,
    fontSize: 17,
    color: colors.ink900,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },

  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: radius.md,
    borderWidth: hairline,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: { fontFamily: fonts.display, fontSize: 24 },
  statLabel: { fontFamily: fonts.sans, fontSize: 11, color: colors.ink500, marginTop: 4, textAlign: 'center' },
});
