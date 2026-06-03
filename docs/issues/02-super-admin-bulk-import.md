# Super Admin: Faculty & Student Bulk Import

**Phase:** 0 — MVP
**Type:** AFK
**Priority:** High

## What to build

A Super Admin-only screen for bulk-importing faculty and students from CSV files. The Super Admin uploads a CSV with name, email, department, and role flags, the system parses it, creates user accounts via Supabase Auth, assigns them to departments/batches, and sends invite emails to set passwords.

End-to-end behavior:
- Super Admin logs in → sees "Bulk Import" option
- Uploads a CSV file (name, email, department, role/flags)
- System validates rows (valid email, valid department, no duplicates)
- Valid rows create Supabase Auth users with generated temporary passwords
- Each new user receives an invite email with enrollment link
- Error report is shown for invalid rows
- Imported users appear in the system and can log in

## Acceptance criteria

- [ ] CSV upload UI exists in Super Admin dashboard
- [ ] CSV parser handles: name, email, department, role (faculty/student), batch (for students), is_class_advisor/is_hod/is_principal flags (for faculty)
- [ ] Validation: checks for duplicate emails, valid department/batch references, proper email format
- [ ] Supabase Auth user creation with auto-generated temporary password
- [ ] RLS allows Super Admin to create users across all departments
- [ ] Invite email sent via Supabase Auth magic link or email template
- [ ] Error report displayed: "X rows imported successfully, Y rows failed"
- [ ] Seed CSV template available for download

## Blocked by

- #01 — Project Scaffold + Auth Foundation
