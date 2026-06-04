import { supabase } from './supabase';
import { Platform, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function downloadCsv(csvContent: string, fileName: string) {
  if (Platform.OS === 'web') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    const fileUri = (FileSystem as any).documentDirectory + fileName;
    await (FileSystem as any).writeAsStringAsync(fileUri, csvContent, { encoding: (FileSystem as any).EncodingType.UTF8 });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      Alert.alert('Download Ready', `File saved to ${fileUri}`);
    }
  }
}

// 1. Student Roll List
export async function generateRollListCsv(batchId: string, batchName: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('name, reg, email')
    .eq('batch_id', batchId)
    .order('name');
  
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('No students found in this batch.');
  
  const headers = ['Register Number', 'Name', 'Email'];
  const rows = data.map(d => [d.reg || '', `"${d.name}"`, d.email]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  await downloadCsv(csv, `RollList_${batchName.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
}

// 2. Consolidated Statement of Course Attendance
export async function generateConsolidatedAttendanceCsv(courseDurationId: string, courseName: string) {
  const { data, error } = await supabase
    .from('attendance_entries')
    .select(`
      status,
      student_id,
      profiles!student_id(name, reg),
      attendance_records!inner(course_duration_id)
    `)
    .eq('attendance_records.course_duration_id', courseDurationId);
    
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('No attendance records found for this course.');

  const studentMap: Record<string, { name: string, reg: string, present: number, total: number }> = {};
  data.forEach((entry: any) => {
    const sid = entry.student_id;
    if (!studentMap[sid]) {
      studentMap[sid] = { name: entry.profiles.name, reg: entry.profiles.reg, present: 0, total: 0 };
    }
    studentMap[sid].total++;
    if (entry.status === 'present') studentMap[sid].present++;
  });

  const headers = ['Register Number', 'Name', 'Total Conducted', 'Total Attended', 'Percentage'];
  const rows = Object.values(studentMap)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(s => [
      s.reg || '',
      `"${s.name}"`,
      s.total,
      s.present,
      s.total > 0 ? ((s.present / s.total) * 100).toFixed(2) + '%' : '0%'
    ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  await downloadCsv(csv, `Consolidated_Attendance_${courseName.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
}

// 3. Students Attendance Report (Student vs Date)
export async function generateAttendancePivotCsv(courseDurationId: string, courseName: string) {
  const { data: records, error: recordsError } = await supabase
    .from('attendance_records')
    .select('id, session_date')
    .eq('course_duration_id', courseDurationId)
    .order('session_date');
    
  if (recordsError) throw recordsError;
  if (!records || records.length === 0) throw new Error('No attendance records found for this course.');

  const recordIds = records.map(r => r.id);
  const dateHeaders = records.map(r => r.session_date);

  const { data: entries, error: entriesError } = await supabase
    .from('attendance_entries')
    .select('attendance_record_id, student_id, status, profiles!student_id(name, reg)')
    .in('attendance_record_id', recordIds);
    
  if (entriesError) throw entriesError;

  const studentMap: Record<string, { name: string, reg: string, statuses: Record<string, string> }> = {};
  entries.forEach((e: any) => {
    const sid = e.student_id;
    if (!studentMap[sid]) {
      studentMap[sid] = { name: e.profiles.name, reg: e.profiles.reg, statuses: {} };
    }
    studentMap[sid].statuses[e.attendance_record_id] = e.status === 'present' ? 'P' : 'A';
  });

  const headers = ['Register Number', 'Name', ...dateHeaders];
  const rows = Object.values(studentMap)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(s => {
      const statuses = records.map(r => s.statuses[r.id] || '-');
      return [s.reg || '', `"${s.name}"`, ...statuses];
    });

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  await downloadCsv(csv, `Attendance_Pivot_${courseName.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
}

// 4. Consolidated Statement of Internal Marks
export async function generateConsolidatedMarksCsv(courseDurationId: string, courseName: string, totalSeries: number) {
  const { data: cd } = await supabase.from('course_durations').select('course_code, batch_id').eq('id', courseDurationId).single();
  if (!cd) throw new Error('Course duration not found');
  
  const { data: course } = await supabase.from('courses').select('id').eq('code', cd.course_code).single();
  if (!course) throw new Error('Course reference not found for this duration');

  const { data: marks, error } = await supabase
    .from('marks')
    .select('student_id, series_number, marks_obtained, max_marks, profiles!inner(name, reg)')
    .eq('course_id', course.id)
    .eq('batch_id', cd.batch_id);
  
  if (error) throw error;
  if (!marks || marks.length === 0) throw new Error('No internal marks found for this course.');

  const studentMap: Record<string, { name: string, reg: string, series: Record<number, { obtained: number, max: number }> }> = {};
  
  marks.forEach((m: any) => {
    const sid = m.student_id;
    if (!studentMap[sid]) {
      studentMap[sid] = { name: m.profiles.name, reg: m.profiles.reg, series: {} };
    }
    studentMap[sid].series[m.series_number] = { obtained: m.marks_obtained, max: m.max_marks };
  });

  const seriesHeaders = Array.from({ length: totalSeries }).map((_, i) => `Series ${i + 1}`);
  const headers = ['Register Number', 'Name', ...seriesHeaders, 'Total %'];

  const rows = Object.values(studentMap)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(s => {
      let totalObt = 0;
      let totalMax = 0;
      const seriesCols = Array.from({ length: totalSeries }).map((_, i) => {
        const sm = s.series[i + 1];
        if (sm) {
          totalObt += sm.obtained;
          totalMax += sm.max;
          return `${sm.obtained}/${sm.max}`;
        }
        return '-';
      });
      const pct = totalMax > 0 ? ((totalObt / totalMax) * 100).toFixed(2) + '%' : '0%';
      return [s.reg || '', `"${s.name}"`, ...seriesCols, pct];
    });

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  await downloadCsv(csv, `Internal_Marks_${courseName.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
}

// 5. Absentees List (Date-wise)
export async function generateAbsenteesListCsv(courseDurationId: string, courseName: string) {
  const { data: records, error: recordsError } = await supabase
    .from('attendance_records')
    .select('id, session_date')
    .eq('course_duration_id', courseDurationId)
    .order('session_date');
    
  if (recordsError) throw recordsError;
  if (!records || records.length === 0) throw new Error('No attendance records found.');

  const { data: entries, error: entriesError } = await supabase
    .from('attendance_entries')
    .select('attendance_record_id, student_id, status, profiles!student_id(name, reg)')
    .in('attendance_record_id', records.map(r => r.id))
    .eq('status', 'absent');
    
  if (entriesError) throw entriesError;

  const dateMap: Record<string, string[]> = {};
  records.forEach(r => dateMap[r.id] = []);
  
  entries.forEach((e: any) => {
    dateMap[e.attendance_record_id].push(`${e.profiles.name} (${e.profiles.reg || '-'})`);
  });

  const headers = ['Date', 'Total Absentees', 'Absentee Details'];
  const rows = records.map(r => [
    r.session_date,
    dateMap[r.id].length,
    `"${dateMap[r.id].join(', ')}"`
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  await downloadCsv(csv, `Absentees_List_${courseName.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
}

// 6. Students Below 75%
export async function generateStudentsBelow75Csv(courseDurationId: string, courseName: string) {
  const { data, error } = await supabase
    .from('attendance_entries')
    .select('status, student_id, profiles!student_id(name, reg), attendance_records!inner(course_duration_id)')
    .eq('attendance_records.course_duration_id', courseDurationId);
    
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('No attendance records found.');

  const studentMap: Record<string, { name: string, reg: string, present: number, total: number }> = {};
  data.forEach((entry: any) => {
    const sid = entry.student_id;
    if (!studentMap[sid]) {
      studentMap[sid] = { name: entry.profiles.name, reg: entry.profiles.reg, present: 0, total: 0 };
    }
    studentMap[sid].total++;
    if (entry.status === 'present') studentMap[sid].present++;
  });

  const headers = ['Register Number', 'Name', 'Total Conducted', 'Total Attended', 'Percentage'];
  const rows = Object.values(studentMap)
    .filter(s => s.total > 0 && (s.present / s.total) < 0.75)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(s => [
      s.reg || '',
      `"${s.name}"`,
      s.total,
      s.present,
      ((s.present / s.total) * 100).toFixed(2) + '%'
    ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  await downloadCsv(csv, `Below_75_List_${courseName.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
}

// 7. Course-wise Attendance Summary (Batch)
export async function generateCourseWiseAttendanceSummaryCsv(batchId: string, batchName: string) {
  const { data: cds, error: cdError } = await supabase.from('course_durations').select('id, course_code, course_name').eq('batch_id', batchId);
  if (cdError) throw cdError;
  if (!cds || cds.length === 0) throw new Error('No courses found for this batch.');

  const { data: entries, error: entriesError } = await supabase
    .from('attendance_entries')
    .select('status, student_id, profiles!student_id(name, reg), attendance_records!inner(course_duration_id)')
    .in('attendance_records.course_duration_id', cds.map(c => c.id));
    
  if (entriesError) throw entriesError;

  const studentMap: Record<string, { name: string, reg: string, courses: Record<string, { present: number, total: number }> }> = {};
  entries.forEach((e: any) => {
    const sid = e.student_id;
    const cid = e.attendance_records.course_duration_id;
    if (!studentMap[sid]) {
      studentMap[sid] = { name: e.profiles.name, reg: e.profiles.reg, courses: {} };
    }
    if (!studentMap[sid].courses[cid]) {
      studentMap[sid].courses[cid] = { present: 0, total: 0 };
    }
    studentMap[sid].courses[cid].total++;
    if (e.status === 'present') studentMap[sid].courses[cid].present++;
  });

  const headers = ['Register Number', 'Name', ...cds.map(c => c.course_code)];
  const rows = Object.values(studentMap)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(s => {
      const courseCols = cds.map(c => {
        const cStats = s.courses[c.id];
        if (!cStats || cStats.total === 0) return '-';
        return ((cStats.present / cStats.total) * 100).toFixed(2) + '%';
      });
      return [s.reg || '', `"${s.name}"`, ...courseCols];
    });

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  await downloadCsv(csv, `Course_Wise_Attendance_${batchName.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
}

// 8. Sessional Attendance Report (For a Course)
export async function generateSessionalAttendanceCsv(courseDurationId: string, courseName: string) {
  const { data: records, error: recordsError } = await supabase
    .from('attendance_records')
    .select('id, session_date, topic, delivery_method')
    .eq('course_duration_id', courseDurationId)
    .order('session_date');
    
  if (recordsError) throw recordsError;
  if (!records || records.length === 0) throw new Error('No attendance records found.');

  const headers = ['Date', 'Topic', 'Delivery Method', 'Total Students', 'Present', 'Absent'];
  const { data: entries, error: entriesError } = await supabase
    .from('attendance_entries')
    .select('attendance_record_id, status')
    .in('attendance_record_id', records.map(r => r.id));
    
  if (entriesError) throw entriesError;

  const statsMap: Record<string, { present: number, absent: number }> = {};
  records.forEach(r => statsMap[r.id] = { present: 0, absent: 0 });
  entries.forEach((e: any) => {
    if (e.status === 'present') statsMap[e.attendance_record_id].present++;
    else statsMap[e.attendance_record_id].absent++;
  });

  const rows = records.map(r => [
    r.session_date,
    `"${r.topic || ''}"`,
    r.delivery_method || '',
    statsMap[r.id].present + statsMap[r.id].absent,
    statsMap[r.id].present,
    statsMap[r.id].absent
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  await downloadCsv(csv, `Sessional_Attendance_${courseName.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
}

// 9. Attendance Shortage Warning (Batch)
export async function generateAttendanceShortageWarningCsv(batchId: string, batchName: string) {
  const { data: entries, error: entriesError } = await supabase
    .from('attendance_entries')
    .select('status, student_id, profiles!student_id(name, reg, email), attendance_records!inner(course_durations!inner(batch_id))')
    .eq('attendance_records.course_durations.batch_id', batchId);
    
  if (entriesError) throw entriesError;
  if (!entries || entries.length === 0) throw new Error('No attendance records found for this batch.');

  const studentMap: Record<string, { name: string, reg: string, email: string, present: number, total: number }> = {};
  entries.forEach((e: any) => {
    const sid = e.student_id;
    if (!studentMap[sid]) {
      studentMap[sid] = { name: e.profiles.name, reg: e.profiles.reg, email: e.profiles.email, present: 0, total: 0 };
    }
    studentMap[sid].total++;
    if (e.status === 'present') studentMap[sid].present++;
  });

  const headers = ['Register Number', 'Name', 'Email', 'Overall Percentage', 'Status'];
  const rows = Object.values(studentMap)
    .filter(s => s.total > 0 && (s.present / s.total) < 0.75)
    .sort((a, b) => (a.present / a.total) - (b.present / b.total))
    .map(s => [
      s.reg || '',
      `"${s.name}"`,
      s.email || '',
      ((s.present / s.total) * 100).toFixed(2) + '%',
      'Requires Warning'
    ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  await downloadCsv(csv, `Shortage_Warning_${batchName.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
}

// 10. University Exam Result Analysis
export async function generateUniversityExamResultAnalysisCsv(courseDurationId: string, courseName: string) {
  const { data: marks, error } = await supabase
    .from('university_marks')
    .select('grade, passed, student_id, profiles!student_id(name, reg)')
    .eq('course_duration_id', courseDurationId);
    
  if (error) throw error;
  if (!marks || marks.length === 0) throw new Error('No university marks found.');

  const headers = ['Register Number', 'Name', 'Grade', 'Status'];
  const rows = marks.map((m: any) => [
    m.profiles.reg || '',
    `"${m.profiles.name}"`,
    m.grade,
    m.passed ? 'PASS' : 'FAIL'
  ]);

  const total = marks.length;
  const passed = marks.filter((m: any) => m.passed).length;
  const passPct = ((passed / total) * 100).toFixed(2) + '%';
  
  const csv = [
    `Course: ${courseName}`,
    `Total Students: ${total}`,
    `Total Passed: ${passed}`,
    `Pass Percentage: ${passPct}`,
    '',
    headers.join(','), 
    ...rows.map(r => r.join(','))
  ].join('\n');
  
  await downloadCsv(csv, `University_Results_${courseName.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
}

// 11. PO Attainment Report
export async function generatePOAttainmentCsv(courseDurationId: string, courseName: string) {
  const { data: cos, error: coError } = await supabase.from('course_outcomes').select('id, co_code, description').eq('course_duration_id', courseDurationId);
  if (coError) throw coError;
  if (!cos || cos.length === 0) throw new Error('No COs found.');

  const { data: mappings, error: mapError } = await supabase.from('co_po_mapping')
    .select('course_outcome_id, correlation_level, program_outcomes(po_code, description)')
    .in('course_outcome_id', cos.map(c => c.id));
  if (mapError) throw mapError;

  const headers = ['Course Outcome', 'Program Outcome', 'PO Description', 'Correlation Level (1-3)'];
  const rows = mappings.map((m: any) => {
    const co = cos.find(c => c.id === m.course_outcome_id);
    return [
      co?.co_code || '',
      (m as any).program_outcomes.po_code,
      `"${(m as any).program_outcomes.description}"`,
      m.correlation_level
    ];
  });

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  await downloadCsv(csv, `PO_Attainment_${courseName.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
}
