# Demo script (5 to 6 minutes)

Say honestly what mode you are in. If it is fixtures, say "this uses labelled fixture data; the real backend is not connected yet."

## Before you start (2 minutes)
1. Phone and laptop on the same Wi-Fi. Laptop: `npm start`.
2. Open the app (Expo Go scan, or the installed APK). Battery above 50%, Do Not Disturb on.
3. Start a screen recording on the phone (swipe down, Screen recorder).
4. Open docs/EVIDENCE-M2.md on the laptop so you can show it.

## Flow
| Min | Show | Say |
|---|---|---|
| 0:00 | Login screen | "Breather signs in through the browser. The app never sees a Canvas password." |
| 0:30 | Student > Home > Official dates | "Students see their own official dates. They are read-only and come from Canvas." |
| 1:15 | Settings > About | "Here is what Breather does and does not do." |
| 1:45 | Log out, login as professor | "Role comes from the server each session." |
| 2:00 | Home | "Pending suggestions and the busiest week." |
| 2:30 | Workload: bars, In words, Table | "The chart is always repeated as text for screen readers." |
| 3:15 | Compare before/after (suggestion 1, then 2) | "Only results from the same input are compared. Suggestion 2 is refused." |
| 4:00 | Accept > confirm | "Saved as 'Approved locally; not published'. Canvas is not changed." |
| 4:30 | History tab | "Every decision is recorded." |
| 4:45 | Settings > Testing: switch to network, then expired | "Failures never look like success. Expired signs you out." |
| 5:30 | Settings > Testing > Share evidence | "Results are entered by a tester, never auto-passed." |

## If something breaks live
Say what happened, switch state in Settings > Testing back to "ready", continue. Do not hide it. Write it into "Unresolved defects" afterwards.
