# OBE Basics — CO Mapping

**Phase:** 3 — v2.0 Expansion
**Type:** HITL
**Priority:** Low

## What to build

Outcome-Based Education basics: map Course Outcomes (COs) to Program Outcomes (POs), evaluate attainment based on internal marks and attendance. This was identified as EzyGo's core differentiator — evaluate demand before building.

**Important:** The PRD explicitly says "evaluate demand" before building. This issue should start with a demand assessment phase.

End-to-end behavior:
- Admin/curriculum designer defines COs per course, maps to POs
- Faculty maps assessment components to COs
- System calculates CO attainment % based on assessment scores
- Reports: CO-PO mapping matrix, attainment levels per CO

## Acceptance criteria (subject to demand evaluation)

- [ ] CO/PO definition schema: `course_outcomes`, `program_outcomes`, `co_po_mapping`
- [ ] Assessment-to-CO mapping per assessment component
- [ ] Attainment calculation: % of students scoring above threshold per CO
- [ ] CO-PO mapping matrix report
- [ ] RLS: curriculum designer/Admin manages; HoD views; Faculty views own courses

## Blocked by

- #13 — Internal Marks
