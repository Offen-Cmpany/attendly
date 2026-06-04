import React, { useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, useWindowDimensions, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Button, Card, Chip, Eyebrow, Progress, Divider } from '../components/atoms';
import { useAuth } from '../lib/auth';
import { colors, fonts, radius, space, hairline } from '../theme';
import { getStudentAttendanceSummary, AttendanceSummary, getStudentAttendanceDetail } from '../lib/db';

export default function StudentHome() {
  const { user, profile } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  
  const [summaries, setSummaries] = useState<AttendanceSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Drill-down Modal State
  const [selectedCourse, setSelectedCourse] = useState<AttendanceSummary | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [sessionDetails, setSessionDetails] = useState<{ date: string; topic?: string; status: string }[]>([]);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await getStudentAttendanceSummary(user.id);
      setSummaries(data);
    } catch (err) {
      console.error('Failed to fetch attendance summary:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const openCourseDetail = async (course: AttendanceSummary) => {
    setSelectedCourse(course);
    setDetailLoading(true);
    try {
      const details = await getStudentAttendanceDetail(user!.id, course.courseDurationId);
      setSessionDetails(details);
    } catch (err) {
      console.error('Failed to fetch session detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedCourse(null);
    setSessionDetails([]);
  };

  // Calculate overall attendance
  const totalSessions = summaries.reduce((acc, curr) => acc + curr.totalSessions, 0);
  const totalPresent = summaries.reduce((acc, curr) => acc + curr.presentCount, 0);
  const overallPercentage = totalSessions > 0 ? Math.round((totalPresent / totalSessions) * 100) : 0;

  // Determine overall color
  const overallColor = overallPercentage >= 75 ? colors.safeFg 
    : overallPercentage >= 65 ? colors.blue600 
    : colors.coral400;

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top + space.lg, paddingBottom: insets.bottom + space.xxl }, isDesktop && { maxWidth: 720, alignSelf: 'center' as const, width: '100%', paddingHorizontal: 32 }]}>
        <View style={styles.headerRow}>
          <View>
            <Eyebrow>Welcome back</Eyebrow>
            <Text style={styles.greeting}>{profile?.name?.split(' ')[0] ?? 'Student'}</Text>
          </View>
          <Chip label={profile?.semester ? `S${profile.semester}` : 'S-'} variant="neutral" />
        </View>

        {totalSessions > 0 && overallPercentage < 75 && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningBannerEmoji}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.warningBannerTitle}>Attendance Shortage</Text>
              <Text style={styles.warningBannerText}>Your overall attendance is below 75%. Please contact your class advisor.</Text>
            </View>
          </View>
        )}

        <Card>
          <Text style={styles.heroLabel}>Overall Attendance</Text>
          <View style={styles.heroRow}>
            <Text style={[styles.heroValue, totalSessions > 0 && { color: overallColor }]}>
              {totalSessions > 0 ? overallPercentage : '—'}
            </Text>
            <Text style={styles.heroUnit}>%</Text>
            <View style={{ flex: 1 }} />
            {totalSessions > 0 ? (
              <Chip 
                label={overallPercentage >= 75 ? 'Safe' : overallPercentage >= 65 ? 'Warning' : 'Critical'} 
                variant={overallPercentage >= 75 ? 'safe' : overallPercentage >= 65 ? 'warn' : 'risk'} 
                dot 
              />
            ) : (
              <Chip label="No Data" variant="neutral" />
            )}
          </View>
          <View style={{ height: space.md }} />
          <Progress 
            value={totalSessions > 0 ? overallPercentage : 0} 
            color={totalSessions > 0 ? overallColor : colors.ink300} 
          />
          <Text style={styles.heroFootnote}>
            {totalSessions > 0 
              ? `You have attended ${totalPresent} out of ${totalSessions} total sessions across all courses.` 
              : 'Attendance data will be populated once your faculty starts marking.'}
          </Text>
        </Card>

        <View>
          <Eyebrow>Course Attendance</Eyebrow>
          <View style={{ height: space.sm }} />
          
          {loading ? (
            <Card style={{ padding: space.xl, alignItems: 'center' }}>
              <ActivityIndicator color={colors.blue600} />
            </Card>
          ) : summaries.length === 0 ? (
            <Card style={{ padding: space.xl, alignItems: 'center' }}>
              <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: colors.ink500, textAlign: 'center' }}>
                No attendance records found yet.
              </Text>
            </Card>
          ) : (
            <View style={{ gap: space.md }}>
              {summaries.map(s => {
                const color = s.percentage >= 75 ? colors.safeFg : s.percentage >= 65 ? colors.blue600 : colors.coral400;
                return (
                  <TouchableOpacity key={s.courseDurationId} activeOpacity={0.7} onPress={() => openCourseDetail(s)}>
                    <Card style={{ gap: space.sm }}>
                      <View style={styles.courseRow}>
                        <View style={styles.courseLeft}>
                          <Text style={styles.courseCode}>{s.courseCode}</Text>
                          <Text style={styles.courseName}>{s.courseName}</Text>
                        </View>
                        <View style={styles.courseRight}>
                          <Text style={[styles.coursePct, { color }]}>{s.percentage}%</Text>
                        </View>
                      </View>
                      <Progress value={s.percentage} color={color} />
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                        <Text style={styles.courseFootnote}>{s.presentCount} / {s.totalSessions} sessions attended</Text>
                        <Text style={[styles.courseFootnote, { color: colors.blue600 }]}>View detail →</Text>
                      </View>
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

      </ScrollView>

      {/* Drill-down Modal */}
      <Modal visible={!!selectedCourse} animationType="slide" presentationStyle="formSheet" onRequestClose={closeDetail}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfaceAlt }} edges={['top']}>
          <View style={[styles.headerRow, { backgroundColor: colors.surface, padding: space.md, borderBottomWidth: hairline, borderColor: colors.border, marginBottom: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.courseCode}>{selectedCourse?.courseCode}</Text>
              <Text style={styles.courseName} numberOfLines={1}>{selectedCourse?.courseName}</Text>
            </View>
            <TouchableOpacity onPress={closeDetail} style={{ padding: space.sm }}>
              <Text style={{ fontFamily: fonts.sansMedium, color: colors.blue600 }}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: space.md }}>
            <Card style={{ marginBottom: space.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.heroLabel}>Course Attendance</Text>
                <Text style={[styles.coursePct, { color: selectedCourse?.percentage! >= 75 ? colors.safeFg : colors.coral400 }]}>
                  {selectedCourse?.percentage}%
                </Text>
              </View>
            </Card>

            <Eyebrow>Session History</Eyebrow>
            <View style={{ height: space.sm }} />

            {detailLoading ? (
              <ActivityIndicator color={colors.blue600} style={{ marginVertical: space.xl }} />
            ) : sessionDetails.length === 0 ? (
              <Text style={{ textAlign: 'center', margin: space.xl, color: colors.ink500, fontFamily: fonts.sans }}>
                No sessions recorded for this course.
              </Text>
            ) : (
              <Card style={{ padding: 0, overflow: 'hidden' }}>
                {sessionDetails.map((session, i) => (
                  <View key={i} style={[styles.sessionRow, i < sessionDetails.length - 1 && { borderBottomWidth: hairline, borderColor: colors.border }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sessionDate}>{new Date(session.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
                      {!!session.topic && <Text style={styles.sessionTopic}>{session.topic}</Text>}
                    </View>
                    <View style={[styles.statusBadge, session.status === 'present' ? styles.statusPresent : styles.statusAbsent]}>
                      <Text style={[styles.statusText, session.status === 'present' ? styles.statusTextPresent : styles.statusTextAbsent]}>
                        {session.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                ))}
              </Card>
            )}
            <View style={{ height: space.xxl }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceAlt },
  content: { paddingHorizontal: space.lg, gap: space.lg },
  
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: 28, fontFamily: fonts.displayBold, color: colors.ink900, marginTop: space.xs },
  
  warningBanner: {
    backgroundColor: colors.riskBg,
    borderRadius: radius.md,
    padding: space.md,
    flexDirection: 'row',
    gap: space.md,
    borderWidth: hairline,
    borderColor: colors.coral200,
  },
  warningBannerEmoji: { fontSize: 24 },
  warningBannerTitle: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.riskFg },
  warningBannerText: { fontFamily: fonts.sans, fontSize: 13, color: colors.riskFg, marginTop: 2, opacity: 0.9 },

  heroLabel: { fontSize: 13, fontFamily: fonts.sans, color: colors.ink500 },
  heroRow: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm, marginTop: space.xs },
  heroValue: { fontSize: 56, fontFamily: fonts.displayBold, color: colors.ink900, lineHeight: 60 },
  heroUnit: { fontSize: 20, fontFamily: fonts.sansMedium, color: colors.ink500 },
  heroFootnote: { fontSize: 12, fontFamily: fonts.sans, color: colors.ink500, marginTop: space.sm },
  
  courseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  courseLeft: { flex: 1, paddingRight: space.md },
  courseCode: { fontSize: 11, fontFamily: fonts.monoMedium, color: colors.ink500, marginBottom: 2 },
  courseName: { fontSize: 15, fontFamily: fonts.sansMedium, color: colors.ink900 },
  courseRight: { alignItems: 'flex-end' },
  coursePct: { fontSize: 20, fontFamily: fonts.displayBold },
  courseFootnote: { fontSize: 12, fontFamily: fonts.sans, color: colors.ink500 },

  sessionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: space.md },
  sessionDate: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink900 },
  sessionTopic: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 2 },
  
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm },
  statusPresent: { backgroundColor: colors.safeBg },
  statusAbsent: { backgroundColor: colors.riskBg },
  statusText: { fontFamily: fonts.monoMedium, fontSize: 10 },
  statusTextPresent: { color: colors.safeFg },
  statusTextAbsent: { color: colors.riskFg },
});
