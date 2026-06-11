# Attendly: System Design & Feature Specification

This document outlines the core architecture, features, and functionality that have been built into the Attendly application up to this point.

## 1. Core Attendance Engine
The fundamental engine of the application revolves around making attendance tracking frictionless for faculty.
- **Absence-First Model:** All students are marked "Present" by default. Faculty simply tap on the names of absent students to toggle their status, dramatically speeding up the marking process for large classes.
- **Session Metadata:** Each attendance record optionally captures the "Topic Covered" and the "Delivery Method" (e.g., Lecture, Lab, Tutorial) for academic auditing.
- **Historical Editing:** Faculty and Admins can seamlessly navigate back to past sessions and modify attendance records via the dedicated Edit Attendance flow (`edit-attendance/[id]`).

## 2. Role-Based Dashboards
The application utilizes Supabase Auth paired with a `profiles` table to aggressively route and restrict user experiences based on their organizational role.

### Student Dashboard
- **Real-Time Tracking:** Students see their live attendance percentage for every enrolled course.
- **Health Indicators:** Color-coded visual health indicators:
  - **Safe (Green):** >80%
  - **Warning (Orange):** 75% - 79%
  - **Critical (Red):** <75%
- **Actionable Alerts:** Warning cards for severe shortage, directly surfacing the number of classes they can afford to miss.

### Teacher Dashboard
- **Daily Schedule:** Quick overview of assigned courses and batches.
- **Recent Sessions:** A log of recently marked classes allowing for quick double-checking or editing.
- **Quick Actions:** Direct routing to "Mark Attendance" for specific course durations.

### Admin Dashboard (Principal / HoD / Office Staff)
- **Global Oversight:** High-level KPIs showing total students, total faculty, and aggregate college-wide attendance percentage.
- **Departmental Progress:** Visual progress bars breaking down attendance health by program/department (e.g., B.Tech CSE vs BCA).

## 3. Advanced Reporting Engine
A robust, device-native CSV generation pipeline built using `expo-file-system` and `expo-sharing`.
- **Restricted Access:** Strictly hidden from students. Teachers can export reports for their assigned courses; Admins can export reports for any course.
- **Report Types Available:**
  - **Roll Lists:** Standard student lists for physical printing.
  - **Attendance Pivot:** Day-by-day matrix showing P/A for every student.
  - **Consolidated Attendance:** Aggregate percentage and attended/total counts.
  - **Internal Assessment / Progress Cards:** Marks and attendance merged into a unified performance report.

## 4. Community Events & Registrations (Phase 1)
A fully-fledged system to handle extracurricular activities, club events, and academic conferences.
- **Proposal Workflow (Option B):** Students can submit proposals/curation requests for new events.
- **Admin/Faculty Approval:** Staff review pending proposals and approve/reject them. Once approved, the event becomes "Published".
- **Registration Tracking:** Students register for published events.
- **Duty Leave Integration:** Events can be marked as "Duty Leave Eligible", allowing seamless integration with the core attendance engine later.
- **Attendee Management:** Admins can view complete attendee lists and approve/reject individual student registrations.

## 5. Attendance Calendar (Phase 2)
A visual, highly interactive month-view calendar for staff to manage historical data.
- **Custom Native UI:** Built with existing design tokens for maximum performance (no bloated third-party calendar packages).
- **Teacher View (My Schedule):** Highlights days where the logged-in teacher has recorded sessions.
- **Admin View (Global Oversight):** Highlights days with any recorded sessions across the entire institution.
- **Inline Session Inspector:** Tapping a day pulls up detailed cards for every session that occurred on that date, complete with direct links to the Edit Attendance screen.

## 6. Technical & Native Architecture
- **Supabase Backend:** 
  - Strict Row Level Security (RLS) policies.
  - Service Role scripts for rich, bulk dummy-data seeding (`seed_rich.mjs`).
- **Expo / React Native (SDK 54):**
  - Fully compatible Android/iOS native compilation.
  - Cleaned native dependencies (stripped conflicting URL polyfills and forced strict native package alignment via `npx expo install --fix`).
  - Required `babel.config.js` properly configured for reliable EAS cloud builds.
- **Design System:** Consistent, premium aesthetic utilizing predefined semantic tokens (colors, fonts, hairlines) across all screens.
