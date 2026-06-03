# Course-End Survey

**Phase:** 1 — v1.0 Foundation
**Type:** AFK
**Priority:** Low

## What to build

A fixed course-end survey template that is auto-pushed to students at the end of each semester. The template is created by Offen Company (not customizable by faculty). Simple rating + comment format. Results are visible to the course faculty and HoD.

End-to-end behavior:
- Offen Company creates a single survey template (admin-only, not per-course)
- At semester end, the system auto-pushes the survey to all students enrolled in course_durations for that semester
- Student opens app → sees notification/badge → "Course Feedback" section
- Student selects a course → sees rating scale (e.g., 1–5 stars) + optional comment field
- Student submits → response recorded
- Faculty can see aggregated results for their course_durations (average rating, comment list)
- HoD can see results across their department

## Acceptance criteria

- [ ] Schema: `survey_templates` (id, questions JSON), `survey_responses` (id, student_id, course_duration_id, answers JSON, submitted_at)
- [ ] Admin-only UI to create/edit the survey template (questions: rating + comment)
- [ ] Auto-push mechanism: at semester end, notify students to complete survey
- [ ] Student UI: course list with pending/completed status, rating input, comment field
- [ ] Faculty UI: aggregated results per course (average rating, response count, comment list)
- [ ] HoD UI: department-wide results summary
- [ ] RLS: Student submits own responses; Faculty sees own courses; HoD sees department

## Blocked by

- #01 — Project Scaffold + Auth Foundation
