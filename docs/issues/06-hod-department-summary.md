# HoD: Department Attendance Summary

**Phase:** 0 — MVP
**Type:** AFK
**Priority:** Medium

## What to build

HoD logs in and sees a department-wide attendance overview: a list of all course_durations in their department with faculty name, total sessions held, and average attendance percentage. Provides a quick pulse check on department attendance health.

End-to-end behavior:
- HoD logs in → sees "Department Attendance" screen
- List of all course_durations in their department
- Each row shows: course code, course name, faculty name, total sessions held, average attendance %
- Tapping a row → no drill-down in MVP (future: per-course detail)
- Pull-to-refresh to get latest data

## Acceptance criteria

- [ ] HoD dashboard shows all course_durations in their department
- [ ] Each row displays: course code, course name, faculty name, sessions held, average attendance %
- [ ] Average attendance % is computed across all sessions in that course_duration
- [ ] Pull-to-refresh implemented
- [ ] Empty state: "No course durations found" if department has none
- [ ] RLS: HoD sees only their own department's data
- [ ] Loading skeleton while data fetches

## Blocked by

- #01 — Project Scaffold + Auth Foundation
- #04 — Faculty: Mark Attendance Flow
