import { supabase } from './supabase';

export type Role = 'student' | 'teacher' | 'admin';
export type AdminDesignation = 'hod' | 'principal' | 'office_staff' | 'pending_staff';
export type Program = 'B.Tech CSE' | 'B.Tech CSE & AI' | 'BCA';

export type Profile = {
  id: string; // auth.users id
  userId?: string; // legacy support for UI
  name: string;
  email: string;
  role: Role;
  designation?: AdminDesignation | null;
  program?: Program;
  batchId?: string; // mapped from batch_id
  reg?: string;
  dept?: string;
  semester?: number;
  isClassAdvisor?: boolean; // mapped from is_class_advisor
  advisorBatchId?: string; // mapped from advisor_batch_id
};

function mapProfile(row: any): Profile {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    designation: row.designation,
    program: row.program,
    batchId: row.batch_id,
    reg: row.reg,
    dept: row.dept,
    semester: row.semester,
    isClassAdvisor: row.is_class_advisor,
    advisorBatchId: row.advisor_batch_id,
  };
}

export type Batch = {
  id: string;
  name: string;
  program: Program;
  year: number;
  section?: string;
  advisorId?: string; // mapped from advisor_id
  department: string;
};

function mapBatch(row: any): Batch {
  return {
    id: row.id,
    name: row.name,
    program: row.program,
    year: row.year,
    section: row.section,
    advisorId: row.advisor_id,
    department: row.department,
  };
}

export type Course = {
  id: string;
  code: string;
  name: string;
  credits: number;
  semester: number;
  program: Program;
  teacherId?: string;
  batchIds?: string[]; // for UI compatibility
};

function mapCourse(row: any): Course {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    credits: row.credits,
    semester: row.semester,
    program: row.program,
    teacherId: row.teacher_id,
  };
}

export type Module = {
  id: string;
  courseId: string;
  name: string;
  description?: string;
  order: number;
  status: 'upcoming' | 'in_progress' | 'completed';
};

function mapModule(row: any): Module {
  return {
    id: row.id,
    courseId: row.course_id,
    name: row.name,
    description: row.description,
    order: row.module_order,
    status: row.status,
  };
}

export type ExamMark = {
  id: string;
  studentId: string;
  courseId: string;
  batchId: string;
  seriesNumber: number;
  marksObtained: number;
  maxMarks: number;
};

function mapExamMark(row: any): ExamMark {
  return {
    id: row.id,
    studentId: row.student_id,
    courseId: row.course_id,
    batchId: row.batch_id,
    seriesNumber: row.series_number,
    marksObtained: row.marks_obtained,
    maxMarks: row.max_marks,
  };
}

export type EventDoc = {
  id: string;
  communityId: string;
  title: string;
  description?: string;
  type: string;
  date: string;
  location?: string;
  isDutyLeaveEligible?: boolean;
  organizerId: string;
};

export type Community = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  createdBy?: string;
};

export type Setting = {
  id: string;
  totalSeriesExams: number;
  currentSemester: number;
};

// ─── Profiles ────────────────────────────────────────────────────
export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error || !data) return null;
  return mapProfile(data);
}

export async function createProfile(input: Partial<Profile>): Promise<Profile> {
  const row = {
    id: input.id,
    name: input.name,
    email: input.email,
    role: input.role,
    designation: input.designation,
    program: input.program,
    batch_id: input.batchId,
    reg: input.reg,
    dept: input.dept,
    semester: input.semester,
  };
  const { data, error } = await supabase.from('profiles').insert(row).select().single();
  if (error) throw error;
  return mapProfile(data);
}

export async function updateProfile(profileId: string, data: Partial<Profile>): Promise<Profile | null> {
  const row: any = {};
  if (data.role) row.role = data.role;
  if (data.designation !== undefined) row.designation = data.designation;
  if (data.batchId !== undefined) row.batch_id = data.batchId;
  
  const { data: updated, error } = await supabase.from('profiles').update(row).eq('id', profileId).select().single();
  if (error || !updated) return null;
  return mapProfile(updated);
}

export async function listProfiles(filter?: { role?: Role; batchId?: string; program?: Program }): Promise<Profile[]> {
  let query = supabase.from('profiles').select('*').limit(100);
  if (filter?.role) query = query.eq('role', filter.role);
  if (filter?.batchId) query = query.eq('batch_id', filter.batchId);
  if (filter?.program) query = query.eq('program', filter.program);
  const { data } = await query;
  return (data || []).map(mapProfile);
}

