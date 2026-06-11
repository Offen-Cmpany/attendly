# Leave Workflow

**Phase:** 1 — v1.0 Foundation
**Type:** AFK
**Priority:** High

## What to build

A 3-step leave approval workflow. Student uploads a leave certificate (medical or duty), Class Advisor approves/rejects, then HoD approves/rejects. If both approve, the faculty sees the approved leave when marking attendance and manually marks the student as excused.

End-to-end behavior:
- Student goes to "Leave" section → taps "Apply for Leave"
- Selects leave type: Medical (requires medical certificate upload) or Duty (requires supporting document)
- Uploads certificate image/PDF, adds optional description, submits
- Class Advisor sees pending leave requests → taps to review certificate → approves or rejects with reason
- If rejected → student sees rejection with reason and can re-upload
- If Advisor approves → request moves to HoD's pending queue
- HoD reviews → approves or rejects with reason
- If HoD rejects → student sees rejection
- If HoD approves → leave is marked as "approved"
- Faculty sees approved leaves when marking attendance for that student → manually marks as excused
- Notifications sent at each status change (wired via #11/#12)

## Acceptance criteria

- [ ] Schema: `leaves` table (student_id, type, certificate_url, description, advisor_status, hod_status, faculty_id, timestamps)
- [ ] Student: apply for leave with type selection, file upload, description
- [ ] File upload to Supabase Storage with RLS
- [ ] Class Advisor: pending requests list, certificate preview, approve/reject with reason
- [ ] HoD: pending requests (Advisor-approved), certificate preview, approve/reject with reason
- [ ] Faculty: sees approved leaves when marking attendance
- [ ] Faculty: can mark student as excused (absent → excused status) during attendance marking
- [ ] Status visibility: student can see current status (pending/advisors_approved/approved/rejected)
- [ ] Re-upload flow: rejected leaves allow student to submit again
- [ ] RLS: Student sees own leaves; Advisor sees section students' leaves; HoD sees department leaves
- [ ] Notification triggers at each status change (leave placeholder for now)

## Blocked by

- #01 — Project Scaffold + Auth Foundation
- #04 — Faculty: Mark Attendance Flow
