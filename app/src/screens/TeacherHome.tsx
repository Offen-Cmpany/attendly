import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, radius, hairline } from '../theme';
import { useAuth } from '../lib/auth';
import { listCourses, Course } from '../lib/db';

const todaySchedule = [
  { time: '9:00 AM', subject: 'Data Structures', code: 'CS301', batch: 'B.Tech CSE 2022 A', room: 'CS Lab 1' },
  { time: '11:00 AM', subject: 'Operating Systems', code: 'CS303', batch: 'B.Tech CSE 2022 A', room: 'Room 301' },
  { time: '2:00 PM', subject: 'Programming in C', code: 'BCA101', batch: 'BCA 2024 A', room: 'Room 105' },
];

export default function TeacherHome() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const [courses_, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await listCourses({ teacherId: user?.id });
        setCourses(list.length > 0 ? list : []);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const firstName = user?.name?.split(' ')[0] ?? 'Teacher';
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting}, {firstName}</Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>

        {/* Hero Card */}
        <TouchableOpacity style={styles.heroCard} activeOpacity={0.85} onPress={() => router.push('/timetable' as any)}>
          <View>
            <Text style={styles.heroTitle}>{todaySchedule.length} classes today</Text>
            <Text style={styles.heroSub}>Next: {todaySchedule[0]?.subject ?? 'No classes'} at {todaySchedule[0]?.time}</Text>
          </View>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>View Schedule →</Text>
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={[styles.actionsRow, isWide && styles.actionsRowWide]}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/mark/next' as any)} activeOpacity={0.7}>
            <Text style={styles.actionEmoji}>✓</Text>
            <Text style={styles.actionLabel}>Mark{'\n'}Attendance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/reports' as any)} activeOpacity={0.7}>
            <Text style={styles.actionEmoji}>◎</Text>
            <Text style={styles.actionLabel}>View{'\n'}Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/approvals' as any)} activeOpacity={0.7}>
            <Text style={styles.actionEmoji}>✓</Text>
            <Text style={styles.actionLabel}>Leave{'\n'}Approvals</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Schedule */}
        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        {todaySchedule.map((item, i) => (
          <View key={i} style={styles.scheduleCard}>
            <View style={styles.scheduleTime}>
              <Text style={styles.scheduleTimeText}>{item.time}</Text>
            </View>
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleName}>{item.subject}</Text>
              <Text style={styles.scheduleMeta}>{item.code} · {item.batch}</Text>
              <Text style={styles.scheduleRoom}>📍 {item.room}</Text>
            </View>
            <TouchableOpacity style={styles.markBtn} activeOpacity={0.7}>
              <Text style={styles.markBtnText}>Mark</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* My Subjects */}
        <Text style={styles.sectionTitle}>My Subjects</Text>
        {loading ? (
          <ActivityIndicator color={colors.blue600} style={{ marginVertical: spacing.lg }} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectsScroll}>
            {(courses_.length > 0 ? courses_ : [
              { id: 'c1', code: 'CS301', name: 'Data Structures', program: 'B.Tech CSE', semester: 3, credits: 4, batchIds: ['b1'] },
              { id: 'c2', code: 'CS303', name: 'Operating Systems', program: 'B.Tech CSE', semester: 3, credits: 4, batchIds: ['b1'] },
              { id: 'c5', code: 'BCA101', name: 'Programming in C', program: 'BCA', semester: 1, credits: 4, batchIds: ['b4'] },
            ] as Course[]).map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.subjectCard}
                onPress={() => router.push(`/subject-manage/${c.id}` as any)}
                activeOpacity={0.7}
              >
                <Text style={styles.subjectCode}>{c.code}</Text>
                <Text style={styles.subjectName}>{c.name}</Text>
                <Text style={styles.subjectMeta}>{c.program} · Sem {c.semester}</Text>
                <Text style={styles.subjectMeta}>{c.credits} credits</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Advisory Batch */}
        {(profile?.isClassAdvisor || true) && (
          <>
            <Text style={styles.sectionTitle}>Class Advisory</Text>
            <TouchableOpacity
              style={styles.advisoryCard}
              onPress={() => router.push(`/batch-detail/${profile?.advisorBatchId ?? 'b1'}` as any)}
              activeOpacity={0.7}
            >
              <View style={styles.advisoryLeft}>
                <Text style={styles.advisoryEmoji}>🎓</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.advisoryTitle}>B.Tech CSE 2022 A</Text>
                <Text style={styles.advisoryMeta}>42 students · Avg attendance: 84%</Text>
              </View>
              <Text style={styles.advisoryArrow}>→</Text>
            </TouchableOpacity>
          </>
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
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  heroBadgeText: { fontFamily: fonts.sansMedium, fontSize: 13, color: '#fff' },

  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  actionsRowWide: { gap: spacing.md },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: radius.md,
    borderWidth: hairline,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  actionEmoji: { fontSize: 20, marginBottom: 4, color: colors.blue600 },
  actionLabel: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.ink700, textAlign: 'center' },

  sectionTitle: {
    fontFamily: fonts.sansMedium,
    fontSize: 17,
    color: colors.ink900,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },

  scheduleCard: {
    backgroundColor: '#fff',
    borderRadius: radius.md,
    borderWidth: hairline,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  scheduleTime: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: spacing.md,
  },
  scheduleTimeText: { fontFamily: fonts.monoMedium, fontSize: 12, color: colors.blue600 },
  scheduleInfo: { flex: 1 },
  scheduleName: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.ink900 },
  scheduleMeta: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 2 },
  scheduleRoom: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 2 },
  markBtn: {
    backgroundColor: colors.blue600,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  markBtnText: { fontFamily: fonts.sansMedium, fontSize: 13, color: '#fff' },

  subjectsScroll: { marginBottom: spacing.md },
  subjectCard: {
    backgroundColor: '#fff',
    borderRadius: radius.md,
    borderWidth: hairline,
    borderColor: colors.border,
    padding: spacing.md,
    marginRight: spacing.sm,
    width: 180,
  },
  subjectCode: { fontFamily: fonts.mono, fontSize: 12, color: colors.blue600, marginBottom: 4 },
  subjectName: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.ink900, marginBottom: 4 },
  subjectMeta: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500 },

  advisoryCard: {
    backgroundColor: '#fff',
    borderRadius: radius.md,
    borderWidth: hairline,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  advisoryLeft: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EBF2FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  advisoryEmoji: { fontSize: 22 },
  advisoryTitle: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.ink900 },
  advisoryMeta: { fontFamily: fonts.sans, fontSize: 13, color: colors.ink500, marginTop: 2 },
  advisoryArrow: { fontFamily: fonts.sansMedium, fontSize: 18, color: colors.ink300 },
});