// ─── Batches ─────────────────────────────────────────────────────
export async function listBatches(filter?: { program?: Program }): Promise<Batch[]> {
  let query = supabase.from('batches').select('*').limit(50);
  if (filter?.program) query = query.eq('program', filter.program);
  const { data } = await query;
  return (data || []).map(mapBatch);
}

export async function getBatch(batchId: string): Promise<Batch | null> {
  const { data } = await supabase.from('batches').select('*').eq('id', batchId).single();
  return data ? mapBatch(data) : null;
}

// ─── Courses ─────────────────────────────────────────────────────
export async function listCourses(filter?: { program?: Program; teacherId?: string; semester?: number }): Promise<Course[]> {
  let query = supabase.from('courses').select('*').limit(50);
  if (filter?.program) query = query.eq('program', filter.program);
  if (filter?.teacherId) query = query.eq('teacher_id', filter.teacherId);
  if (filter?.semester) query = query.eq('semester', filter.semester);
  const { data } = await query;
  return (data || []).map(mapCourse);
}

export async function getCourse(courseId: string): Promise<Course | null> {
  const { data } = await supabase.from('courses').select('*').eq('id', courseId).single();
  return data ? mapCourse(data) : null;
}

// ─── Modules ─────────────────────────────────────────────────────
export async function listModules(courseId: string): Promise<Module[]> {
  const { data } = await supabase.from('modules').select('*').eq('course_id', courseId).order('module_order', { ascending: true }).limit(50);
  return (data || []).map(mapModule);
}

// ─── Settings ────────────────────────────────────────────────────
export async function getSettings(): Promise<Setting> {
  const { data, error } = await supabase.from('settings').select('*').eq('id', 'global').single();
  if (error || !data) return { id: 'global', totalSeriesExams: 2, currentSemester: 6 };
  return { id: data.id, totalSeriesExams: data.total_series_exams, currentSemester: data.current_semester };
}

// ─── Marks ───────────────────────────────────────────────────────
export async function listMarks(filter?: { studentId?: string; courseId?: string }): Promise<ExamMark[]> {
  let query = supabase.from('marks').select('*').limit(100);
  if (filter?.studentId) query = query.eq('student_id', filter.studentId);
  if (filter?.courseId) query = query.eq('course_id', filter.courseId);
  const { data } = await query;
  return (data || []).map(mapExamMark);
}

export async function saveMarks(
  batchId: string,
  courseId: string,
  seriesNumber: number,
  maxMarks: number,
  entries: { studentId: string; marksObtained: number }[]
): Promise<void> {
  const rows = entries.map(e => ({
    student_id: e.studentId,
    course_id: courseId,
    batch_id: batchId,
    series_number: seriesNumber,
    marks_obtained: e.marksObtained,
    max_marks: maxMarks
  }));

  const { error } = await supabase.from('marks').upsert(rows, { onConflict: 'student_id,course_id,series_number' });
  if (error) throw new Error(error.message || 'Failed to save marks');
}

// ─── Course Durations (MVP Core) ─────────────────────────────────
export type CourseDuration = {
  id: string;
  courseCode: string;
  courseName: string;
  facultyId: string;
  batchId: string;
  semester: string;
  program?: string; // from joined batches
  facultyName?: string; // from joined profiles
  batchName?: string; // from joined batches
};

function mapCourseDuration(row: any): CourseDuration {
  return {
    id: row.id,
    courseCode: row.course_code,
    courseName: row.course_name,
    facultyId: row.faculty_id,
    batchId: row.batch_id,
    semester: row.semester,
    program: row.batches?.program,
    facultyName: row.profiles?.name,
    batchName: row.batches ? `${row.batches.program} ${row.batches.year} ${row.batches.section || ''}`.trim() : undefined,
  };
}

export async function listCourseDurations(filter?: { facultyId?: string }): Promise<CourseDuration[]> {
  let query = supabase.from('course_durations').select('*, profiles(name), batches(name, program, year, section)').limit(100);
  if (filter?.facultyId) query = query.eq('faculty_id', filter.facultyId);
  const { data, error } = await query;
  if (error) { console.error('listCourseDurations error:', error); return []; }
  return (data || []).map(mapCourseDuration);
}

export async function getCourseDuration(id: string): Promise<CourseDuration | null> {
  const { data, error } = await supabase.from('course_durations').select('*, profiles(name), batches(name, program, year, section)').eq('id', id).single();
  if (error || !data) return null;
  return mapCourseDuration(data);
}

