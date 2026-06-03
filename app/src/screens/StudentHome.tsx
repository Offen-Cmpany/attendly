import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Chip, Eyebrow, Progress, Divider } from '../components/atoms';
import { useAuth } from '../lib/auth';
import { colors, fonts, radius, space, hairline } from '../theme';
import { getSettings, listMarks, ExamMark } from '../lib/db';

export default function StudentHome() {
  const { user, profile } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [semester, setSemester] = useState<number>(6);
  const [totalExams, setTotalExams] = useState(2);
  const [marks, setMarks] = useState<ExamMark[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.semester) setSemester(profile.semester);
    getSettings().then(s => setTotalExams(s.totalSeriesExams));
  }, [profile]);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      listMarks({ studentId: user.id }).then(res => {
        setMarks(res);
        setLoading(false);
      });
    }
  }, [user?.id]);

  // Attendance fetching will be added in a future backend PR
  const attendance = 0;

  // Group marks by course for the table
  const groupedMarks = marks.reduce((acc, m) => {
    if (!acc[m.courseId]) acc[m.courseId] = [];
    acc[m.courseId].push(m);
    return acc;
  }, {} as Record<string, ExamMark[]>);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surfaceAlt }} contentContainerStyle={{ paddingTop: insets.top + space.lg, paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View>
          <Eyebrow>Welcome back</Eyebrow>
          <Text style={styles.greeting}>{user?.name?.split(' ')[0] ?? 'Student'}</Text>
        </View>
        
        {/* Semester Toggle */}
        <View style={styles.semToggle}>
          {[5, 6].map(sem => (
            <TouchableOpacity 
              key={sem} 
              onPress={() => setSemester(sem)}
              style={[styles.semBtn, semester === sem && styles.semBtnActive]}
            >
              <Text style={[styles.semBtnText, semester === sem && styles.semBtnTextActive]}>S{sem}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Card>
        <Text style={styles.heroLabel}>Overall attendance (Semester {semester})</Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.sm, marginTop: space.xs }}>
          <Text style={styles.heroValue}>—</Text>
          <Text style={styles.heroUnit}>%</Text>
          <View style={{ flex: 1 }} />
          <Chip label="No Data" variant="neutral" dot />
        </View>
        <View style={{ height: space.md }} />
        <Progress value={0} color={colors.ink300} />
        <Text style={styles.heroFootnote}>
          Attendance data will be populated once classes begin.
        </Text>
      </Card>

      <View>
        <Eyebrow>Series Exam Marks</Eyebrow>
        <View style={{ height: space.sm }} />
        <Card>
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, { flex: 2 }]}>Subject</Text>
            {Array.from({ length: totalExams }).map((_, i) => (
              <Text key={i} style={[styles.cell, { flex: 1, textAlign: 'center' }]}>S{i + 1}</Text>
            ))}
          </View>
          
          {loading ? (
            <ActivityIndicator style={{ padding: space.xl }} color={colors.blue600} />
          ) : Object.keys(groupedMarks).length === 0 ? (
            <Text style={{ textAlign: 'center', padding: space.md, color: colors.ink500, fontFamily: fonts.sans }}>No marks recorded yet.</Text>
          ) : (
            Object.keys(groupedMarks).map((courseId, idx) => {
              const cMarks = groupedMarks[courseId];
              return (
                <View key={courseId}>
                  <View style={styles.tableRow}>
                    <View style={{ flex: 2 }}>
                      <Text style={styles.cellName}>{courseId}</Text>
                    </View>
                    {Array.from({ length: totalExams }).map((_, i) => {
                      const mk = cMarks.find(m => m.seriesNumber === i + 1);
                      return <Text key={i} style={[styles.cell, { flex: 1, textAlign: 'center' }]}>{mk ? `${mk.marksObtained}/${mk.maxMarks}` : '—'}</Text>;
                    })}
                  </View>
                  {idx < Object.keys(groupedMarks).length - 1 && <Divider />}
                </View>
              );
            })
          )}
        </Card>
      </View>

      <View>
        <Eyebrow>Today's classes</Eyebrow>
        <View style={{ height: space.sm }} />
        <Card style={{ padding: space.xl, alignItems: 'center' }}>
          <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: colors.ink500 }}>No classes scheduled for today.</Text>
        </Card>
      </View>

      <Link href="/updates" asChild>
        <Button title="View university updates" variant="secondary" />
      </Link>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  greeting: { fontSize: 28, fontFamily: fonts.displayBold, color: colors.ink900, marginTop: space.xs },
  
  semToggle: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: radius.pill, borderWidth: hairline, borderColor: colors.border, padding: 2 },
  semBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  semBtnActive: { backgroundColor: colors.blue600 },
  semBtnText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink500 },
  semBtnTextActive: { color: '#fff' },

  heroLabel: { fontSize: 13, fontFamily: fonts.sans, color: colors.ink500 },
  heroValue: { fontSize: 56, fontFamily: fonts.displayBold, color: colors.ink900, lineHeight: 60 },
  heroUnit: { fontSize: 20, fontFamily: fonts.sansMedium, color: colors.ink500 },
  heroFootnote: { fontSize: 12, fontFamily: fonts.sans, color: colors.ink500, marginTop: space.sm },
  
  time: { fontSize: 13, fontFamily: fonts.monoMedium, color: colors.ink700, width: 48 },
  classTitle: { fontSize: 14, fontFamily: fonts.sansMedium, color: colors.ink900 },
  classRoom: { fontSize: 12, fontFamily: fonts.sans, color: colors.ink500, marginTop: 2 },
  
  tableHeader: { flexDirection: 'row', paddingBottom: space.sm, borderBottomWidth: hairline, borderBottomColor: colors.border, marginBottom: space.sm },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.sm },
  cell: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink500 },
  cellName: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink900 },
});
