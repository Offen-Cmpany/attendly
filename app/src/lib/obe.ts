import { supabase } from './supabase';

export type ProgramOutcome = {
  id: string;
  program: string;
  poCode: string;
  description: string;
};

export type CourseOutcome = {
  id: string;
  courseDurationId: string;
  coCode: string;
  description: string;
};

export type CoPoMapping = {
  courseOutcomeId: string;
  programOutcomeId: string;
  correlationLevel: number; // 1, 2, or 3
};

export type UniversityMark = {
  id: string;
  studentId: string;
  courseDurationId: string;
  grade: string;
  gradePoints: number;
  passed: boolean;
};

// ─── Program Outcomes ────────────────────────────────────────────

export async function listProgramOutcomes(program?: string): Promise<ProgramOutcome[]> {
  let query = supabase.from('program_outcomes').select('*').order('po_code', { ascending: true });
  if (program) query = query.eq('program', program);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(row => ({
    id: row.id,
    program: row.program,
    poCode: row.po_code,
    description: row.description,
  }));
}

export async function upsertProgramOutcome(po: Partial<ProgramOutcome>): Promise<void> {
  const row = {
    ...(po.id ? { id: po.id } : {}),
    program: po.program,
    po_code: po.poCode,
    description: po.description,
  };
  const { error } = await supabase.from('program_outcomes').upsert(row, { onConflict: 'program,po_code' });
  if (error) throw error;
}

export async function deleteProgramOutcome(id: string): Promise<void> {
  const { error } = await supabase.from('program_outcomes').delete().eq('id', id);
  if (error) throw error;
}

// ─── Course Outcomes ─────────────────────────────────────────────

export async function listCourseOutcomes(courseDurationId: string): Promise<CourseOutcome[]> {
  const { data, error } = await supabase.from('course_outcomes').select('*').eq('course_duration_id', courseDurationId).order('co_code', { ascending: true });
  if (error) throw error;
  return (data || []).map(row => ({
    id: row.id,
    courseDurationId: row.course_duration_id,
    coCode: row.co_code,
    description: row.description,
  }));
}

export async function upsertCourseOutcome(co: Partial<CourseOutcome>): Promise<void> {
  const row = {
    ...(co.id ? { id: co.id } : {}),
    course_duration_id: co.courseDurationId,
    co_code: co.coCode,
    description: co.description,
  };
  const { error } = await supabase.from('course_outcomes').upsert(row, { onConflict: 'course_duration_id,co_code' });
  if (error) throw error;
}

export async function deleteCourseOutcome(id: string): Promise<void> {
  const { error } = await supabase.from('course_outcomes').delete().eq('id', id);
  if (error) throw error;
}

// ─── CO-PO Mappings ──────────────────────────────────────────────

export async function listCoPoMappings(courseDurationId: string): Promise<CoPoMapping[]> {
  // We need to fetch mappings for the COs that belong to this course duration
  const { data: cos, error: coError } = await supabase.from('course_outcomes').select('id').eq('course_duration_id', courseDurationId);
  if (coError) throw coError;
  if (!cos || cos.length === 0) return [];

  const coIds = cos.map(c => c.id);
  const { data, error } = await supabase.from('co_po_mapping').select('*').in('course_outcome_id', coIds);
  if (error) throw error;

  return (data || []).map(row => ({
    courseOutcomeId: row.course_outcome_id,
    programOutcomeId: row.program_outcome_id,
    correlationLevel: row.correlation_level,
  }));
}

export async function upsertCoPoMappings(mappings: CoPoMapping[]): Promise<void> {
  if (mappings.length === 0) return;
  const rows = mappings.map(m => ({
    course_outcome_id: m.courseOutcomeId,
    program_outcome_id: m.programOutcomeId,
    correlation_level: m.correlationLevel,
  }));
  const { error } = await supabase.from('co_po_mapping').upsert(rows, { onConflict: 'course_outcome_id,program_outcome_id' });
  if (error) throw error;
}

// ─── University Marks ────────────────────────────────────────────

export async function listUniversityMarks(courseDurationId: string): Promise<UniversityMark[]> {
  const { data, error } = await supabase.from('university_marks').select('*').eq('course_duration_id', courseDurationId);
  if (error) throw error;
  return (data || []).map(row => ({
    id: row.id,
    studentId: row.student_id,
    courseDurationId: row.course_duration_id,
    grade: row.grade,
    gradePoints: row.grade_points,
    passed: row.passed,
  }));
}

export async function upsertUniversityMarks(marks: Partial<UniversityMark>[]): Promise<void> {
  if (marks.length === 0) return;
  const rows = marks.map(m => ({
    ...(m.id ? { id: m.id } : {}),
    student_id: m.studentId,
    course_duration_id: m.courseDurationId,
    grade: m.grade,
    grade_points: m.gradePoints,
    passed: m.passed,
  }));
  const { error } = await supabase.from('university_marks').upsert(rows, { onConflict: 'student_id,course_duration_id' });
  if (error) throw error;
}
