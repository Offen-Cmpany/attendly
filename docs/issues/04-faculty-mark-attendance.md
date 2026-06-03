# Faculty: Mark Attendance Flow

**Phase:** 0 — MVP
**Type:** AFK
**Priority:** High

## What to build

The core attendance marking flow. Faculty logs in and sees a dashboard with "Today's Classes" list. Tapping a class opens the marking screen showing all enrolled students. By default all students are marked present — faculty taps to toggle individuals to absent. Faculty optionally selects a topic (from a pre-loaded list) and delivery method (lecture/lab/tutorial/seminar). On submit, the session is saved and locked.

End-to-end behavior:
- Faculty opens app → sees "Today's Classes" (course_durations they're assigned to)
- Taps a class → sees scrollable list of enrolled students with absent/present toggles
- All students start as present (absentees-only model)
- Faculty taps a student row to toggle them to absent (visual indicator)
- Faculty selects topic from dropdown (topics pre-loaded by Super Admin for MVP)
- Faculty selects delivery method (Lecture / Lab / Tutorial / Seminar)
- Faculty taps "Mark Attendance" → submission in progress → success/error feedback
- Session is locked immediately on submit (locked_at = now())
- Faculty returns to dashboard; the class is removed from "Today's Classes"
- History section shows the newly marked session

Edge cases handled:
- No students enrolled in the course_duration → "No students assigned" message
- Network failure during submit → error shown, no partial save
- Faculty opens marking screen but doesn't submit → no data written
- Same class marked twice on same day → second attempt rejected ("Attendance already marked for today")

## Acceptance criteria

- [ ] Faculty dashboard shows "Today's Classes" list from their assigned course_durations
- [ ] Tapping a class navigates to marking screen with enrolled student list
- [ ] Absentees-only toggle: all students default present, tap to mark absent
- [ ] Visual distinction between present (green/check) and absent (red/x) states
- [ ] Topic dropdown populated from pre-loaded topics (Super Admin enters manually for MVP)
- [ ] Delivery method selector (Lecture / Lab / Tutorial / Seminar)
- [ ] "Mark Attendance" button submits the session
- [ ] Session is locked immediately (locked_at = now()) on successful submit
- [ ] `attendance_records` and `attendance_entries` tables populated correctly
- [ ] Error state on network failure — no partial saves
- [ ] Duplicate marking prevention — reject if attendance already recorded for today
- [ ] Loading spinner during submission
- [ ] RLS: Faculty can only mark attendance for course_durations they're assigned to
- [ ] RLS: Students can only see their own attendance entries

## Blocked by

- #01 — Project Scaffold + Auth Foundation
- #02 — Super Admin: Faculty & Student Bulk Import
