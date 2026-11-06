# M0 evidence: native Android foundation and backend authentication handoff

Status: **TEMPLATE. Nothing below is a result until you fill it from a real run.**
Owner: Sama. Reviewers: Sedra, Omar.

## Identity
- Repo: Breather-App/mobile
- Branch: ____
- Planning BASE: 2d3baa4dbea360212b255542c0f7eaa9f54af0fb
- Actual BASE / HEAD: ____ / ____
- PR (draft): ____
- Contract (C0) version/hash: ____ (fixtures are labelled and ASSUMED until this is released)
- Schema / config / seed revisions: ____

## Environment
- Host OS: ____  Node: ____  JDK: ____  Gradle: ____  Expo SDK: 58 (package.json)
- Emulator: model ____, Android ____ (API ____)
- Physical device (release evidence): model ____, Android ____ (API ____)
- Backend address used: ____ (emulator: 10.0.2.2; phone: adb reverse / LAN IP)

## Commands and results (paste real output; do not write "passed" unless it did)
| Command | Date/time | Result | Notes |
|---|---|---|---|
| `npm ci` | | | |
| `npx expo-doctor` | | | |
| `npm run typecheck` | | | |
| `npm test -- --runInBand` | | | |
| `npx expo run:android` | | | |

## Acceptance
- [ ] Native Android launches (device/OS/commands above).
- [ ] C0 types and explicit fixture states (loading/empty/error/ready via the Session screen).
- [ ] Backend handoff works with no Canvas secret in the app.
- [ ] Secure storage holds only the session token + expiry (no role, no Canvas data).
- [ ] Cancel, invalid, expired, replayed handoff, and logout all checked on a device.
- [ ] `docs/**` excluded from typecheck/test globs.

## Maturity of each item
contract-ready / mock-ready / backend-verified / integrated / release-verified: ____

## Defects / limitations
- ____

## Reviewer sign-off
- Sedra: ____  Omar: ____
