# SMS / Email Gateway

**Phase:** 3 — v2.0 Expansion
**Type:** HITL
**Priority:** Low

## What to build

Extend the notification system to include SMS and email delivery channels via a third-party provider (Twilio for SMS, SendGrid/Resend for email). Allows important notifications (defaulter alerts, leave approvals) to reach users even when they don't have the app open.

End-to-end behavior:
- Configure provider API keys in Supabase (SMS provider + email provider)
- Important notifications (determined by type) are sent via SMS/email in addition to push
- Users can opt in/out of SMS notifications in settings
- Email notifications use the user's registered email address

## Acceptance criteria

- [ ] SMS provider integration (Twilio or equivalent)
- [ ] Email provider integration (SendGrid/Resend or equivalent)
- [ ] Notification routing: critical types (defaulter alerts, leave approvals) sent via SMS + email
- [ ] User notification preferences: push vs SMS vs email toggles
- [ ] Provider credentials stored securely (Supabase secrets)
- [ ] Delivery status tracking
- [ ] RLS: users manage their own notification preferences

## Blocked by

- #11 — Push Notifications Infrastructure