export async function createCourseDuration(input: Omit<CourseDuration, 'id' | 'facultyName' | 'batchName'>): Promise<CourseDuration> {
  const { data, error } = await supabase.from('course_durations').insert({
    course_code: input.courseCode,
    course_name: input.courseName,
    faculty_id: input.facultyId,
    batch_id: input.batchId,
    semester: input.semester,
  }).select('*, profiles(name), batches(name, program, year, section)').single();
  if (error) throw error;
  return mapCourseDuration(data);
}

export async function deleteCourseDuration(id: string): Promise<void> {
  const { error } = await supabase.from('course_durations').delete().eq('id', id);
  if (error) throw error;
}

// ─── Attendance Records (MVP Core) ───────────────────────────────
export type AttendanceRecord = {
  id: string;
  courseDurationId: string;
  sessionDate: string;
  markedBy: string;
  topic?: string;
  deliveryMethod?: string;
  lockedAt?: string;
  // joined fields (optional)
  courseCode?: string;
  courseName?: string;
  batchName?: string;
  presentCount?: number;
  absentCount?: number;
};

function mapAttendanceRecord(row: any): AttendanceRecord {
  return {
    id: row.id,
    courseDurationId: row.course_duration_id,
    sessionDate: row.session_date,
    markedBy: row.marked_by,
    topic: row.topic,
    deliveryMethod: row.delivery_method,
    lockedAt: row.locked_at,
    courseCode: row.course_durations?.course_code,
    courseName: row.course_durations?.course_name,
    batchName: row.batch_name,
  };
}

export type AttendanceEntry = {
  id: string;
  attendanceRecordId: string;
  studentId: string;
  status: 'present' | 'absent';
};

/** Fetch students enrolled in a batch (for the marking screen) */
export async function listStudentsByBatch(batchId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .eq('batch_id', batchId)
    .order('name', { ascending: true })
    .limit(200);
  if (error) { console.error('listStudentsByBatch error:', error); return []; }
  return (data || []).map(mapProfile);
}

/**
 * Save an attendance session atomically.
 * Creates the attendance_record, then bulk-inserts attendance_entries.
 */
export async function saveAttendanceSession(
  courseDurationId: string,
  markedBy: string,
  entries: { studentId: string; status: 'present' | 'absent' }[],
  options?: { topic?: string; deliveryMethod?: string }
): Promise<AttendanceRecord> {
  // 1. Create the attendance record
  const { data: record, error: recErr } = await supabase
    .from('attendance_records')
    .insert({
      course_duration_id: courseDurationId,
      marked_by: markedBy,
      topic: options?.topic || null,
      delivery_method: options?.deliveryMethod || null,
    })
    .select()
    .single();

  if (recErr || !record) {
    throw new Error(recErr?.message || 'Failed to create attendance record');
  }

  // 2. Bulk-insert attendance entries
  const rows = entries.map(e => ({
    attendance_record_id: record.id,
    student_id: e.studentId,
    status: e.status,
  }));

  const { error: entryErr } = await supabase.from('attendance_entries').insert(rows);
  if (entryErr) {
    throw new Error(entryErr.message || 'Failed to save attendance entries');
  }

  return mapAttendanceRecord(record);
}

/** Fetch recent attendance records for a faculty member */
export async function listAttendanceRecords(filter?: {
  facultyId?: string;
  courseDurationId?: string;
  limit?: number;
}): Promise<AttendanceRecord[]> {
  let query = supabase
    .from('attendance_records')
    .select('*, course_durations(course_code, course_name)')
    .order('session_date', { ascending: false })
    .limit(filter?.limit || 20);

  if (filter?.facultyId) query = query.eq('marked_by', filter.facultyId);
  if (filter?.courseDurationId) query = query.eq('course_duration_id', filter.courseDurationId);

  const { data, error } = await query;
  if (error) { console.error('listAttendanceRecords error:', error); return []; }
  return (data || []).map(mapAttendanceRecord);
}

/** Get attendance summary for a student: % per course_duration */
export type AttendanceSummary = {
  courseDurationId: string;
  courseCode: string;
  courseName: string;
  totalSessions: number;
  presentCount: number;
  percentage: number;
};

