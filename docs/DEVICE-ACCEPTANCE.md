# M2 device acceptance checklist (run on a REAL Android phone)

Rules: tick a box only after you actually did it on the device. Write what you saw. If something fails or you could not test it, write that. No claim without evidence. No iOS claims.

Record first: `npm run android:device-info` and paste the output into `docs/EVIDENCE-M2.md`.

Labels to use for every result: `contract-ready` | `mock-ready` | `backend-verified` | `integrated` | `release-verified`.

## 1. Full journey
- [ ] Fresh install -> Login -> real sign-in through the backend (not fixture mode) -> Courses -> Register -> Session -> Log out.
- [ ] Repeat against the accepted mock backend. Note which of the two was used each time.
- Backend/PostgreSQL revision: ____  Contract (C0/C1/C2) revision: ____

## 2. Navigation and touch
- [ ] Android back button on every screen behaves sensibly (does not exit the app from a tab by accident, does not return to Login while signed in).
- [ ] All buttons and tabs are easy to hit with a thumb (48dp minimum is built in; confirm by hand).
- [ ] Rotate the phone / split screen: nothing is cut off.

## 3. Screen reader (TalkBack)
Turn on: Settings > Accessibility > TalkBack.
- [ ] Every button/tab is announced with a clear name and role.
- [ ] Each course card and assessment card reads as one sentence (code, title, date, crunch level).
- [ ] Crunch level is spoken, not just shown by color.
- [ ] Loading / error messages are announced.
- [ ] Readable chart alternative: no charts exist in M0/M2. When one is added it MUST have a text summary. Write "n/a, no charts yet" until then.

## 4. Text scaling
Settings > Display > Font size = largest, and Display size = largest.
- [ ] No text overlaps or is cut off on Login, Courses, Register, Session.
- [ ] Buttons stay tappable.
- Limits found: ____

## 5. Failure cases
- [ ] Network loss: turn on airplane mode mid-sign-in -> clear message, no crash. Turn it off, retry -> works.
- [ ] Expired session: wait for / force expiry -> app returns to Login with "session expired".
- [ ] Revoked session: revoke on the backend -> next launch returns to Login.
- [ ] Cancelled sign-in: close the browser early -> "Sign-in cancelled", can retry.
- [ ] Replayed/old callback link: reopen an old callback -> rejected.
- [ ] Stale or incomplete imports: backend returns stale/partial data -> app shows it without crashing and does not claim it is fresh. (Needs backend support; mark "blocked" if not available.)
- [ ] Duplicate/concurrent decisions: same decision made on web and on Android -> both devices end in the same final status. (Needs M1/O1/O2/A2; mark "blocked" if not available.)

## 6. Official dates
- [ ] Before and after a local approval, the official assessment dates shown in the Register are unchanged.
- [ ] The app never sends any write to Canvas.

## 7. Install path
- [ ] `npm run android:install` builds a release APK and installs it. SHA-256: ____
- [ ] Fresh install on a clean device works. Environment (Node/JDK/Gradle versions): ____

## 8. Cross-device check with Sedra
- [ ] Same account on the web app (Sedra) and on Android shows the same authority/status.
- Date/time done: ____  Result: ____

## 9. iOS
- Not attempted unless every Android gate above passes and real Mac/iPhone access exists. Write "iOS: not tested".
