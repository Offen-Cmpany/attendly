import { supabase } from './supabase';

export type Role = 'student' | 'teacher' | 'admin';
export type AdminDesignation = 'hod' | 'principal' | 'office_staff';
export type Program = 'B.Tech CSE' | 'B.Tech CSE & AI' | 'BCA';

export type Profile = {
  id: string; // auth.users id
  userId?: string; // legacy support for UI
  name: string;
  email: string;
  role: Role;
  designation?: AdminDesignation;
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
  if (data.designation) row.designation = data.designation;
  if (data.batchId) row.batch_id = data.batchId;
  
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

// ─── Events ──────────────────────────────────────────────────────
export async function listEvents(filter?: { communityId?: string }): Promise<EventDoc[]> {
  let query = supabase.from('events').select('*').order('event_date', { ascending: false }).limit(50);
  if (filter?.communityId) query = query.eq('community_id', filter.communityId);
  const { data } = await query;
  return (data || []).map(row => ({
    id: row.id,
    communityId: row.community_id,
    title: row.title,
    description: row.description,
    type: row.type,
    date: row.event_date,
    location: row.location,
    isDutyLeaveEligible: row.is_duty_leave_eligible,
    organizerId: row.organizer_id,
  }));
}

// ─── Communities ─────────────────────────────────────────────────
export async function listCommunities(): Promise<Community[]> {
  const { data } = await supabase.from('communities').select('*').limit(50);
  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    createdBy: row.created_by,
  }));
}

export type LeaveStatus = 'pending' | 'approved' | 'declined';
export type LeaveType = 'duty' | 'medical' | 'personal' | 'other';
export type FormType = 'survey' | 'data_collection' | 'feedback' | 'other';
export type QuestionType = 'short_text' | 'long_text' | 'multiple_choice' | 'checkbox' | 'date';
export type FormQuestion = { id: string; type: QuestionType; question: string; options?: string[]; required?: boolean; };
export type Form = { id: string; title: string; description?: string; deadline?: string; type: FormType; questions: FormQuestion[]; createdBy: string; status: string; };
export type FormResponse = { id: string; formId: string; userId: string; answers: any; };
export type EventType = 'meeting' | 'workshop' | 'competition' | 'cultural' | 'other';
export type RequestType = 'leave' | 'community' | 'course_change' | 'other';
export type RequestStatus = 'pending' | 'approved' | 'declined';
export type AppRequest = { id: string; type: RequestType; userId: string; data: any; status: RequestStatus; };
export type CommunityMemberRole = 'member' | 'manager';
export type CommunityMember = { id: string; communityId: string; userId: string; role: CommunityMemberRole; };
export type Leave = { id: string; userId: string; userName: string; type: LeaveType; reason: string; fromDate: string; toDate: string; status: LeaveStatus; reg?: string; };
export type Note = { id: string; moduleId: string; title: string; fileUrl?: string; teacherId: string; };

// Dummy methods to satisfy TS imports where features were stubbed
export function dbConfigured() { return true; }
export async function listNotes(moduleId: string) { return []; }
export async function createNote(input: any) { return input; }
export async function listForms(filter?: any): Promise<Form[]> { return []; }
export async function listFormResponses(formId: string): Promise<FormResponse[]> { return []; }
export async function listLeaves(filter?: any) { return []; }
export async function listRequests(filter?: any) { return []; }
export async function getForm(formId: string) { return null; }
export async function createForm(input: any) { return input; }
export async function createEvent(input: any) { return input; }
export async function createLeave(input: any) { return input; }
export async function decideLeave(id: string, status: string, by: string) { return null; }
export async function decideRequest(id: string, status: string, by: string) { return null; }
export async function getCommunityMembers(cId: string) { return []; }
export async function getUserCommunityRole(cId: string, uId: string) { return null; }
export async function updateForm(id: string, data: any) { return null; }
export async function submitFormResponse(input: any) { return input; }
export async function createModule(input: any) { return input; }
export async function createBatch(input: any) { return input; }
export async function createCourse(input: any) { return input; }

