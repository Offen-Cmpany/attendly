# Ad-Hoc Surveys with Question Builder

**Phase:** 2 — v1.5 Enrichment
**Type:** AFK
**Priority:** Low

## What to build

Faculty can create their own ad-hoc surveys with a question builder (not just the fixed course-end survey). Supports multiple question types: multiple choice, rating, short text. Surveys can be sent to specific batches/course_durations at any point during the semester.

End-to-end behavior:
- Faculty goes to "Surveys" → "Create New Survey"
- Question builder: add questions with type selection (MCQ, rating, text)
- Set target: specific course_duration(s) or batch(es)
- Publish → students receive notification
- Results view: aggregate responses per question, individual responses per student
- Faculty can export results (CSV deferred)

## Acceptance criteria

- [ ] Schema: `surveys` (id, creator_id, questions JSON, target_type, target_id, published_at)
- [ ] Question builder UI with add/reorder/delete questions
- [ ] Question types: multiple choice (single + multiple), rating (1–5/1–10), short text
- [ ] Target selection: course_duration(s) or batch(es)
- [ ] Publish button → survey goes live, students notified (via notification system)
- [ ] Student UI: pending surveys list, answer flow
- [ ] Results view: per-question aggregates, individual response table
- [ ] RLS: Faculty manages own surveys; Students respond once per survey

## Blocked by

- #01 — Project Scaffold + Auth Foundation
- #16 — Course-End Survey (for survey infrastructure patterns)
