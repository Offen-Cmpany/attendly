# Push Notifications Infrastructure

**Phase:** 1 — v1.0 Foundation
**Type:** HITL
**Priority:** Medium

## What to build

Set up the push notification infrastructure using Expo Push Notifications. This includes: requesting notification permissions, registering device push tokens, storing tokens in Supabase, and creating a Supabase Edge Function (or database trigger) that sends push notifications via Expo's push API.

End-to-end behavior:
- On first launch, app requests notification permission (iOS/Android system dialog)
- If granted, app registers the device's Expo push token and stores it in the `push_tokens` table linked to the user
- A Supabase Edge Function `send-notification` accepts: user_id, title, body, data payload
- The function looks up the user's push tokens and sends to Expo Push API
- App handles incoming notifications: shows in notification tray, tapping opens relevant screen

## Acceptance criteria

- [ ] Expo Push Notifications configured in the Expo project
- [ ] Permission request flow: request permission → handle granted/denied states
- [ ] Push token registration: on login/app-start, check/register token in `push_tokens` table
- [ ] Token cleanup: remove token on logout or if push fails with DeviceNotRegistered
- [ ] Supabase Edge Function `send-notification` deployed
- [ ] Edge Function: receives (user_id, title, body, data) → looks up tokens → sends via Expo Push API
- [ ] Edge Function handles Expo push response codes (DeviceNotRegistered, MessageTooBig, etc.)
- [ ] App-side notification handler: shows system notification, parses data for deep linking
- [ ] RLS: users can only read their own push tokens

## Blocked by

- #07 — CI/CD + OTA Deployment Pipeline
