# Student: View Attendance

**Phase:** 0 — MVP
**Type:** AFK
**Priority:** Medium

## What to build

Students can view their attendance percentage per course with color-coded indicators. Tapping a course shows a session-by-session breakdown of attendance records.

End-to-end behavior:
- Student logs in → sees list of enrolled courses with attendance % per course
- Each course card is color-coded: green (≥75%), yellow (65–74%), red (<65%)
- Tapping a course card → session-by-session breakdown: date, topic, delivery method, present/absent status
- Data refreshes on pull-to-refresh (no realtime subscriptions in MVP)
- If no attendance has been marked yet, shows "No sessions recorded yet"

## Acceptance criteria

- [ ] Student dashboard shows all enrolled course_durations with attendance %
- [ ] Color coding: green ≥75%, yellow 65–74%, red <65%
- [ ] Tapping a course shows session-by-session list with date, topic, delivery method, status
- [ ] Percentage calculation: attended_sessions / total_sessions_held_so_far
- [ ] Pull-to-refresh implemented
- [ ] Empty state: "No sessions recorded yet" when no attendance data exists
- [ ] RLS: Student sees only their own attendance data
- [ ] Loading skeleton while data fetches

## Blocked by

- #01 — Project Scaffold + Auth Foundation
- #03 — Student Self-Registration
- #04 — Faculty: Mark Attendance Flow
