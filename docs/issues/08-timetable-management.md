# Timetable Management

**Phase:** 1 — v1.0 Foundation
**Type:** HITL
**Priority:** High

## What to build

HoD can create a repeating weekly timetable per semester. Each timetable slot defines: day of week, start time, end time, room, faculty, and course_duration. The timetable serves as the planned baseline for smart alert formulas and the "today's classes" view. One-off changes (swaps, cancellations) are handled at attendance time — not in the timetable.

End-to-end behavior:
- HoD navigates to "Timetable" section → selects semester/batch
- HoD adds slots one by one: pick day, set time range, select course_duration, assign room, assign faculty
- Saved slots appear in a weekly grid view (Mon–Sat, time-slot rows)
- HoD can delete a slot (but not edit — delete and re-add to avoid inconsistency)
- Faculty sees "Today's Classes" now driven by timetable slots for the current day
- If a scheduled slot has no attendance marked by end of day, it's treated as cancelled — doesn't count against students' percentage
- Student sees upcoming classes from timetable on their dashboard

## Acceptance criteria

- [ ] Schema: `timetable_slots` table with course_duration_id, day_of_week, start_time, end_time, room, faculty_id
- [ ] HoD UI: batch/semester selector → weekly grid view with add-slot form
- [ ] Add slot: day picker, time pickers (start/end), course_duration dropdown (filtered by batch), room text input, faculty dropdown
- [ ] Delete slot with confirmation dialog
- [ ] Faculty dashboard "Today's Classes" reads from timetable_slots for current day
- [ ] Cancelled-slot logic: no attendance_record by end of day → treated as cancelled → not counted in student %
- [ ] Student dashboard shows upcoming classes from timetable
- [ ] RLS: HoD manages only their department's timetable; Faculty reads assigned slots
- [ ] Validation: time ranges don't overlap for same room (warning, not hard block — conflict detection deferred)

## Blocked by

- #01 — Project Scaffold + Auth Foundation