export async function getStudentAttendanceSummary(studentId: string): Promise<AttendanceSummary[]> {
  // Get all entries for this student
  const { data: entries, error } = await supabase
    .from('attendance_entries')
    .select('status, attendance_records(id, course_duration_id, course_durations(course_code, course_name))')
    .eq('student_id', studentId);

  if (error || !entries) return [];

  // Aggregate by course_duration
  const map = new Map<string, { code: string; name: string; total: number; present: number }>();

  for (const entry of entries) {
    const rec = (entry as any).attendance_records;
    if (!rec) continue;
    const cd = rec.course_durations;
    const cdId = rec.course_duration_id;
    if (!cdId) continue;

    if (!map.has(cdId)) {
      map.set(cdId, {
        code: cd?.course_code || '',
        name: cd?.course_name || '',
        total: 0,
        present: 0,
      });
    }
    const agg = map.get(cdId)!;
    agg.total++;
    if (entry.status === 'present') agg.present++;
  }

  return Array.from(map.entries()).map(([cdId, agg]) => ({
    courseDurationId: cdId,
    courseCode: agg.code,
    courseName: agg.name,
    totalSessions: agg.total,
    presentCount: agg.present,
    percentage: agg.total > 0 ? Math.round((agg.present / agg.total) * 100) : 0,
  }));
}

/** Get session-by-session detail for a student in a specific course_duration */
export async function getStudentAttendanceDetail(
  studentId: string,
  courseDurationId: string
): Promise<{ date: string; topic?: string; status: string }[]> {
  const { data, error } = await supabase
    .from('attendance_entries')
    .select('status, attendance_records(session_date, topic, course_duration_id)')
    .eq('student_id', studentId);

  if (error || !data) return [];

  return data
    .filter((e: any) => e.attendance_records?.course_duration_id === courseDurationId)
    .map((e: any) => ({
      date: e.attendance_records.session_date,
      topic: e.attendance_records.topic,
      status: e.status,
    }))
    .sort((a: any, b: any) => b.date.localeCompare(a.date));
}

/** Department-wide attendance summary for HoD */
export type DeptAttendanceSummary = {
  courseDurationId: string;
  courseCode: string;
  courseName: string;
  facultyName: string;
  totalSessions: number;
  avgAttendance: number;
};

export async function getDepartmentAttendanceSummary(): Promise<DeptAttendanceSummary[]> {
  const { data: records, error } = await supabase
    .from('attendance_records')
    .select('id, course_duration_id, course_durations(course_code, course_name, faculty_id)');

  if (error || !records) return [];

  // Get all entries
  const { data: entries } = await supabase
    .from('attendance_entries')
    .select('attendance_record_id, status');

  if (!entries) return [];

  // Build entry counts per record
  const entryCounts = new Map<string, { total: number; present: number }>();
  for (const e of entries) {
    if (!entryCounts.has(e.attendance_record_id)) {
      entryCounts.set(e.attendance_record_id, { total: 0, present: 0 });
    }
    const c = entryCounts.get(e.attendance_record_id)!;
    c.total++;
    if (e.status === 'present') c.present++;
  }

  // Aggregate per course_duration
  const cdMap = new Map<string, { code: string; name: string; facultyId: string; sessions: number; totalPct: number }>();

  for (const rec of records) {
    const cd = (rec as any).course_durations;
    const cdId = rec.course_duration_id;
    if (!cdId || !cd) continue;

    if (!cdMap.has(cdId)) {
      cdMap.set(cdId, { code: cd.course_code, name: cd.course_name, facultyId: cd.faculty_id, sessions: 0, totalPct: 0 });
    }
    const agg = cdMap.get(cdId)!;
    agg.sessions++;
    const counts = entryCounts.get(rec.id);
    if (counts && counts.total > 0) {
      agg.totalPct += (counts.present / counts.total) * 100;
    }
  }

  // Get faculty names
  const facultyIds = [...new Set(Array.from(cdMap.values()).map(v => v.facultyId))];
  const { data: facultyProfiles } = await supabase.from('profiles').select('id, name').in('id', facultyIds);
  const nameMap = new Map((facultyProfiles || []).map(p => [p.id, p.name]));

  return Array.from(cdMap.entries()).map(([cdId, agg]) => ({
    courseDurationId: cdId,
    courseCode: agg.code,
    courseName: agg.name,
    facultyName: nameMap.get(agg.facultyId) || 'Unknown',
    totalSessions: agg.sessions,
    avgAttendance: agg.sessions > 0 ? Math.round(agg.totalPct / agg.sessions) : 0,
  }));
}

export async function createBatch(input: Partial<Batch>): Promise<Batch> {
  const { data, error } = await supabase.from('batches').insert({
    name: input.name,
    program: input.program,
    year: input.year,
    section: input.section,
    department: input.department,
  }).select().single();
  if (error) throw error;
  return mapBatch(data);
}
