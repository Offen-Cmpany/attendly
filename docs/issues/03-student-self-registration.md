# Student Self-Registration

**Phase:** 0 — MVP
**Type:** AFK
**Priority:** High

## What to build

A registration screen for students to create their own accounts using their CEK email address. The student enters their name, CEK email (`@cek.ac.in`), and password. The system validates the domain, checks for duplicates, creates the Supabase Auth user, and assigns them to a batch (either auto-detected from email prefix or manually selected from available batches).

End-to-end behavior:
- New student opens app → taps "Register" → enters name, email, password
- Email must end with `@cek.ac.in` — other domains rejected
- If the email domain is valid, system checks if email is already registered
- Student selects their batch from a dropdown (e.g., "2024-2028 CSE")
- Account created → JWT session started → routed to Student dashboard
- Student is now visible in attendance marking screens for their course_durations

## Acceptance criteria

- [ ] Registration screen with name, email, password, batch-select fields
- [ ] Email domain validation: must end with `@cek.ac.in`
- [ ] Duplicate email check before creating account
- [ ] Batch selector populated from `batches` table
- [ ] Account creation via Supabase Auth + `users` table insert with role = 'student'
- [ ] Auto-login after registration (JWT session started)
- [ ] Error states: invalid email, duplicate email, network error
- [ ] Loading state during account creation

## Blocked by

- #01 — Project Scaffold + Auth Foundation
