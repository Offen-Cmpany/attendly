# Full Role Dashboards

**Phase:** 1 — v1.0 Foundation
**Type:** AFK
**Priority:** Medium

## What to build

Wire all features built across Phase 0 and Phase 1 into comprehensive, role-specific dashboards. Each dashboard provides at-a-glance information tailored to that role's responsibilities.

**Student dashboard:**
- Attendance % per course (color-coded)
- Smart defaulter alerts with remaining count
- Upcoming classes (from timetable)
- Leave status: pending/approved/rejected
- Activity points: current / 100
- Internal marks: current assessment totals per course

**Faculty dashboard:**
- Today's classes with "Mark Attendance" button (from timetable)
- Course coverage % per course (from lesson plan)
- Pending leave verifications (HoD-approved leaves needing attendance adjustment)
- Internal mark entry status: e.g., "CS301: 2 of 4 assessments entered"

**Class Advisor dashboard:**
- Pending leave requests (awaiting Advisor approval)
- Pending activity point certificate reviews
- Defaulter list per class (from smart alerts)
- Attendance summary for their section

**HoD dashboard:**
- Department attendance heat map (which course_durations have lowest attendance)
- Defaulter list across department
- Leave requests awaiting HoD approval
- Internal mark submission status (which faculty have/haven't submitted)
- Activity point summary per class
- Timetable management entry point

**Principal dashboard:**
- Institution-level attendance summary
- Department comparisons

## Acceptance criteria

- [ ] Student dashboard shows all 6 sections (attendance %, alerts, upcoming, leave, points, marks)
- [ ] Faculty dashboard shows 4 sections (today's classes, coverage, pending leaves, marks status)
- [ ] Class Advisor dashboard shows 4 sections (pending leaves, certificate reviews, defaulters, attendance)
- [ ] HoD dashboard shows 6 sections (heatmap, defaulters, leave approvals, marks status, activity points, timetable)
- [ ] Principal dashboard shows 2 sections (institution summary, department comparisons)
- [ ] Each section is a card/module that can be tapped for full detail
- [ ] Data refreshes on pull-to-refresh
- [ ] Empty states handled per section
- [ ] RLS: each role sees only data they're authorized to view

## Blocked by

- #04 — Faculty: Mark Attendance Flow
- #05 — Student: View Attendance
- #06 — HoD: Department Attendance Summary
- #08 — Timetable Management
- #09 — Leave Workflow
- #10 — Smart Defaulter Alerts
- #13 — Internal Marks
- #14 — University Result Import
- #15 — Activity Points
- #16 — Course-End Survey
