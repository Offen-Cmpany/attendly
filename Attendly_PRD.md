# ATTENDLY — Product Requirements Document

**Version:** 2.0 (revised)
**Date:** June 2026
**Organization:** Offen Company (CEK Student Team)
**Status:** Draft
**Competitor Reference:** EzyGo Innovation Labs Pvt. Ltd.

---

## 1. Executive Summary

Attendly is a cross-platform mobile application for **College of Engineering Kottarakkara (CEK)** that replaces EzyGo as the institution's attendance, academic administration, and activity tracking system.

Built by CEK's **Offen Company** student team, Attendly differentiates from EzyGo by:
- **CEK-specific** — no generic multi-institution complexity
- **OTA updates** — fixes and features reach users immediately, no app store delays
- **Modern React Native UX** — significantly better mobile experience than EzyGo's web-wrapped app
- **Sustainable pricing** — annual fee lower than EzyGo's ₹60K/year, covering infrastructure costs
- **Smart attendance alerts** — dynamic "you need X of Y remaining sessions" instead of dumb threshold alarms

Attendly v1 launches at the start of a semester as a **clean break** from EzyGo — no data migration, no API scraping.

---

## 2. Product Overview

### 2.1 Vision

Every student, faculty member, and administrator at CEK uses Attendly daily for all attendance and academic workflow needs — replacing paper registers, WhatsApp coordination, spreadsheet reports, and EzyGo.

### 2.2 Target Users & Roles

| Role | Description |
|---|---|
| **Student** | CEK enrollee in a batch (e.g., 2024-2028 CSE). Automatically progresses through fixed semesters S1–S8. |
| **Faculty** | Instructor who marks attendance, manages lesson plans, enters internal marks. |
| **Class Advisor** | Faculty with oversight of a specific class section's attendance, leave, and activity points. |
| **HoD** | Head of Department — department dashboards, timetable management, leave approval. |
| **Principal** | Institution-level dashboards and reports. |
| **Super Admin** | Offen Company developer outside CEK hierarchy — bulk-imports faculty, configures system. |

**Role model:** Users have a base role (Student or Faculty). Faculty receive permission flags: `is_class_advisor`, `is_hod`, `is_principal`.

### 2.3 Platform

| Layer | Technology |
|---|---|
| Mobile Framework | React Native + Expo SDK |
| Navigation | Expo Router (file-based) |
| Backend / Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (JWT-based sessions) |
| Authorization | PostgreSQL Row-Level Security (RLS) |
| Storage | Supabase Storage |
| Push Notifications | Expo Push Notifications |
| OTA Updates | Expo EAS — instant updates bypassing app store |
| CI/CD | GitHub Actions — auto-deploys on push to main |
| Design System | Custom `theme.ts` |

### 2.4 Institution Profile

- **Departments:** 2 (plus labs)
- **Users:** ~1,000–3,000 (all students + faculty + staff)
- **Curriculum:** Fixed per batch — courses repeat year after year across schemes (2019, 2024, etc.)
- **Current System:** EzyGo (being replaced)

---

## 3. Phased Release Plan

### Phase 0 — MVP (Weeks 1–6)

The minimal shippable product — validates the stack and gets real usage before building further.

**In scope:**
- Authentication & role-based login (Student, Faculty, HoD, Principal, Super Admin)
- Student self-registration via CEK email domain
- Faculty bulk-import via CSV by Super Admin
- Core attendance marking (absentees-only model, attach lesson plan topic + delivery method)
- Attendance viewing (students see per-course %, faculty see session history)
- End-of-day attendance lock (HoD can unlock)
- Basic dashboards:
  - **Student:** attendance % per course, upcoming classes
  - **Faculty:** today's classes with "Mark Attendance" button
  - **HoD/Principal:** department attendance summary
- OTA deployment pipeline live (GitHub Actions + Expo EAS)

**Out of scope:** Leave management, timetable, marks, surveys, activity points, notifications, offline.

### Phase 1 — Foundation (v1.0, Weeks 7–16)

Full v1 as specified throughout this document.

