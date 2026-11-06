# Evidence M2: Android integrated acceptance and install evidence

**Rule: every cell below starts as NOT RUN. Change it only after you really did it. Fixture or mock runs must say so.**
No application feature is marked complete by this document.

## 1. Records
| Item | Value |
|---|---|
| Owner | Sama |
| Reviewers | Sedra, Omar |
| Repo / branch | Breather-App/mobile / feat/m2-m2-android-integrated-acceptance-and-install-evidence |
| Planning reference | 2d3baa4dbea360212b255542c0f7eaa9f54af0fb |
| BASE commit | (run `git rev-parse HEAD` before you start) |
| Head commit | |
| Draft PR link | |
| Contract revision (C0/C1/C2) | |
| Schema / config / seed revision | |
| Backend revision + URL | |
| Mock used (name + revision) | |
| Device model | |
| Android version / API | |
| App version | |
| Test date | |

## 2. Maturity of each part (be honest)
Labels: contract-ready, mock-ready, backend-verified, integrated, release-verified.
| Area | Current label | Evidence |
|---|---|---|
| Login / logout / expiry | mock-ready (fixtures) | |
| Student official dates | mock-ready | |
| Professor teaching / workload | mock-ready | |
| Decisions (accept/reject/lock) | mock-ready | |
| Against real backend | NOT RUN | |

## 3. Verification commands
| Command | Result | Date | Output file |
|---|---|---|---|
| npx expo-doctor | NOT RUN | | docs/evidence-run/ |
| npm run typecheck | NOT RUN | | |
| npm test -- --runInBand | NOT RUN | | |
| Local Android build + install | NOT RUN | | |

(`scripts\accept.ps1` runs the first three and saves real output.)

## 4. Device acceptance (copy the text from Settings > Testing > Share evidence text)
Paste here:
```
(paste)
```
Screenshots / screen recording links:

## 5. Scenarios
| # | Scenario | Mode | Result | Evidence |
|---|---|---|---|---|
| S1 | Full student journey on a device | | NOT RUN | |
| S2 | Full professor journey on a device | | NOT RUN | |
| S3 | Airplane mode, then retry | | NOT RUN | |
| S4 | Expired session | | NOT RUN | |
| S5 | Revoked session | | NOT RUN | |
| S6 | Stale / incomplete import | | NOT RUN | |
| S7 | Web + Android decide same proposal (with Sedra) | | NOT RUN | |
| S8 | Official dates unchanged after local approval | | NOT RUN | |
| S9 | Two devices show the same status (with Sedra) | | NOT RUN | |

## 5b. Accessibility (explicit limitations, not claims)
| Check | Result | Notes |
|---|---|---|
| Touch targets | NOT RUN | |
| TalkBack labels | NOT RUN | |
| Text scaling (largest) | NOT RUN | |
| Chart alternative (words + table) | NOT RUN | |
| Back behavior | NOT RUN | |
Known limitations:
- 

## 6. Install artifact
| Item | Value |
|---|---|
| Path used (docs/APK-BUILD.md A or B) | |
| APK file name | |
| SHA-256 | |
| Built from commit | |
| Installed on (device) | |
| Reproducible steps verified by someone else? | |

## 7. iOS
NOT ATTEMPTED. (Only after all Android gates pass and a real Mac and iPhone exist.)

## 8. Unresolved defects
| ID | Description | Severity | Owner |
|---|---|---|---|

## 9. Contribution evidence
| Person | What they did | Link (PR/commit) |
|---|---|---|
| Sama | Android app, tests, evidence | |
| Sedra | | |
| Omar | | |
