-- Supabase Initial Schema for Attendly
-- This script creates the relational tables required for the platform.

-- 1. Settings Table
CREATE TABLE settings (
  id text PRIMARY KEY DEFAULT 'global',
  total_series_exams integer NOT NULL DEFAULT 2,
  current_semester integer NOT NULL DEFAULT 6
);

INSERT INTO settings (id, total_series_exams, current_semester) VALUES ('global', 2, 6);

-- 2. Batches
CREATE TABLE batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  program text NOT NULL,
  year integer NOT NULL,
  section text,
  advisor_id uuid, -- Reference added after profiles table creation
  department text NOT NULL DEFAULT 'CSE'
);

-- 3. Profiles (Users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  designation text,
  program text,
  batch_id uuid REFERENCES batches(id) ON DELETE SET NULL,
  reg text,
  dept text,
  semester integer,
  is_class_advisor boolean DEFAULT false,
  advisor_batch_id uuid REFERENCES batches(id) ON DELETE SET NULL
);

-- Add the circular reference for advisor in batches
ALTER TABLE batches ADD CONSTRAINT fk_advisor FOREIGN KEY (advisor_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- 4. Courses
CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  credits integer NOT NULL,
  semester integer NOT NULL,
  program text NOT NULL,
  teacher_id uuid REFERENCES profiles(id) ON DELETE SET NULL
);

-- Many-to-many relationship: Course <-> Batches
CREATE TABLE course_batches (
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  batch_id uuid REFERENCES batches(id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, batch_id)
);

-- 5. Modules
CREATE TABLE modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  module_order integer NOT NULL,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in_progress', 'completed'))
);

-- 6. Exam Marks
CREATE TABLE marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  batch_id uuid NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  series_number integer NOT NULL,
  marks_obtained integer NOT NULL,
  max_marks integer NOT NULL,
  UNIQUE(student_id, course_id, series_number)
);

-- 7. Communities
CREATE TABLE communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

-- Community Members
CREATE TABLE community_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('member', 'manager')),
  UNIQUE(community_id, user_id)
);

-- Community Events
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  type text NOT NULL,
  event_date timestamptz NOT NULL,
  location text,
  is_duty_leave_eligible boolean DEFAULT false,
  organizer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
);

-- Event Attendees
CREATE TABLE event_attendees (
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, user_id)
);

-- Enable RLS (Row Level Security) - For now, allow authenticated users to read/write freely for rapid dev
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read access" ON settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON batches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON course_batches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON modules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON marks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON communities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON community_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON event_attendees FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated write access" ON settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON batches FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON profiles FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON courses FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON course_batches FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON modules FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON marks FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON communities FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON community_members FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON events FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated write access" ON event_attendees FOR ALL TO authenticated USING (true);
