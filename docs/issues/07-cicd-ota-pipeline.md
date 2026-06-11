# CI/CD + OTA Deployment Pipeline

**Phase:** 0 — MVP
**Type:** HITL
**Priority:** High

## What to build

A fully automated CI/CD pipeline using GitHub Actions and Expo EAS Update. Every push to `main` triggers a build that auto-publishes an OTA update to all users. No app store approval cycle required for feature updates. Staged rollouts supported via EAS channels (production/staging).

End-to-end behavior:
- Developer pushes code to `main` on GitHub
- GitHub Actions workflow triggers automatically
- Workflow installs dependencies, runs type checks, runs tests
- If checks pass, builds and publishes an OTA update via Expo EAS Update
- Users with the app installed receive an "Update available" prompt on next app open
- Update is applied without requiring an app store download

## Acceptance criteria

- [ ] GitHub Actions workflow file (`.github/workflows/deploy.yml`) exists
- [ ] Workflow runs on push to `main` branch
- [ ] Steps: checkout → install deps → type check → lint → test → EAS Update
- [ ] Expo EAS configured with `eas.json` (production + staging channels)
- [ ] GitHub repository secrets configured for Expo token and Supabase URL
- [ ] EAS Update publishes to production channel on merge to `main`
- [ ] Staging channel available for pre-release testing
- [ ] OTA update delivered to test device within 30 minutes of merge
- [ ] Documentation: how to trigger a rollback if needed

## Blocked by

- #01 — Project Scaffold + Auth Foundation
