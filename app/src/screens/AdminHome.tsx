import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, radius, hairline } from '../theme';
import { useAuth } from '../lib/auth';

const DESIGNATION_LABELS: Record<string, string> = {
  principal: 'Principal',
  hod: 'Head of Department',
  office_staff: 'Office Staff',
};

// Removed hardcoded stats and requests

export default function AdminHome() {
  const { profile, designation } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const isDesktop = width >= 1024;

  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({ students: 0, teachers: 0, requests: 0 });
  const [requests, setRequests] = React.useState<any[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const { listProfiles, listRequests } = require('../lib/db');
        const [students, teachers, reqs] = await Promise.all([
          listProfiles({ role: 'student' }),
          listProfiles({ role: 'teacher' }),
          listRequests({ status: 'pending' })
        ]);
        setStats({ students: students.length, teachers: teachers.length, requests: reqs.length });
        setRequests(reqs.slice(0, 3));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const designationLabel = DESIGNATION_LABELS[designation ?? 'office_staff'] ?? 'Administrator';

  const kpis = [
    { label: 'Total Students', value: stats.students.toString(), color: colors.blue600, emoji: '🎓' },
    { label: 'Total Teachers', value: stats.teachers.toString(), color: '#7C3AED', emoji: '👨‍🏫' },
    { label: 'Avg Attendance', value: 'N/A', color: '#1B8F5A', emoji: '📊' }, // requires deeper integration
    { label: 'Pending Requests', value: stats.requests.toString(), color: colors.coral, emoji: '📋' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Admin Dashboard</Text>
            <Text style={styles.subtitle}>College of Engineering Kottarakkara</Text>
          </View>
          <View style={styles.designationBadge}>
            <Text style={styles.designationText}>{designationLabel}</Text>
          </View>
        </View>

        {/* KPI Cards */}
        <View style={[styles.kpiGrid, isWide && styles.kpiGridWide, isDesktop && styles.kpiGridDesktop]}>
          {kpis.map((kpi, i) => (
            <View key={i} style={styles.kpiCard}>
              <View style={[styles.kpiAccent, { backgroundColor: kpi.color }]} />
              <View style={styles.kpiContent}>
                <Text style={styles.kpiEmoji}>{kpi.emoji}</Text>
                <Text style={[styles.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
                <Text style={styles.kpiLabel}>{kpi.label}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Attendance by Program - Disabled until session data is available */}
        <Text style={styles.sectionTitle}>Attendance by Program</Text>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Attendance aggregates will appear once classes are logged.</Text>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={[styles.actionsGrid, isWide && styles.actionsGridWide]}>
          {[
            { emoji: '👥', label: 'Manage\nBatches', route: '/manage-batches' },
            { emoji: '📖', label: 'Manage\nCourses', route: '/manage-courses' },
            { emoji: '👤', label: 'Manage\nUsers', route: '/manage-users' },
            { emoji: '◎', label: 'View\nReports', route: '/(tabs)/reports' },
          ].map((a, i) => (
            <TouchableOpacity key={i} style={styles.actionCard} onPress={() => router.push(a.route as any)} activeOpacity={0.7}>
              <Text style={styles.actionEmoji}>{a.emoji}</Text>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Requests */}
        <Text style={styles.sectionTitle}>Recent Requests</Text>
        {loading ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : requests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No pending requests.</Text>
          </View>
        ) : requests.map((r) => (
          <View key={r.id} style={styles.requestCard}>
            <View style={[styles.requestAvatar, { backgroundColor: '#EBF2FB' }]}>
              <Text style={{ fontSize: 16 }}>📋</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.requestName}>{r.type}</Text>
              <Text style={styles.requestReason}>{r.data?.reason ?? 'Pending approval'}</Text>
            </View>
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>Pending</Text>
            </View>
          </View>
        ))}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  title: { fontFamily: fonts.display, fontSize: 26, color: colors.ink900 },
  subtitle: { fontFamily: fonts.sans, fontSize: 13, color: colors.ink500, marginTop: 2 },
  designationBadge: {
    backgroundColor: colors.blue600,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  designationText: { fontFamily: fonts.sansMedium, fontSize: 12, color: '#fff' },

  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  kpiGridWide: { gap: spacing.md },
  kpiGridDesktop: {},
  kpiCard: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: '#fff',
    borderRadius: radius.md,
    borderWidth: hairline,
    borderColor: colors.border,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  kpiAccent: { width: 4 },
  kpiContent: { flex: 1, padding: spacing.md },
  kpiEmoji: { fontSize: 20, marginBottom: 4 },
  kpiValue: { fontFamily: fonts.display, fontSize: 28 },
  kpiLabel: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 2 },

  sectionTitle: {
    fontFamily: fonts.sansMedium,
    fontSize: 17,
    color: colors.ink900,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },

  programCard: {
    backgroundColor: '#fff',
    borderRadius: radius.md,
    borderWidth: hairline,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  programHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  programName: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink900 },
  programPct: { fontFamily: fonts.display, fontSize: 18 },
  progressBg: { height: 6, backgroundColor: colors.surfaceAlt, borderRadius: 3 },
  progressFill: { height: 6, borderRadius: 3 },
  programStudents: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 4 },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionsGridWide: { gap: spacing.md },
  actionCard: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: '#fff',
    borderRadius: radius.md,
    borderWidth: hairline,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  actionEmoji: { fontSize: 24, marginBottom: 4 },
  actionLabel: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.ink700, textAlign: 'center' },

  requestCard: {
    backgroundColor: '#fff',
    borderRadius: radius.md,
    borderWidth: hairline,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  requestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestName: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink900 },
  requestReason: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 2 },
  pendingBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  pendingText: { fontFamily: fonts.sansMedium, fontSize: 11, color: '#C47D1A' },
  emptyCard: {
    backgroundColor: '#fff', borderRadius: radius.md, borderWidth: hairline, borderColor: colors.border,
    padding: spacing.xl, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  emptyText: { fontFamily: fonts.sans, fontSize: 14, color: colors.ink500, textAlign: 'center' },
});
