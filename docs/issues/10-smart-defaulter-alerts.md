# Smart Defaulter Alerts

**Phase:** 1 — v1.0 Foundation
**Type:** AFK
**Priority:** High

## What to build

Dynamic attendance alerts that tell students exactly how many of the remaining sessions they need to attend to reach 75%. Recalculates in real-time whenever attendance is marked. Class Advisor/HoD can request a defaulter list on demand.

Formula per (student × course_duration):
- Current % = attended_sessions / sessions_held_so_far
- Remaining = total_scheduled_sessions − sessions_held_so_far
- Needed = ceil(0.75 × total_scheduled_sessions) − attended_so_far
- Message: *"You're at Z%. You need to attend X of the remaining Y sessions to reach 75%."*

Triggers:
- **Real-time:** when marking drops a student below 75%, alert fires immediately (notification wired in #12)
- **On-demand:** Class Advisor/HoD can view a defaulter list anytime (students below 75%)
- **Recalculation:** every time attendance is marked, recheck all students; if "needed" changes by >1, send updated alert

## Acceptance criteria

- [ ] Formula engine calculates: current %, remaining sessions, needed sessions per (student × course_duration)
- [ ] `expected_sessions` sourced from timetable (total_scheduled_sessions from timetable_slots count)
- [ ] Real-time trigger: after attendance marking, recheck all students in that course_duration
- [ ] Alert fires (via notification placeholder) when a student drops below 75%
- [ ] Recalculation: if "needed" changes by >1 vs last alert, send updated alert
- [ ] On-demand defaulter list: Class Advisor/HoD dashboard shows all defaulters
- [ ] Defaulter list UI: student name, course, current %, needed/remaining
- [ ] Threshold is configurable via `course_durations.min_attendance_pct` (default 75%)
- [ ] RLS: Student sees only their own alerts; Advisor sees section; HoD sees department

## Blocked by

- #04 — Faculty: Mark Attendance Flow
- #08 — Timetable Management (provides `expected_sessions` count)
