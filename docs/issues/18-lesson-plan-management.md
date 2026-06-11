# Lesson Plan Management

**Phase:** 1 — v1.0 Foundation
**Type:** AFK
**Priority:** Low

## What to build

Faculty can upload a syllabus PDF, the system auto-extracts a topic list (fallback: manual entry if PDF format is inconsistent), faculty reviews and confirms the topic list before publishing. Faculty then selects topics covered when marking attendance. A course coverage report shows which topics have been covered vs remaining.

End-to-end behavior:
- Faculty goes to course_duration → "Lesson Plan"
- Option A: Upload syllabus PDF → system extracts topics → preview list
- Option B: Manually enter topics one by one (if PDF parsing fails or is unavailable)
- Faculty reviews extracted topics, edits if needed, confirms → topics saved
- When marking attendance (from #04), faculty can select one or more topics from the course's topic list
- Course coverage report shows: topic list with covered/not-covered status, % coverage

## Acceptance criteria

- [ ] Schema: `lesson_topics` table (id, course_duration_id, name, order_index, is_covered)
- [ ] PDF upload UI with progress indicator
- [ ] PDF text extraction (Tesseract.js or pdf.js or Edge Function) — list topics
- [ ] Fallback: manual topic entry form (add topic name, reorder)
- [ ] Review screen: extracted topics listed with edit/delete per topic
- [ ] Confirmation saves topics to `lesson_topics` table
- [ ] Topic selector in attendance marking screen shos course's confirmed topics
- [ ] Course coverage report: topics table with covered/remaining status, % complete
- [ ] RLS: Faculty manages own course_durations; Students read-only

## Blocked by

- #01 — Project Scaffold + Auth Foundation
- #04 — Faculty: Mark Attendance Flow
