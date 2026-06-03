import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Chip, Eyebrow, Progress } from '../../src/components/atoms';
import { colors, fonts, radius, space, hairline } from '../../src/theme';
import { status } from '../../src/lib/attendance';
import { useAuth } from '../../src/lib/auth';
import { getSettings, listMarks, listCourses, listProfiles, ExamMark, Course, Profile } from '../../src/lib/db';

const exports = [
  { label: 'Course attendance', sub: 'CSV · all subjects', bg: colors.blue50, fg: colors.blue900 },
  { label: 'At-risk cohort', sub: 'PDF · below 75%', bg: colors.coral50, fg: colors.coral900 },
  { label: 'Monthly summary', sub: 'PDF · April', bg: '#fff', fg: colors.ink900, bordered: true },
  { label: 'NAAC attainment', sub: 'XLSX · OBE ready', bg: '#fff', fg: colors.ink900, bordered: true },
];

const subjectsStats = [
  { name: 'B.Tech CSE - 2022', code: 'Batch', pct: 84, safe: 102, watch: 12, risk: 6 },
  { name: 'B.Tech CSE & AI - 2023', code: 'Batch', pct: 79, safe: 40, watch: 12, risk: 8 },
  { name: 'BCA - 2024', code: 'Batch', pct: 81, safe: 45, watch: 10, risk: 5 },
];

