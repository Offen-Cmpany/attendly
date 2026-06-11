# Supabase setup

This app uses Supabase for authentication, PostgreSQL data storage, and Row Level Security.

## 1. Project

1. Create a project at https://supabase.com.
2. Copy the project URL and anon public key from Project Settings -> API.
3. Add them to `app/.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=your_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

The app reads these values in `src/lib/supabase.ts`.

## 2. Database

Create the required tables in your Supabase database before running the app. The current app expects these core tables:

- `profiles`
- `batches`
- `courses`
- `course_durations`
- `attendance_records`
- `attendance_entries`
- `marks`
- `program_outcomes`
- `course_outcomes`
- `co_po_mapping`
- `university_marks`
- `settings`
- `communities`
- `events`
- `event_registrations`

Apply Row Level Security policies from `supabase/rls_policies.sql` after the schema is created.
Apply community and event workflow tables from `supabase/events_schema.sql` after the base profile/role helpers exist.

## 3. Auth and profiles

Users sign in through Supabase Auth. On first sign-in, the app creates a row in `profiles` using the Supabase Auth user ID.

Supported app roles:

- `student`
- `teacher`
- `admin`

Admin designations are stored separately in `profiles.designation`:

- `hod`
- `principal`
- `office_staff`
- `pending_staff`

## 4. Local development

Install dependencies and start Expo:

```bash
npm install
npm start
```

For web:

```bash
npm run web
```
