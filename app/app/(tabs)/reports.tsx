import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Chip, Eyebrow, Progress } from '../../src/components/atoms';
import { colors, fonts, radius, space, hairline } from '../../src/theme';
import { status } from '../../src/lib/attendance';
import { useAuth } from '../../src/lib/auth';
import { getSettings, listMarks, listCourses, listProfiles, ExamMark, Course, Profile, getDepartmentAttendanceSummary, DeptAttendanceSummary, listCourseDurations, CourseDuration } from '../../src/lib/db';
import { generateRollListCsv, generateConsolidatedAttendanceCsv, generateAttendancePivotCsv, generateConsolidatedMarksCsv, generateAbsenteesListCsv, generateStudentsBelow75Csv, generateCourseWiseAttendanceSummaryCsv, generateSessionalAttendanceCsv, generateAttendanceShortageWarningCsv, generateUniversityExamResultAnalysisCsv, generatePOAttainmentCsv } from '../../src/lib/reports';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';

// exports const removed as it was broken

const teacherReports = [
  { id: 'rollList', title: 'Student Roll List', actionText: 'Download Report', type: 'download', color: colors.coral600 },
  { id: 'attendancePivot', title: 'Students Attendance Report (Student vs Date)', actionText: 'Configure & Download', type: 'configure', color: colors.blue600 },
  { id: 'attendancePivotFull', title: 'Students Attendance Report (Student vs Date, Session, Course)', actionText: 'Configure & Download', type: 'configure', color: colors.blue600 },
  { id: 'consolidated', title: 'Consolidated Statement of Course Attendance', actionText: 'Configure & Download', type: 'configure', color: colors.blue600 },
  { id: 'progressCard', title: 'Students Individual Activity Report (Progress Card)', actionText: 'Configure & Download', type: 'configure', color: colors.blue600 },
  { id: 'assessmentMarks', title: 'Statement of Assessment Marks With Result Analysis', actionText: 'Download Report', type: 'download', color: colors.coral600 },
  { id: 'internalMarks', title: 'Consolidated Statement of Internal Marks', actionText: 'Configure & Download', type: 'configure', color: colors.blue600 },
  { id: 'universityExams', title: 'University Exams Result Analysis', actionText: 'Configure & Download', type: 'configure', color: colors.blue600 },
  { id: 'poAttainment', title: 'PO Attainment Report (Programme Batch)', actionText: 'Download Report', type: 'download', color: colors.coral600 },
  { id: 'absentees', title: 'Absentees List (Date-wise)', actionText: 'Download Report', type: 'download', color: colors.coral600 },
  { id: 'below75', title: 'Students Below 75% Attendance', actionText: 'Download Report', type: 'download', color: colors.coral600 },
  { id: 'courseWise', title: 'Course-wise Attendance Summary (Batch)', actionText: 'Download Report', type: 'download', color: colors.coral600 },
  { id: 'sessional', title: 'Sessional Attendance Report', actionText: 'Download Report', type: 'download', color: colors.coral600 },
  { id: 'shortage', title: 'Attendance Shortage Warning (Batch)', actionText: 'Download Report', type: 'download', color: colors.coral600 },
  { id: 'editAttendance', title: 'Edit Classes Attendance', actionText: 'View/Edit', type: 'view', color: colors.blue600 },
  { id: 'monitoring', title: 'Attendance Monitoring', actionText: 'Configure & view', type: 'view', color: colors.blue600 },
];

const subjectsStats = [
  { name: 'B.Tech CSE - 2022', code: 'Batch', pct: 84, safe: 102, watch: 12, risk: 6 },
  { name: 'B.Tech CSE & AI - 2023', code: 'Batch', pct: 79, safe: 40, watch: 12, risk: 8 },
  { name: 'BCA - 2024', code: 'Batch', pct: 81, safe: 45, watch: 10, risk: 5 },
];

