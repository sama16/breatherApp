Breather Mobile
Android app that helps students and professors see and reduce assessment crunch,

 the weeks where many assessments overlap.

Links

Demo video
https://drive.google.com/file/d/1rYLqpW51-Mjx14MrkP85M3jV5HDKLByp/view?usp=drive_link


Demo testing 
https://drive.google.com/file/d/1nBskcVAlgxzF4pU1VbLiDQ1SRWZwW4QY/view?usp=sharing


APK
add link here · SHA-256: add hash here
Evidence
docs/EVIDENCE-M2.md



1. What was built
Students
Screen
What it does
Home
Next assessment, number of assessments, and what is coming up
Courses
The student's courses with crunch level
Register
The student's assessments
Official dates
Own official dates from Canvas. Read-only, marked "Unchanged since import"

Professors
Screen
What it does
Home
Number of pending suggestions and the busiest week
Teaching
Courses and preparation items, with data source, coverage and review status
Workload
Busiest weeks as bars, in words, and in a table (screen-reader friendly)
Suggestions
Before/after comparison (same input version only), then Accept, Reject or Lock with a confirmation step
History
A record of every decision


Accepting a suggestion is saved as "Approved locally; not published". It never changes Canvas.
Both roles
Login through the browser, so the app never sees a Canvas password.
Settings
Account: profile and log out
About: what Breather does and does not do
Testing: an on-device acceptance checklist and "Share evidence text"
Clear failure messages for no internet, expired or revoked sessions, stale or incomplete data, and failed decisions. A failure never looks like success, and missing data shows "Not available" instead of 0.


2. Project status
Item
Status
Typecheck
Passing
Android bundle
Builds
Demo on a phone (Expo Go)
Done
APK
Built with EAS (free tier)
Real backend (C1/C2 contracts)
Not connected yet
iOS
Not attempted


The app currently runs on labelled fixture data. Nothing is claimed as backend-verified or integrated.


3. How to run and review it
Requirements: Node.js (LTS) on your computer, and the Expo Go app on an Android phone. The phone and computer must be on the same Wi-Fi.

npm ci
npm start

Scan the QR code with Expo Go.
Tap Continue as professor (fixture) or Continue as student (fixture).
Suggested review path
Role
Try this
Professor
Workload → "Compare before and after" on both suggestions (the second is refused because its inputs differ) → Accept one and confirm → check History
Student
Official dates. They are read-only and unchanged
Failures
Settings → Testing → switch the screen state to network, expired, forbidden or stale. expired signs you out

Checks without the app
npm run typecheck
npm test -- --runInBand
npx expo-doctor

Other commands 

npm run android              # build and run on emulator or device (debug)
npm run android:device-info  # record device details
npm run android:install      # local release APK + SHA-256 + adb install

Acceptance run (Windows PowerShell) 

powershell -ExecutionPolicy Bypass -File scripts\accept.ps1

Runs expo-doctor, typecheck and tests, and saves the real output, git info, device model and APK hash to docs/evidence-run/.


4. Documentation
File
Purpose
docs/BEGINNER-GUIDE.md
Setup from zero
docs/M1-FIXTURE-SCENARIO.md
Fixture walkthrough for the professor and student journeys
docs/EVIDENCE-M1.md
M1 evidence
docs/EVIDENCE-M2.md
M2 evidence. Fill with real results only
docs/APK-BUILD.md
How to produce an installable APK
docs/DEMO-SCRIPT.md
Demo script
docs/GITHUB-GUIDE.md
Git and pull request steps
docs/TEAM-SHOWCASE.md
What to share with teammates



5. Dependencies and next steps
Needed from the backend team

Backend URL
Contract revision
Test student and professor accounts





=