**In scope (beyond MVP):**
- Timetable (weekly repeating, HoD-managed)
- Smart defaulter alerts (dynamic: "need X of Y remaining sessions")
- In-app push notifications (attendance marked, leave status, defaulter alerts)
- Leave workflow (3-step: Student → Advisor → HoD → Faculty adjusts attendance)
- Internal marks (faculty enters assessments, system calculates out of 50, generates pre-exam report)
- University result import (screenshot OCR with verification)
- Activity points (certificate upload, Advisor grants points, 100-point cap)
- Fixed course-end survey template
- Full dashboards for all roles

### Phase 2 — Enrichment (v1.5)

- Faculty-created ad-hoc surveys with question builder
- Lesson plan PDF import (if not already in v1)
- Course coverage reports

### Phase 3 — Expansion (v2.0)

- SMS / Email gateway
- Advanced analytics for HoD/Principal
- OBE basics — CO mapping (evaluate demand)

---

## 4. Feature Specifications (v1.0)

### 4.1 Authentication & Authorization

- Role-based login via Supabase Auth (JWT)
- Hierarchical role model: base role (Student/Faculty) + permission flags (`is_class_advisor`, `is_hod`, `is_principal`)
- Faculty bulk-imported from CSV by Super Admin → each receives invite email to set password
- Students self-register using CEK email domain (`@cek.ac.in`)
- Password reset via email
- Session persistence across app restarts
- All authorization logic in PostgreSQL RLS policies (raw SQL migration files)
- Helper function `has_permission(user_id, permission_name)` for readable policies

### 4.2 Attendance Management

- **Marking model:** Faculty marks absentees only — all other students are presumed present
- Each session tagged with lesson plan topic and delivery method (lecture, lab, tutorial, seminar)
- Session locks automatically at end of day (11:59 PM) — no retroactive edits
- HoD can unlock a locked session if correction is needed
- Faculty sees which students have approved leaves when marking attendance; marks them as excused
- Students view attendance % per course (green ≥75%, yellow 65–74%, red <65%)
- Attendance session data model:
  - `attendance_records` (course_duration_id, session_date, marked_by, topic, delivery_method, locked_at)
  - `attendance_entries` (attendance_record_id, student_id, status: present/absent)
  - Approved leaves result in "present" status (faculty manually marks it)

### 4.3 Leave Management

**Workflow:**
1. Student uploads leave certificate (medical certificate or duty document)
2. **Class Advisor** approves/rejects — rejection ends the workflow; student can re-upload
3. If Advisor approves → **HoD** approves/rejects — rejection ends the workflow
4. If HoD approves → Faculty sees approved leave when marking attendance and manually marks student as excused

**Leave types:**
- **Medical leave:** requires uploaded medical certificate
- **Duty leave:** requires supporting document (placement letter, event notice)

Both types follow the same approval chain. Notifications sent at each status change.

### 4.4 Timetable

- HoD creates a single weekly timetable per semester (repeating pattern)
- Each slot: day × time × course_duration × room × faculty
- Serves as the **planned baseline** for smart alert formulas and "today's classes" view
- One-off changes (faculty swaps, cancellations) are handled at attendance time — faculty marks attendance on whichever day the class was actually held
- No conflict detection (room/faculty double-booking is a human error in v1)
- If a scheduled slot has no attendance marked by end of day, it is treated as cancelled — does not count against students' percentage nor disappear from timetable

### 4.5 Smart Defaulter Alerts

Instead of dumb threshold notifications, Attendly sends dynamic alerts:

**Formula per (student × course_duration):**
- Current % = attended_sessions / sessions_held_so_far
- Remaining = total_scheduled_sessions - sessions_held_so_far
- Needed = ceil(0.75 × total_scheduled_sessions) - attended_so_far
- Message: *"You're at Z%. You need to attend X of the remaining Y sessions to reach 75%."*

**Triggers:**
- **Real-time:** when a marking drops a student below threshold, alert fires immediately
- **On-demand:** Class Advisor/HoD can request defaulter list anytime
- **Recalculation:** every time attendance is marked, recheck all students in that course_duration; if "needed" changes by >1, send updated alert

**Threshold:** 75% for all courses (stored as `course_durations.min_attendance_pct` for future configurability).

### 4.6 Lesson Plan Management