export default function Reports() {
  const insets = useSafeAreaInsets();
  const { role, user } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  
  const router = useRouter();
  
  // Admin state
  const [totalExams, setTotalExams] = useState('2');
  const [summaries, setSummaries] = useState<DeptAttendanceSummary[]>([]);
  
  // Teacher state
  const [courseDurations, setCourseDurations] = useState<CourseDuration[]>([]);
  const [selectedCD, setSelectedCD] = useState<CourseDuration | null>(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({ totalSeriesExams: 2 });

  useEffect(() => {
    getSettings().then(s => {
      setSettings(s);
      setTotalExams(s.totalSeriesExams.toString());
    });
    if (role === 'teacher' && user) {
      listCourseDurations({ facultyId: user.id }).then(cds => {
        setCourseDurations(cds);
        if (cds.length > 0) setSelectedCD(cds[0]);
      });
    } else if (role === 'admin' && user) {
      getDepartmentAttendanceSummary().then(setSummaries);
      listCourseDurations().then(cds => {
        setCourseDurations(cds);
        if (cds.length > 0) setSelectedCD(cds[0]);
      });
    }
  }, [role, user]);

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

  const handleTeacherReport = async (reportId: string) => {
    if (!selectedCD) {
      Alert.alert('Please select a course');
      return;
    }

    try {
      if (reportId === 'rollList') {
        await generateRollListCsv(selectedCD.batchId, selectedCD.batchName || 'Batch');
      } else if (reportId === 'attendancePivot') {
        await generateAttendancePivotCsv(selectedCD.id, selectedCD.courseName);
      } else if (reportId === 'attendancePivotFull') {
        await generateAttendancePivotCsv(selectedCD.id, selectedCD.courseName + '_Full');
      } else if (reportId === 'consolidated') {
        await generateConsolidatedAttendanceCsv(selectedCD.id, selectedCD.courseName);
      } else if (reportId === 'progressCard' || reportId === 'assessmentMarks' || reportId === 'internalMarks') {
        await generateConsolidatedMarksCsv(selectedCD.id, selectedCD.courseName, settings.totalSeriesExams);
      } else if (reportId === 'absentees') {
        await generateAbsenteesListCsv(selectedCD.id, selectedCD.courseName);
      } else if (reportId === 'below75') {
        await generateStudentsBelow75Csv(selectedCD.id, selectedCD.courseName);
      } else if (reportId === 'courseWise') {
        await generateCourseWiseAttendanceSummaryCsv(selectedCD.batchId, selectedCD.batchName || 'Batch');
      } else if (reportId === 'sessional') {
        await generateSessionalAttendanceCsv(selectedCD.id, selectedCD.courseName);
      } else if (reportId === 'shortage') {
        await generateAttendanceShortageWarningCsv(selectedCD.batchId, selectedCD.batchName || 'Batch');
      } else if (reportId === 'universityExams') {
        await generateUniversityExamResultAnalysisCsv(selectedCD.id, selectedCD.courseName);
      } else if (reportId === 'poAttainment') {
        await generatePOAttainmentCsv(selectedCD.id, selectedCD.courseName);
      } else if (reportId === 'editAttendance') {
        router.push(`/edit-attendance/${selectedCD.id}` as any);
      } else {
        if (Platform.OS === 'web') window.alert('This report is not yet implemented.');
        else Alert.alert('Coming Soon', 'This report is not yet implemented.');
      }
    } catch (e: any) {
      if (Platform.OS === 'web') window.alert(e.message || 'Error generating report');
      else Alert.alert('Error', e.message || 'Error generating report');
    }
  };

  // Shared Report Generator UI
  const ReportGenerator = (
    <>
        <View>
          <Eyebrow>1. Select Course/Batch</Eyebrow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm, marginTop: space.sm }}>
            {courseDurations.map(cd => (
              <TouchableOpacity key={cd.id} onPress={() => setSelectedCD(cd)} style={[styles.tabBtn, selectedCD?.id === cd.id && styles.tabBtnActive]}>
                <Text style={[styles.tabBtnText, selectedCD?.id === cd.id && styles.tabBtnTextActive]}>
                  {cd.courseName} ({cd.batchName})
                </Text>
              </TouchableOpacity>
            ))}
            {courseDurations.length === 0 && (
              <Text style={{ fontFamily: fonts.sans, color: colors.ink500 }}>No classes found.</Text>
            )}
          </ScrollView>
        </View>

        <View>
          <Eyebrow>2. Generate Report</Eyebrow>
          <Card style={{ padding: 0, overflow: 'hidden', marginTop: space.sm }}>
            <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceAlt, padding: space.md, borderBottomWidth: hairline, borderColor: colors.border }}>
              <Text style={{ flex: 1, fontFamily: fonts.sansMedium, color: colors.ink900 }}>Report Type</Text>
              <Text style={{ width: 150, fontFamily: fonts.sansMedium, color: colors.ink900, textAlign: 'right' }}>Action</Text>
            </View>
            {teacherReports.map((tr, i) => (
              <View key={tr.id} style={{ flexDirection: 'row', alignItems: 'center', padding: space.md, borderBottomWidth: i < teacherReports.length - 1 ? hairline : 0, borderColor: colors.border }}>
                <Text style={{ flex: 1, fontFamily: fonts.sans, fontSize: 13, color: colors.ink900 }}>
                  {tr.title}
                </Text>
                <TouchableOpacity onPress={() => handleTeacherReport(tr.id)} style={{ width: 150, alignItems: 'flex-end' }}>
                  <Text style={{ fontFamily: fonts.sansMedium, fontSize: 12, color: tr.color }}>
                    {tr.actionText}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </Card>
        </View>
    </>
  );

  if (role === 'teacher') {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.surfaceAlt }} contentContainerStyle={[{ paddingTop: insets.top + space.lg, paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.lg }, isDesktop && { maxWidth: 720, alignSelf: 'center' as const, width: '100%', paddingHorizontal: 32 }]}>
        <View>
          <Eyebrow>Faculty Reports</Eyebrow>
          <Text style={styles.h1}>Downloads & Exports</Text>
        </View>
        {ReportGenerator}
      </ScrollView>
    );
  }

  // Admin View
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surfaceAlt }} contentContainerStyle={[{ paddingTop: insets.top + space.lg, paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.lg }, isDesktop && { maxWidth: 720, alignSelf: 'center' as const, width: '100%', paddingHorizontal: 32 }]}>
      <View>
        <Eyebrow>College of Engineering Kottarakkara</Eyebrow>
        <Text style={styles.h1}>Reports</Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
         <Eyebrow>Global Department Attendance</Eyebrow>
         <TouchableOpacity onPress={handleExport} style={styles.saveBtn}>
           <Text style={{ color: '#fff', fontSize: 12, fontFamily: fonts.sansMedium }}>Download CSV</Text>
         </TouchableOpacity>
      </View>
      
      {ReportGenerator}

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
