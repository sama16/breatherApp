# Breather mobile (Android)

Expo SDK 58, React Native 0.88, TypeScript. Android is the target. No paid cloud builds, no iOS/macOS needed.

**New to this? Read `docs/BEGINNER-GUIDE.md` first.**

## Quick commands
```
npm ci
npm run typecheck
npm test -- --runInBand
npx expo-doctor
npm run android            # build + run on emulator/device (debug)
npm run android:device-info
npm run android:install    # local release APK + SHA-256 + adb install
```

## Layout
```
App.tsx                      app entry (fonts, providers, navigation)
src/theme/branding.ts        colors, type, spacing (from the brand booklet)
src/components/              Button, Card, CrunchChip, StateView, Banner, ...
src/screens/                 Login, Courses, Register (assessments), Session
src/navigation/              signed-out -> Login; signed-in -> tabs
src/auth/handoff.ts          state/replay/expiry/cancel logic (unit-tested)
src/auth/session.ts          token exchange, profile fetch, revoke
src/auth/secureStorage.ts    Android Keystore via expo-secure-store
src/fixtures/c0.ts           LABELLED fixture data (assumed C0 shapes)
docs/                        guides + evidence templates (excluded from build/typecheck/tests)
```

## Security rules built in
- App only talks to the Breather backend. No Canvas URL, secret, or credential in the app.
- Only an opaque session token + expiry is stored (Android Keystore). No role is stored or trusted.
- Role/profile is fetched from the backend each session and kept in memory.
- Handoff `state` is single-use, expires in 5 minutes, and replays are rejected.
- Official assessment dates are shown read-only; the app never writes to Canvas.

## Fixture mode
`EXPO_PUBLIC_USE_FIXTURES=1` (default) shows labelled fixture data and a local fake sign-in (memory only).
Set `0` for the real backend. In real mode, data screens show an explicit "not wired yet" error until the released C0/C1 endpoints are connected. They never show invented data as if it were real.

## Known placeholders (replace when C0 is released)
- `ENDPOINTS` in `src/config.ts`
- `Profile` in `src/auth/session.ts`
- Types and fixtures in `src/fixtures/c0.ts`
- Lint is not configured yet (typecheck + tests are).

## M1 (professor journey + student official dates)
See docs/M1-FIXTURE-SCENARIO.md and docs/EVIDENCE-M1.md. Contract-ready/mock-ready only.

## M2 (acceptance and install evidence)
- docs/EVIDENCE-M2.md: fill with REAL results
- docs/APK-BUILD.md: how to get an installable APK
- scripts/accept.ps1: runs the commands and saves real output
- docs/DEMO-SCRIPT.md, docs/GITHUB-GUIDE.md, docs/TEAM-SHOWCASE.md
- In the app: Settings > Testing has the on-device checklist and "Share evidence text"