- **Initial import:** Faculty uploads syllabus PDF → system extracts topic list automatically → faculty reviews/confirms before publishing
- **Risk:** depends on CEK syllabus PDF format consistency — if inconsistent, fall back to manual topic list entry
- Faculty selects topic(s) covered when marking attendance
- Course coverage report shows which topics marked as covered vs. remaining

### 4.7 Internal Marks

**Components per course (configurable):**
- 1st Internal Assessment (e.g., 15 marks)
- 2nd Internal Assessment (e.g., 15 marks)
- Tutorial Book (e.g., 10 marks)
- Assignments (e.g., 10 marks)
- **Total: 50 marks**

**Workflow:**
1. Faculty creates assessment components for the course_duration at semester start
2. Throughout semester, faculty enters marks per student per component
3. System auto-calculates running total (out of 50)
4. Before end-semester exams, faculty clicks "Generate Internal Mark Report"
5. System produces a report: all students with component-wise + total marks

**Data model:**
- `assessments` (name, max_marks, course_duration_id)
- `assessment_entries` (student_id, assessment_id, marks_obtained)

### 4.8 University Result Import

- After end-semester exams, university publishes result sheets
- Faculty uploads a structured screenshot of the result sheet
- System auto-fills marks via OCR (consistent format across departments)
- Faculty verifies extracted marks before saving
- Consolidated report can then be generated (internal marks + university marks)

**Technical approach:** TBD (Tesseract.js / Vision LLM / Supabase Edge Function). OCR implementation deferred to later design phase.

### 4.9 Activity Points

- Students upload certificate images/PDFs from workshops, seminars, co-curricular events
- Class Advisor reviews each certificate and grants points (discretionary — no fixed scale)
- Maximum **100 points per student** — upload button disabled once cap reached
- Points visible only to student and Class Advisor/HoD (private, no leaderboard)
- Certificate files stored in Supabase Storage (costs covered by CEK annual fee)

**Data model:**
- `activity_submissions` (student_id, certificate_url, description, status: pending/approved/rejected)
- `activity_points` (student_id, total_points, last_updated)

### 4.10 Dashboards

**Student:**
- Attendance % per course (color-coded)
- Smart defaulter alerts with remaining count
- Upcoming classes (from timetable)
- Leave status: pending/approved/rejected
- Activity points: current / 100
- Internal marks: current assessment totals per course

**Faculty:**
- Today's classes with "Mark Attendance" button
- Course coverage % per course
- Pending leave verifications (HoD-approved leaves needing attendance adjustment)
- Internal mark entry status: "CS301: 2 of 4 assessments entered"

**Class Advisor:**
- Pending leave requests (awaiting Advisor approval)
- Pending activity point certificate reviews
- Defaulter list per class
- Attendance summary for their section

