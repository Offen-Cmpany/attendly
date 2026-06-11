-- Communities and event workflow for student proposals + teacher/admin approval.

CREATE TABLE IF NOT EXISTS communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  category text,
  faculty_advisor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  approved_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  location text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  status text NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected', 'published', 'completed', 'cancelled')),
  requires_registration_approval boolean NOT NULL DEFAULT true,
  duty_leave_eligible boolean NOT NULL DEFAULT false,
  max_attendees integer,
  approval_note text,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  note text,
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_community_id ON events(community_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_student_id ON event_registrations(student_id);

ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION can_manage_events() RETURNS boolean AS $$
  SELECT get_my_role() = 'teacher' OR is_admin_user();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE POLICY "Communities are viewable by authenticated users"
ON communities FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Teachers and admins manage communities"
ON communities FOR ALL TO authenticated USING (can_manage_events()) WITH CHECK (can_manage_events());

CREATE POLICY "Published events viewable by all authenticated users"
ON events FOR SELECT TO authenticated USING (
  status IN ('approved', 'published', 'completed')
  OR created_by = auth.uid()
  OR can_manage_events()
);

CREATE POLICY "Students can propose events"
ON events FOR INSERT TO authenticated WITH CHECK (
  created_by = auth.uid()
  AND get_my_role() = 'student'
  AND status = 'pending_approval'
);

CREATE POLICY "Teachers and admins can review events"
ON events FOR UPDATE TO authenticated USING (can_manage_events()) WITH CHECK (can_manage_events());

CREATE POLICY "Registrations visible to owner or event managers"
ON event_registrations FOR SELECT TO authenticated USING (
  student_id = auth.uid()
  OR can_manage_events()
);

CREATE POLICY "Students can create their own registrations"
ON event_registrations FOR INSERT TO authenticated WITH CHECK (
  student_id = auth.uid()
  AND get_my_role() = 'student'
);

CREATE POLICY "Students can update their own registrations"
ON event_registrations FOR UPDATE TO authenticated USING (
  student_id = auth.uid()
) WITH CHECK (
  student_id = auth.uid()
);

CREATE POLICY "Teachers and admins can review registrations"
ON event_registrations FOR UPDATE TO authenticated USING (can_manage_events()) WITH CHECK (can_manage_events());