export default function Reports() {
  const insets = useSafeAreaInsets();
  const { role, user } = useAuth();
  
  // Admin state
  const [totalExams, setTotalExams] = useState('2');
  
  // Teacher state
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [students, setStudents] = useState<Profile[]>([]);
  const [marks, setMarks] = useState<ExamMark[]>([]);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({ totalSeriesExams: 2 });

  useEffect(() => {
    getSettings().then(s => {
      setSettings(s);
      setTotalExams(s.totalSeriesExams.toString());
    });
    if (role === 'teacher' && user) {
      listCourses({ teacherId: user.id }).then(c => {
        setCourses(c);
        if (c.length > 0) setSelectedCourse(c[0].id);
      });
    }
  }, [role, user]);

  useEffect(() => {
    if (role === 'teacher' && selectedCourse) {
      setLoading(true);
      const course = courses.find(c => c.id === selectedCourse);
      if (course && course.batchIds && course.batchIds.length > 0) {
        Promise.all([
          listProfiles({ batchId: course.batchIds[0] }),
          listMarks({ courseId: selectedCourse })
        ]).then(([profs, mks]) => {
          setStudents(profs);
          setMarks(mks);
          setLoading(false);
        });
      } else {
        setStudents([]);
        setMarks([]);
        setLoading(false);
      }
    }
  }, [selectedCourse, role, courses]);

  if (role === 'teacher') {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.surfaceAlt }} contentContainerStyle={{ paddingTop: insets.top + space.lg, paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.lg }}>
        <View>
          <Eyebrow>Faculty Reports</Eyebrow>
          <Text style={styles.h1}>Marks & Attendance</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
          {courses.map(c => (
            <TouchableOpacity key={c.id} onPress={() => setSelectedCourse(c.id)} style={[styles.tabBtn, selectedCourse === c.id && styles.tabBtnActive]}>
              <Text style={[styles.tabBtnText, selectedCourse === c.id && styles.tabBtnTextActive]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Card>
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, { flex: 2 }]}>Student</Text>
            <Text style={[styles.cell, { flex: 1, textAlign: 'center' }]}>Att %</Text>
            {Array.from({ length: settings.totalSeriesExams }).map((_, i) => (
              <Text key={i} style={[styles.cell, { flex: 1, textAlign: 'center' }]}>S{i + 1}</Text>
            ))}
          </View>
          {loading ? <ActivityIndicator style={{ margin: space.xl }} color={colors.blue600} /> : (
            students.map((s, idx) => {
              // Mock attendance for demo based on index
              const att = [82, 95, 76, 68, 88, 91, 74][idx % 7];
              return (
                <View key={s.id} style={styles.tableRow}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.cellName}>{s.name}</Text>
                    <Text style={styles.cellReg}>{s.reg ?? '—'}</Text>
                  </View>
                  <Text style={[styles.cell, { flex: 1, textAlign: 'center', color: att < 75 ? colors.coral600 : colors.ink900 }]}>{att}%</Text>
                  {Array.from({ length: settings.totalSeriesExams }).map((_, i) => {
                    const mk = marks.find(m => m.studentId === s.userId && m.seriesNumber === i + 1);
                    return <Text key={i} style={[styles.cell, { flex: 1, textAlign: 'center' }]}>{mk ? `${mk.marksObtained}/${mk.maxMarks}` : '—'}</Text>;
                  })}
                </View>
              );
            })
          )}
        </Card>
      </ScrollView>
    );
  }

  // Admin View
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surfaceAlt }} contentContainerStyle={{ paddingTop: insets.top + space.lg, paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.lg }}>
      <View>
        <Eyebrow>College of Engineering Kottarakkara</Eyebrow>
        <Text style={styles.h1}>Reports</Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {exports.map(e => (
          <View key={e.label} style={[styles.exportCard, { backgroundColor: e.bg, borderWidth: e.bordered ? 0.5 : 0, borderColor: colors.border }]}>
            <Text style={[styles.exportIcon, { color: e.fg }]}>↓</Text>
            <Text style={[styles.exportLabel, { color: e.fg }]}>{e.label}</Text>
            <Text style={[styles.exportSub, { color: e.fg, opacity: 0.75 }]}>{e.sub}</Text>
          </View>
        ))}
      </View>
      
      <View>
        <Eyebrow>Global Settings</Eyebrow>
        <View style={{ height: space.sm }} />
        <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={styles.sName}>Total Series Exams</Text>
            <Text style={styles.sCode}>Applied to all batches</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <TextInput 
              style={styles.settingInput} 
              value={totalExams} 
              onChangeText={setTotalExams} 
              keyboardType="number-pad"
            />
            <TouchableOpacity style={styles.saveBtn} onPress={() => Alert.alert('Saved', 'Settings updated globally')}>
              <Text style={{ color: '#fff', fontSize: 12, fontFamily: fonts.sansMedium }}>Save</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>

      <View>
        <Eyebrow>Batch averages</Eyebrow>
        <View style={{ height: space.sm }} />
        <Card style={{ gap: space.lg }}>
          {subjectsStats.map((s, i) => {
            const st = status(s.pct);
            return (
              <View key={s.name} style={{ gap: space.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sName}>{s.name}</Text>
                  </View>
                  <Chip label={`${s.pct}%`} variant={st} dot />
                </View>
                <Progress value={s.pct} color={st === 'risk' ? colors.coral400 : st === 'warn' ? '#E2A53A' : colors.blue600} />
                <Text style={styles.dist}>Safe {s.safe}  Watch {s.watch}  Risk {s.risk}</Text>
                {i < subjectsStats.length - 1 && <View style={{ height: 0.5, backgroundColor: colors.border, marginTop: space.sm }} />}
              </View>
            );
          })}
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  h1: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.ink900, marginTop: space.xs },
  exportCard: { width: '48%', borderRadius: radius.lg, padding: space.lg, gap: 4 },
  exportIcon: { fontSize: 18, fontFamily: fonts.sansMedium },
  exportLabel: { fontFamily: fonts.sansMedium, fontSize: 14, marginTop: space.sm },
  exportSub: { fontFamily: fonts.sans, fontSize: 12 },
  sName: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink900 },
  sCode: { fontFamily: fonts.mono, fontSize: 11, color: colors.ink500, marginTop: 2 },
  dist: { fontFamily: fonts.mono, fontSize: 11, color: colors.ink500 },
  
  // Teacher styles
  tabBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: '#fff', borderWidth: hairline, borderColor: colors.border },
  tabBtnActive: { backgroundColor: colors.ink900, borderColor: colors.ink900 },
  tabBtnText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink700 },
  tabBtnTextActive: { color: '#fff' },
  tableHeader: { flexDirection: 'row', paddingBottom: space.sm, borderBottomWidth: hairline, borderBottomColor: colors.border, marginBottom: space.sm },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.sm, borderBottomWidth: hairline, borderBottomColor: colors.surfaceAlt },
  cell: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink500 },
  cellName: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink900 },
  cellReg: { fontFamily: fonts.mono, fontSize: 11, color: colors.ink500, marginTop: 2 },
  
  // Admin settings styles
  settingInput: { borderWidth: hairline, borderColor: colors.border, borderRadius: radius.sm, width: 40, height: 32, textAlign: 'center', fontFamily: fonts.sansMedium, color: colors.ink900 },
  saveBtn: { backgroundColor: colors.blue600, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.sm },
});
