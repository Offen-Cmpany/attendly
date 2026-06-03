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

const kpis = [
  { label: 'Total Students', value: '240', color: colors.blue600, emoji: '🎓' },
  { label: 'Total Teachers', value: '18', color: '#7C3AED', emoji: '👨‍🏫' },
  { label: 'Avg Attendance', value: '82%', color: '#1B8F5A', emoji: '📊' },
  { label: 'Pending Requests', value: '5', color: colors.coral, emoji: '📋' },
];

const programStats = [
  { name: 'B.Tech CSE', attendance: 84, students: 120, color: '#1B8F5A' },
  { name: 'B.Tech CSE & AI', attendance: 79, students: 60, color: '#C47D1A' },
  { name: 'BCA', attendance: 81, students: 60, color: '#1B8F5A' },
];

const recentRequests = [
  { id: 'r1', name: 'Dr. Rajesh Kumar', type: 'Teacher Leave', reason: 'Conference at IIT Bombay', role: 'teacher' },
  { id: 'r2', name: 'Aravind R', type: 'Community', reason: 'Create Coding Club community', role: 'student' },
  { id: 'r3', name: 'Lakshmi M', type: 'Medical Leave', reason: 'Fever, advised rest 2 days', role: 'student' },
];

export default function AdminHome() {
  const { profile, designation } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const isDesktop = width >= 1024;

  const designationLabel = DESIGNATION_LABELS[designation ?? 'office_staff'] ?? 'Administrator';

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

        {/* Attendance by Program */}
        <Text style={styles.sectionTitle}>Attendance by Program</Text>
        {programStats.map((p, i) => (
          <View key={i} style={styles.programCard}>
            <View style={styles.programHeader}>
              <Text style={styles.programName}>{p.name}</Text>
              <Text style={[styles.programPct, { color: p.color }]}>{p.attendance}%</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${p.attendance}%`, backgroundColor: p.color }]} />
            </View>
            <Text style={styles.programStudents}>{p.students} students</Text>
          </View>
        ))}

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
        {recentRequests.map((r) => (
          <View key={r.id} style={styles.requestCard}>
            <View style={[styles.requestAvatar, { backgroundColor: r.role === 'teacher' ? '#F0E6FF' : '#EBF2FB' }]}>
              <Text style={{ fontSize: 16 }}>{r.role === 'teacher' ? '👨‍🏫' : '🎓'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.requestName}>{r.name}</Text>
              <Text style={styles.requestReason}>{r.reason}</Text>
            </View>
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>{r.type}</Text>
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
});
