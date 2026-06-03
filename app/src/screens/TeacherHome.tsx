import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors, fonts, spacing, radius, hairline } from '../theme';
import { useAuth } from '../lib/auth';
import { listCourseDurations, listAttendanceRecords, CourseDuration, AttendanceRecord } from '../lib/db';
import { Card, Eyebrow } from '../components/atoms';

export default function TeacherHome() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [classes, setClasses] = useState<CourseDuration[]>([]);
  const [sessions, setSessions] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [myClasses, recentSessions] = await Promise.all([
        listCourseDurations({ facultyId: user.id }),
        listAttendanceRecords({ facultyId: user.id, limit: 5 })
      ]);
      setClasses(myClasses);
      setSessions(recentSessions);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const firstName = profile?.name?.split(' ')[0] ?? 'Teacher';
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, isDesktop && { maxWidth: 720, alignSelf: 'center' as const, width: '100%', paddingHorizontal: 32 }]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting}, {firstName}</Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>

        <TouchableOpacity style={styles.heroCard} activeOpacity={1}>
          <View>
            <Text style={styles.heroTitle}>Your Dashboard</Text>
            <Text style={styles.heroSub}>Manage your classes and attendance</Text>
          </View>
        </TouchableOpacity>

        {/* Dashboard Stats */}
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
          <Card style={{ flex: 1, backgroundColor: colors.surfaceAlt, alignItems: 'center' }}>
            <Text style={{ fontFamily: fonts.displayBold, fontSize: 24, color: colors.blue600 }}>{classes.length}</Text>
            <Text style={{ fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 4 }}>Assigned Batches</Text>
          </Card>
          <Card style={{ flex: 1, backgroundColor: colors.surfaceAlt, alignItems: 'center' }}>
            <Text style={{ fontFamily: fonts.displayBold, fontSize: 24, color: colors.blue600 }}>{sessions.length}</Text>
            <Text style={{ fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 4 }}>Recent Sessions</Text>
          </Card>
        </View>

        {/* Recent Sessions */}
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        {loading ? (
          <ActivityIndicator color={colors.blue600} style={{ marginVertical: spacing.lg }} />
        ) : sessions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No attendance sessions marked yet.</Text>
          </Card>
        ) : (
          <Card style={{ gap: spacing.md }}>
            {sessions.map((s, i) => (
              <View key={s.id}>
                <View style={styles.sessionRow}>
                  <View style={styles.sessionDateBox}>
                    <Text style={styles.sessionDay}>{new Date(s.sessionDate).getDate()}</Text>
                    <Text style={styles.sessionMonth}>{new Date(s.sessionDate).toLocaleString('default', { month: 'short' })}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sessionCourse}>{s.courseName || s.courseCode}</Text>
                    <Text style={styles.sessionTopic}>{s.topic ? `Topic: ${s.topic}` : 'No topic specified'}</Text>
                  </View>
                  <TouchableOpacity onPress={() => router.push(`/edit-attendance/${s.courseDurationId}` as any)} style={styles.editBtn}>
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                </View>
                {i < sessions.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </Card>
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },
  header: { marginBottom: spacing.md },
  greeting: { fontFamily: fonts.display, fontSize: 26, color: colors.ink900 },
  date: { fontFamily: fonts.sans, fontSize: 13, color: colors.ink500, marginTop: 2 },

  heroCard: {
    backgroundColor: colors.blue600,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTitle: { fontFamily: fonts.display, fontSize: 22, color: '#fff' },
  heroSub: { fontFamily: fonts.sans, fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  sectionTitle: {
    fontFamily: fonts.sansMedium,
    fontSize: 17,
    color: colors.ink900,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },

  sessionRow: { flexDirection: 'row', alignItems: 'center' },
  sessionDateBox: {
    width: 46, height: 46, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
    borderWidth: hairline, borderColor: colors.border,
  },
  sessionDay: { fontFamily: fonts.displayBold, fontSize: 16, color: colors.ink900, lineHeight: 18 },
  sessionMonth: { fontFamily: fonts.sansMedium, fontSize: 10, color: colors.ink500, textTransform: 'uppercase' },
  sessionCourse: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink900 },
  sessionTopic: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 2 },
  editBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.sm, backgroundColor: colors.blue50 },
  editBtnText: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.blue600 },
  divider: { height: hairline, backgroundColor: colors.border, marginVertical: spacing.md },

  emptyCard: { padding: spacing.xl, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: fonts.sans, fontSize: 14, color: colors.ink500, textAlign: 'center' },
});
