# Activity Points

**Phase:** 1 — v1.0 Foundation
**Type:** AFK
**Priority:** Medium

## What to build

Students can upload certificates (images/PDFs) from workshops, seminars, and co-curricular events. The Class Advisor reviews each certificate and grants points. Each student has a 100-point cap — the upload button is disabled once reached. Points are private (visible only to the student, Class Advisor, and HoD — no leaderboard).

End-to-end behavior:
- Student navigates to "Activity Points" → sees current points (e.g., "15 / 100")
- Student taps "Upload Certificate" → picks file (image/PDF), enters description, submits
- File stored in Supabase Storage, submission appears as "Pending" in student's list
- Class Advisor sees pending submissions → taps to preview certificate → enters points (discretionary) → approves or rejects
- If rejected: student sees reason and can re-upload
- If approved: points added to student's total; upload cap checked
- Once 100 points reached, upload button is hidden/shows "Maximum points reached"
- Student and Class Advisor see submission history with status

## Acceptance criteria

- [ ] Schema: `activity_submissions` table (student_id, certificate_url, description, points_awarded, reviewed_by, status); `activity_points` table (student_id, total_points, last_updated)
- [ ] Student UI: current points display, upload certificate button, submission history
- [ ] File upload to Supabase Storage (images + PDFs) with RLS
- [ ] Class Advisor UI: pending reviews list, certificate preview, points input, approve/reject
- [ ] 100-point cap: upload disabled when total_points ≥ 100
- [ ] Rejection with reason: student sees feedback, can re-upload
- [ ] Points accumulation: approved submission adds points to total
- [ ] Activity points visible to: student, Class Advisor (section), HoD (department)
- [ ] No leaderboard or public visibility
- [ ] RLS: Student reads/writes own submissions; Advisor manages section; HoD views department

## Blocked by

- #01 — Project Scaffold + Auth Foundation
