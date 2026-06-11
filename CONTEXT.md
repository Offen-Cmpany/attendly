# Attendly

A cross-platform mobile application for attendance tracking and academic administration at College of Engineering Kottarakkara (CEK), built by the Offen Company student team. Replaces EzyGo as the institution's academic management system.

## Language

**Attendly**:
The mobile application itself — the product.
_Avoid_: The app, the platform

**Offen Company**:
The internal student development team at CEK that builds and maintains Attendly.

**College of Engineering Kottarakkara (CEK)**:
The single institution Attendly serves. Two departments (plus labs). Institution-wide rollout from day one.

**Super Admin**:
An Offen Company team member outside the CEK academic hierarchy — bulk-imports faculty, sends invites, configures system settings.

**Student**:
A CEK enrollee who belongs to a **Batch**. Students progress automatically through fixed semesters (S1–S8). No per-student course enrollment — courses are determined by the batch's curriculum for each semester.
_Avoid_: User, account

**Batch**:
An intake cohort (e.g., "2024-2028 CSE") that shares the same curriculum and progresses through semesters together.
_Avoid_: Section, class, year

**Faculty**:
A CEK instructor who marks attendance, manages lesson plans, enters internal marks, and adjusts attendance for approved leaves.
_Avoid_: Teacher, professor, staff

**Class Advisor**:
A Faculty member with additional oversight of a specific class section — reviews leave requests and activity point submissions for their section.

**Head of Department (HoD)**:
Manages the department timetable, approves department-level leaves, and views department-wide dashboards.

**Principal**:
CEK's principal — institution-level dashboards and reports.

**Course**:
A subject offered at CEK, identified by code (e.g., CS301). Defined per scheme/curriculum.

**Course Duration**:
A specific instance of a **Course** taught to a **Batch** in a semester (e.g., "CS301 for S4 CSE 2025-26"). Faculty are assigned to **Course Durations**, not to Courses. Attendance, marks, lesson plans, and timetable slots are scoped to a **Course Duration**.

**Attendance Record**:
A single class session where attendance was marked. Belongs to a **Course Duration**. Contains entries for each **Student** with status: present or absent.

**Leave**:
A student request for excused absence. Requires certificate upload. Follows an approval chain (Class Advisor → HoD). An approved leave must be manually applied to the relevant attendance record by faculty — leave approval does not auto-update attendance.

**Medical Leave**:
A leave type requiring an uploaded medical certificate.

**Duty Leave**:
A leave type requiring a supporting document (placement letter, event notice).

**Internal Marks**:
Assessment scores entered by **Faculty** per **Student** per **Course Duration**. Components include internal assessments, tutorial book, and assignments. Total calculated out of 50 for pre-exam reporting.

**University Results**:
End-semester exam scores published by the university. Imported into Attendly via structured screenshot (OCR) for consolidated reporting.

**Activity Points**:
Points granted by the **Class Advisor** for certificates uploaded by **Students** (workshops, seminars, events). Maximum 100 points per student. Private to the student and advisor/HoD.

**Timetable**:
A repeating weekly schedule of class slots, created by the **HoD** per semester. Defines planned sessions per **Course Duration** and drives smart attendance alerts.

**Smart Defaulter Alert**:
A dynamic notification telling a student "You're at Z%. You need to attend X of Y remaining classes to reach 75%" — recalculated in real-time as attendance is marked.

**Scheme**:
The curriculum framework for a batch (e.g., 2019 Scheme, 2024 Scheme). Defines which courses belong to which semester. Multiple schemes may be active simultaneously for different batches.

**EzyGo**:
The competitor being replaced. CEK is a current EzyGo customer. Attendly is a clean-break replacement — no data migration from EzyGo.

**Roles (data model)**:
Users have a base role of **Student** or **Faculty**. Faculty may carry additional permission flags: `is_class_advisor` (scoped to a section), `is_hod` (scoped to a department), `is_principal` (institution-wide).
_Avoid_: Flat role labels — one person may exercise multiple responsibilities.

---

*Example dialogue:*

**Student**: "My attendance is at 72% in CS301 and I got a smart alert — I need 5 of the next 8 classes."
**Faculty**: "I just marked today's lecture and tagged the topic on Fourier transforms."
**Class Advisor**: "I can see three defaulters in S4 CS. I'll approve Venugopal's duty leave since it's placement-related."
**HoD**: "The department heatmap shows CSE is fine but ECE has two faculty who haven't marked attendance in a week."
**Offen Company dev**: "That's a bug in the sync — I'll push an OTA fix in 10 minutes."
