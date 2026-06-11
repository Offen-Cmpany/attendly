# Advanced Analytics

**Phase:** 3 — v2.0 Expansion
**Type:** AFK
**Priority:** Low

## What to build

Advanced analytics dashboards for HoD and Principal with trend data, projections, and exportable reports. Includes attendance trends over time, comparative analysis across batches/departments, and predictive alerts.

End-to-end behavior:
- HoD sees attendance trends over weeks/months (line charts)
- Department comparison: side-by-side attendance % across departments
- Batch comparison: which batches have lowest attendance
- Predictive: "At current trend, 3 students in CSE S4 will fall below 75% in 2 weeks"
- Export reports as PDF/CSV

## Acceptance criteria

- [ ] Attendance trend charts (line chart: % over time per course/department)
- [ ] Department comparison view (bar chart)
- [ ] Batch-wise comparison
- [ ] Predictive alerts: "X students at risk of falling below threshold"
- [ ] Report export (PDF/CSV)
- [ ] RLS: HoD sees own department; Principal sees all

## Blocked by

- #17 — Full Role Dashboards
- #08 — Timetable Management (for trend projections)
