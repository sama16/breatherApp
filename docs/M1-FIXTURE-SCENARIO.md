# M1 Android fixture scenario (labelled: FIXTURE DATA, not real)

Maturity: **contract-ready + mock-ready**. Not backend-verified, integrated or release-verified.

## Run
`npm start` then press `a` (emulator) or scan with Expo Go. Fixture mode is on by default.

## Professor path
1. Login -> "Continue as professor (fixture)".
2. **Teaching** tab: Courses / Preparation segments. Course c3 shows coverage 0 (real zero); c4 shows "Not available" (missing, not zero).
3. **Workload** tab: bars + "In words" + table. Then Suggestions.
4. Suggestion 1: "Compare before and after" -> same input version, table.
   Suggestion 2: compare -> refused (different input versions).
5. Accept -> confirmation -> "Approved locally; not published". Canvas official date unchanged.
6. **History** tab shows the decision. Try Accept again -> not possible (no longer pending).

## Student path
Login -> "Continue as student (fixture)" -> **Official dates** tab: own dates, read-only, "Unchanged since import".

## States to check
Fixture state switcher (Settings > Testing) covers: ready, loading, empty, error, network, expired, revoked, forbidden, unavailable, timeout, stale, incomplete, suppressed, no_result.
expired/revoked sign you out with a message. Failed decisions say "Not saved." and never look like success.

## Placeholders to replace when contracts C1/C2 land
Types in `src/domain/c1.ts`, endpoint paths in `src/config.ts` (ENDPOINTS), HTTP normalizers in `src/api/gateway.ts`.
