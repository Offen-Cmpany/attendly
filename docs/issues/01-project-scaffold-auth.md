# Project Scaffold + Auth Foundation

**Phase:** 0 — MVP
**Type:** HITL
**Priority:** Highest

## What to build

Set up the foundational project structure and authentication system. This includes creating the Expo + Expo Router project, connecting to Supabase, defining the core database schema, implementing Row-Level Security policies, and building the authentication screens (login, register, forgot-password). The result is a running app where users can sign up and log in, with proper role-based access enforced through RLS.

End-to-end behavior:
- A user opens the app and sees a login screen
- A new user can register (student) or receive an invite (faculty)
- After login, the user is routed to the appropriate home screen based on their role
- JWT sessions persist across app restarts
- All database access is protected by RLS policies

## Acceptance criteria

- [ ] Expo project with Expo Router file-based routing is set up and runs on iOS/Android
- [ ] Supabase project is connected with proper anon key and URL configuration
- [ ] Core schema is deployed via SQL migration: `users`, `batches`, `departments`, `course_durations` tables
- [ ] RLS policies enforce: users see only their own data; faculty see assigned course_durations; HoD sees department data; Super Admin sees all
- [ ] `has_permission(user_id, permission_name)` helper function exists in PostgreSQL
- [ ] Login screen works with email + password via Supabase Auth
- [ ] Student registration validates `@cek.ac.in` domain
- [ ] Password reset sends email via Supabase Auth
- [ ] JWT session persists across app restarts
- [ ] Post-login routing sends Student → StudentDashboard, Faculty → FacultyDashboard, etc.
- [ ] `theme.ts` design system is set up and applied to auth screens

## Blocked by

None — can start immediately.
