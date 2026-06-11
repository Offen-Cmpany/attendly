import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors, fonts, spacing, radius, hairline } from '../theme';
import { useAuth } from '../lib/auth';
import { getDepartmentAttendanceSummary, DeptAttendanceSummary } from '../lib/db';
import { Card, Progress, Eyebrow, Chip, Button } from '../components/atoms';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform, Alert } from 'react-native';

const DESIGNATION_LABELS: Record<string, string> = {
  principal: 'Principal',
  hod: 'Head of Department',
  office_staff: 'Office Staff',
};

export default function AdminHome() {
  const { profile, designation } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState<DeptAttendanceSummary[]>([]);
  const [stats, setStats] = useState({ students: 0, teachers: 0 });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const { listProfiles } = require('../lib/db');
      const [students, teachers, deptSummaries] = await Promise.all([
        listProfiles({ role: 'student' }),
        listProfiles({ role: 'teacher' }),
        getDepartmentAttendanceSummary()
      ]);
      setStats({ students: students.length, teachers: teachers.length });
      setSummaries(deptSummaries);
    } catch (e) {
      console.error('Failed to load admin dashboard:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleExport = async () => {
    if (summaries.length === 0) {
      if (Platform.OS === 'web') window.alert('There is no attendance data to export.');
      else Alert.alert('No data', 'There is no attendance data to export.');
      return;
    }

    try {
      const headers = ['Course Code', 'Course Name', 'Faculty', 'Total Sessions', 'Avg Attendance %'];
      const rows = summaries.map(s => [
        s.courseCode,
        `"${s.courseName}"`, 
        `"${s.facultyName}"`,
        s.totalSessions,
        s.avgAttendance
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

      if (Platform.OS === 'web') {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'Department_Attendance_Report.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const fileUri = (FileSystem as any).documentDirectory + 'Department_Attendance_Report.csv';
        await (FileSystem as any).writeAsStringAsync(fileUri, csvContent, { encoding: (FileSystem as any).EncodingType.UTF8 });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert('Sharing not available', 'Cannot export file on this device.');
        }
      }
    } catch (e) {
      console.error('Export failed:', e);
      if (Platform.OS === 'web') window.alert('Failed to generate report.');
      else Alert.alert('Error', 'Failed to generate report.');
    }
  };

  const designationLabel = DESIGNATION_LABELS[designation ?? 'office_staff'] ?? 'Administrator';

  // Calculate overall average attendance
  let overallAvg = 0;
  if (summaries.length > 0) {
    const total = summaries.reduce((acc, curr) => acc + curr.avgAttendance, 0);
    overallAvg = Math.round(total / summaries.length);
  }

  const kpis = [
    { label: 'Total Students', value: stats.students.toString(), color: colors.blue600, emoji: '🎓' },
    { label: 'Total Teachers', value: stats.teachers.toString(), color: '#7C3AED', emoji: '👨‍🏫' },
    { label: 'Avg Attendance', value: summaries.length > 0 ? `${overallAvg}%` : '—', color: overallAvg >= 75 ? colors.safeFg : colors.coral400, emoji: '📊' },
    { label: 'Active Classes', value: summaries.length.toString(), color: colors.blue600, emoji: '📚' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, isWide && { maxWidth: 720, alignSelf: 'center' as const, width: '100%', paddingHorizontal: 32 }]} showsVerticalScrollIndicator={false}>
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
        <View style={[styles.kpiGrid, isWide && styles.kpiGridWide]}>
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

        {/* Attendance by Program/Course */}
        <Text style={styles.sectionTitle}>Attendance by Course</Text>
        {loading ? (
          <ActivityIndicator color={colors.blue600} style={{ marginVertical: spacing.lg }} />
        ) : summaries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No attendance data available yet.</Text>
          </View>
        ) : (
          <View style={{ gap: spacing.sm }}>
            {summaries.map(s => {
              const color = s.avgAttendance >= 75 ? colors.safeFg : s.avgAttendance >= 65 ? colors.blue600 : colors.coral400;
              return (
                <Card key={s.courseDurationId} style={{ gap: spacing.sm }}>
                  <View style={styles.courseRow}>
                    <View style={styles.courseLeft}>
                      <Text style={styles.courseCode}>{s.courseCode}</Text>
                      <Text style={styles.courseName}>{s.courseName}</Text>
                      <Text style={styles.courseFaculty}>Faculty: {s.facultyName}</Text>
                    </View>
                    <View style={styles.courseRight}>
                      <Text style={[styles.coursePct, { color }]}>{s.avgAttendance}%</Text>
                    </View>
                  </View>
                  <Progress value={s.avgAttendance} color={color} />
                  <Text style={styles.courseFootnote}>{s.totalSessions} sessions logged</Text>
                </Card>
              );
            })}
          </View>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={[styles.actionsGrid, isWide && styles.actionsGridWide]}>
          {[
            { emoji: '👥', label: 'Manage\nBatches', route: '/manage-batches' },
            { emoji: '📖', label: 'Manage\nCourses', route: '/manage-courses' },
            { emoji: '👤', label: 'Manage\nUsers', route: '/manage-users' },
            { emoji: '✦', label: 'Review\nEvents', route: '/(tabs)/events' },
            { emoji: '🎯', label: 'Program\nOutcomes', route: '/manage-outcomes' },
            { emoji: '📋', label: 'Manage\nRoster', route: '/admin/manage-roster' },
            { emoji: '📥', label: 'Bulk\nImport', route: '/admin/import' },
            { emoji: '◎', label: 'View\nReports', route: '/(tabs)/reports' },
          ].map((a, i) => (
            <TouchableOpacity key={i} style={styles.actionCard} onPress={() => router.push(a.route as any)} activeOpacity={0.7}>
              <Text style={styles.actionEmoji}>{a.emoji}</Text>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

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
    marginTop: spacing.md,
  },

  courseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  courseLeft: { flex: 1, paddingRight: spacing.md },
  courseCode: { fontFamily: fonts.monoMedium, fontSize: 11, color: colors.ink500, marginBottom: 2 },
  courseName: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.ink900 },
  courseFaculty: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 2 },
  courseRight: { alignItems: 'flex-end' },
  coursePct: { fontFamily: fonts.displayBold, fontSize: 20 },
  courseFootnote: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 4 },

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

  emptyCard: {
    backgroundColor: '#fff', borderRadius: radius.md, borderWidth: hairline, borderColor: colors.border,
    padding: spacing.xl, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  emptyText: { fontFamily: fonts.sans, fontSize: 14, color: colors.ink500, textAlign: 'center' },
});
