# Notification Events Wiring

**Phase:** 1 — v1.0 Foundation
**Type:** AFK
**Priority:** Medium

## What to build

Wire up the specific notification events across the app. Call the notification infrastructure (from #11) at each trigger point: attendance marked, leave status changes, defaulter alerts, activity certificate reviewed.

Notification events:

| Trigger | Recipient | Title | Body |
|---|---|---|---|
| Attendance marked | Student | "Attendance Marked" | "Your attendance for {course} on {date} has been marked." |
| Leave approved by Advisor | Student | "Leave Update" | "Your leave request has been approved by your Class Advisor." |
| Leave approved by HoD | Student | "Leave Approved" | "Your leave has been fully approved." |
| Leave rejected (any step) | Student | "Leave Update" | "Your leave request was rejected. Reason: {reason}" |
| Leave pending Advisor | Class Advisor | "Leave Request" | "{student} has submitted a leave request." |
| Leave pending HoD | HoD | "Leave Request" | "{student}'s leave is awaiting your approval." |
| Defaulter alert | Student | "Attendance Alert" | "You're at Z%. You need X of Y remaining classes." |
| Activity certificate reviewed | Student | "Activity Points" | "Your certificate has been reviewed. Points awarded: {points}." |

## Acceptance criteria

- [ ] After attendance marking, student receives "Attendance Marked" notification
- [ ] On leave status change, appropriate notification sent to student/advisor/hod
- [ ] On defaulter threshold cross, student receives smart alert notification
- [ ] On activity certificate review, student receives notification
- [ ] Each notification includes deep-link data (e.g., {screen: "leave-detail", leaveId: "..."})
- [ ] Tapping notification navigates to the relevant screen
- [ ] Notification content matches the table above

## Blocked by

- #11 — Push Notifications Infrastructure
- #09 — Leave Workflow
- #10 — Smart Defaulter Alerts
