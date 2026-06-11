-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_durations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE co_po_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_marks ENABLE ROW LEVEL SECURITY;

-- Helper function to get the current user's role
CREATE OR REPLACE FUNCTION get_my_role() RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to get the current user's admin designation
CREATE OR REPLACE FUNCTION get_my_designation() RETURNS text AS $$
  SELECT designation FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin_user() RETURNS boolean AS $$
  SELECT get_my_role() = 'admin'
    AND get_my_designation() IN ('hod', 'principal', 'office_staff');
$$ LANGUAGE sql SECURITY DEFINER;

-- 1. Profiles
-- Everyone can read profiles (needed for dropdowns, class lists)
CREATE POLICY "Profiles are viewable by all users" 
ON profiles FOR SELECT TO authenticated USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- 2. Core Academic Data (Batches, Courses, Course Durations, Outcomes)
-- Viewable by everyone
CREATE POLICY "Core data viewable by all" ON batches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Core data viewable by all" ON courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Core data viewable by all" ON course_durations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Core data viewable by all" ON program_outcomes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Core data viewable by all" ON course_outcomes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Core data viewable by all" ON co_po_mapping FOR SELECT TO authenticated USING (true);

-- Only Admins can modify core academic data
CREATE POLICY "Admins can insert batches" ON batches FOR INSERT TO authenticated WITH CHECK (is_admin_user());
CREATE POLICY "Admins can update batches" ON batches FOR UPDATE TO authenticated USING (is_admin_user());
CREATE POLICY "Admins can delete batches" ON batches FOR DELETE TO authenticated USING (is_admin_user());

CREATE POLICY "Admins can modify courses" ON courses FOR ALL TO authenticated USING (is_admin_user());
CREATE POLICY "Admins can modify course_durations" ON course_durations FOR ALL TO authenticated USING (is_admin_user());

-- 3. Attendance Records (The session metadata)
-- Anyone can view
CREATE POLICY "Records viewable by all" ON attendance_records FOR SELECT TO authenticated USING (true);

-- Teachers can insert/update their own classes
CREATE POLICY "Teachers can insert records for their classes" ON attendance_records 
FOR INSERT TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM course_durations 
    WHERE id = attendance_records.course_duration_id 
    AND faculty_id = auth.uid()
  ) OR is_admin_user()
);

CREATE POLICY "Teachers can update records for their classes" ON attendance_records 
FOR UPDATE TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM course_durations 
    WHERE id = attendance_records.course_duration_id 
    AND faculty_id = auth.uid()
  ) OR is_admin_user()
);

-- 4. Attendance Entries (The actual present/absent data per student)
-- Students can only view their own entries. Faculty/Admins can view all.
CREATE POLICY "Entries viewable by student or staff" ON attendance_entries 
FOR SELECT TO authenticated 
USING (
  student_id = auth.uid() OR get_my_role() != 'student'
);

-- Teachers can only insert/update entries for sessions they own
CREATE POLICY "Teachers can modify entries" ON attendance_entries 
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM attendance_records r
    JOIN course_durations cd ON cd.id = r.course_duration_id
    WHERE r.id = attendance_entries.attendance_record_id
    AND (cd.faculty_id = auth.uid() OR is_admin_user())
  )
);

-- 5. Marks and University Marks
-- Students view their own, Faculty/Admin view all
CREATE POLICY "Marks viewable by student or staff" ON marks FOR SELECT TO authenticated USING (student_id = auth.uid() OR get_my_role() != 'student');
CREATE POLICY "Uni marks viewable by student or staff" ON university_marks FOR SELECT TO authenticated USING (student_id = auth.uid() OR get_my_role() != 'student');

-- Teachers modify marks for their courses
CREATE POLICY "Teachers modify marks" ON marks FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM course_durations 
    WHERE id = marks.course_duration_id 
    AND (faculty_id = auth.uid() OR is_admin_user())
  )
);

CREATE POLICY "Teachers modify uni marks" ON university_marks FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM course_durations 
    WHERE id = university_marks.course_duration_id 
    AND (faculty_id = auth.uid() OR is_admin_user())
  )
);
