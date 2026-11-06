# Evidence M1 (template: nothing below is claimed unless marked RUN)

| Check | Status | Notes |
|---|---|---|
| `npx tsc --noEmit` | RUN (sandbox) clean | |
| `npx jest --runInBand` | RUN (sandbox) 49 tests pass | domain, gateway, guard, client |
| `expo export --platform android` | RUN (sandbox) bundle OK | not a device run |
| Emulator walkthrough (professor + student) | NOT RUN | to fill on your machine |
| Physical device / TalkBack | NOT RUN | |
| Backend contract verification (C1/C2) | NOT RUN | placeholders only |
| iOS | NOT ATTEMPTED | only after Android gates pass |

Rules kept: no main push/merge/pin changes; no Canvas write; local approval labelled "Approved locally; not published"; no fixture fallback on real HTTP failures; Omar owns merges/pins.
Placeholders: C1/C2 types and endpoints are assumptions; Preparation = assessments with review status.
