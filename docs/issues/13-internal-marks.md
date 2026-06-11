# Internal Marks

**Phase:** 1 — v1.0 Foundation
**Type:** AFK
**Priority:** Medium

## What to build

Faculty can configure assessment components for a course_duration (e.g., 1st Internal Assessment — 15 marks, 2nd Internal Assessment — 15 marks, Tutorial Book — 10 marks, Assignments — 10 marks), enter marks per student per component throughout the semester, view running totals out of 50, and generate a pre-exam report.

End-to-end behavior:
- Faculty navigates to a course_duration → "Internal Marks" tab
- At semester start: Faculty creates assessment components (name + max marks)
- Throughout semester: Faculty selects a component → enters marks for each student
- System auto-calculates running total per student (out of sum of max marks)
- Faculty sees a live table: rows = students, cols = assessment components + total
- Before end-semester exams: Faculty taps "Generate Report"
- System produces a formatted report: all students with component-wise marks + total out of 50
- Report can be shared as a view (PDF generation deferred)

## Acceptance criteria

- [ ] Schema: `assessments` table (name, max_marks, course_duration_id); `assessment_entries` table (student_id, assessment_id, marks_obtained)
- [ ] Faculty UI: create/edit assessment components for a course_duration
- [ ] Marks entry UI: select component → grid of student × marks input
- [ ] Validation: marks cannot exceed component's max_marks
- [ ] Running total auto-calculated and displayed per student
- [ ] "Generate Report" button produces full component-wise report
- [ ] Report view: student name + component marks + total/50
- [ ] RLS: Faculty can only manage assessments for assigned course_durations; Students see own marks only

## Blocked by

- #01 — Project Scaffold + Auth Foundation
