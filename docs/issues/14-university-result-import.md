# University Result Import

**Phase:** 1 — v1.0 Foundation
**Type:** HITL
**Priority:** Medium

## What to build

After end-semester exams, faculty can upload a structured screenshot of the university result sheet. The system extracts marks via OCR, faculty verifies the extracted data before saving, and a consolidated report (internal marks + university marks) can be generated.

**Technical approach:** TBD — this is why it's HITL. Options include Tesseract.js (runs on-device or in Edge Function), Vision LLM (GPT-4o / Claude vision), or a Supabase Edge Function with OCR library. The approach must be decided before implementation.

End-to-end behavior:
- Faculty navigates to course_duration → "University Results"
- Uploads a screenshot of the university result sheet (consistent format expected)
- System processes: OCR extracts student names, roll numbers, marks per subject
- Faculty sees extracted data in a table alongside the original image
- Faculty reviews each row: corrects any OCR errors manually
- Faculty taps "Save" → marks are stored linked to student × course_duration
- Consolidated report available: internal marks (from #13) + university marks side by side

## Acceptance criteria

- [ ] Screenshot upload UI with preview of uploaded image
- [ ] OCR processing pipeline (approach decided during this issue)
- [ ] Extracted data displayed in editable table: roll_no, student_name, subject, marks
- [ ] Side-by-side view: original image vs extracted data for verification
- [ ] Manual correction: faculty can edit any extracted value
- [ ] Save stores marks in a `university_results` table
- [ ] Consolidated report: internal marks + university marks per student
- [ ] Error state: if OCR quality is poor, faculty can fall back to manual entry
- [ ] RLS: Faculty manages results for their course_durations; Students see own results only

## Blocked by

- #01 — Project Scaffold + Auth Foundation
- #13 — Internal Marks (for consolidated report)