**HoD:**
- Department attendance heat map (which course_durations have lowest attendance)
- Defaulter list across department
- Leave requests awaiting HoD approval
- Internal mark submission status (which faculty have/haven't submitted)
- Activity point summary per class
- Timetable management (create semester timetable)

**Principal:**
- Institution-level attendance summary
- Department comparisons

### 4.11 Surveys (Course Feedback)

- v1: One fixed course-end survey template per semester
- Template created by Offen Company (admin), not customizable by faculty
- Auto-pushed to students at semester end
- Simple rating + comment format
- Results visible to course faculty and HoD

### 4.12 Notifications

- **v1:** In-app push notifications via Expo Push Notifications
  - Attendance marked
  - Leave approved/rejected (at each step)
  - Defaulter alert (with smart message)
  - Activity point certificate reviewed
- **v2 (deferred):** SMS / Email gateway via third-party provider

### 4.13 Staff Onboarding

- Super Admin bulk-imports faculty from CSV (name, email, department, role flags)
- Each faculty receives invite email with enrollment link
- Students self-register using CEK email domain
- No prior data needed — clean slate at semester start

### 4.14 OTA Updates & Deployment

- Expo EAS Update integrated with GitHub Actions CI/CD
- Every merge to `main` auto-publishes new OTA update to all users
- No app store approval cycle required for feature updates
- Staged rollouts supported via EAS channels

---

## 5. Non-Functional Requirements

| Requirement | Detail |
|---|---|
| **Performance** | Attendance marking < 2 seconds on 4G |
| **Availability** | 99.5% uptime target (Supabase managed infrastructure) |
| **Security** | Row-Level Security (RLS) — students see only own data |
| **Scalability** | Must support all CEK users (~1,000–3,000) |
| **Offline** | Deferred to post-v1. v1 assumes reliable connectivity (campus WiFi/4G). Connectivity check before marking. |
| **Platform** | iOS 14+ and Android 10+ via Expo |
| **Accessibility** | WCAG 2.1 AA contrast ratios, large tap targets |
| **Backup** | Supabase built-in PITR (Point-in-Time Recovery) |
| **Data retention** | Academic records kept indefinitely unless deletion requested |

---

## 6. Data Model (Core Entities)

```
Batches
  id, code (e.g., "2024-2028 CSE"), department_id, scheme_year

Courses
  id, code (CS301), name, department_id

Course_Durations
  id, course_id, batch_id, semester (S4),
  faculty_id, timetable_id,
  expected_sessions (from timetable),
  min_attendance_pct (default 75)

Timetable_Slots
  id, course_duration_id, day_of_week,
  start_time, end_time, room, faculty_id

Attendance_Records
  id, course_duration_id, session_date, marked_by,
  topic (from lesson plan), delivery_method,
  locked_at, created_at

Attendance_Entries
  id, attendance_record_id, student_id, status (present/absent)

Leaves
  id, student_id, type (medical/duty), certificate_url,
  advisor_status, hod_status, faculty_id,
  created_at, resolved_at

Assessments
  id, course_duration_id, name, max_marks

Assessment_Entries
  id, assessment_id, student_id, marks_obtained

Activity_Submissions
  id, student_id, certificate_url, description,
  points_awarded, reviewed_by, status, created_at

Users
  id, email, name, role (student/faculty),
  is_class_advisor, is_hod, is_principal,
  batch_id, department_id
```

---

## 7. Competitive Positioning

| Dimension | EzyGo | Attendly |
|---|---|---|
| **Pricing** | ₹60,000/year | Lower annual fee (covers infra + sustain) |
| **Target** | Multi-institution SaaS (India-wide) | CEK-specific — single college |
| **Updates** | Standard app store cycle | Expo EAS OTA — instant |
| **User Experience** | Vue.js SPA (web-wrapped) | React Native — native mobile |
| **Attendance** | Full (with topic + method mapping) | Full (absentees-only, faster workflow) |
| **Smart Alerts** | Dumb threshold | Dynamic "you need X of Y remaining" |
| **Leave Workflow** | Available | 3-step with manual attendance adjustment |
| **Internal Marks** | Available | Available with pre-exam report |
| **Activity Points** | ❌ | ✅ Certificate-based with points cap |
| **OBE / CO-PO** | Core differentiator | ❌ Out of scope (v2+) |
| **SMS / Email** | Full | Deferred to v2 |
| **Open Source** | ❌ Closed SaaS | ✅ GitHub-hosted |

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **Faculty adoption resistance** | Low marking compliance | Simple onboarding, push reminders, MVP validation in 6 weeks |
| **EzyGo already familiar** | "Why switch?" resistance | Attendly is free for CEK, CEK-specific, faster OTA updates |
| **OCR quality for result import** | Unreliable auto-fill | Verification step before saving; fallback to manual entry |
| **Supabase tier limits** | DB/bandwidth caps hit | Monitor usage, upgrade to Pro ($25/mo) — covered by annual fee |
| **PDF syllabus format inconsistency** | Lesson plan import fails | Fallback to manual topic list entry |
| **Founding team graduates** | Project abandoned | Document everything; get CEK to pay for infra (ensures continuity) |

---

## 9. Success Metrics

| Metric | Target |
|---|---|
| Faculty marking attendance via Attendly | 95%+ within 3 months of launch |
| Average attendance marking time | < 3 minutes per session |
| Attendance data loss incidents | Zero |
| OTA update delivery time | < 30 minutes from merge to device |
| App store rating | ≥ 4.2 stars within 6 months |
| HoD/Principal report generation | At least one department report per week |
| Active students | 80%+ check attendance at least weekly |

---

## 10. Glossary

See [CONTEXT.md](./CONTEXT.md) for full domain language definitions.

---

*Attendly PRD v2.0 | Offen Company | June 2026 | Built for CEK*
