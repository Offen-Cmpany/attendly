# Course Coverage Reports

**Phase:** 2 — v1.5 Enrichment
**Type:** AFK
**Priority:** Low

## What to build

Enhanced course coverage reports showing what portion of the syllabus has been covered (topics marked as covered during attendance vs total topics in the lesson plan). Visualization with progress bars per course. Department-level view for HoD.

End-to-end behavior:
- Faculty sees a coverage progress bar per course_duration on their dashboard
- Tapping shows detailed breakdown: topic list with covered/remaining status, dates covered
- HoD sees department-wide coverage heatmap: which courses have low coverage
- Coverage % = topics_covered / total_topics

## Acceptance criteria

- [ ] Coverage % calculated from lesson_topics (is_covered flag)
- [ ] Faculty dashboard: progress bar per course_duration
- [ ] Detail view: topic list with covered/remaining/dates covered
- [ ] HoD view: department-wide coverage summary
- [ ] Pull-to-refresh updates coverage data
- [ ] RLS: Faculty sees own courses; HoD sees department

## Blocked by

- #18 — Lesson Plan Management
