# Breather mobile: beginner guide (start here)

You do not need any background. Do the steps in order. Copy each command exactly.
Written for Windows first (Mac/Linux notes in brackets). Total time: about 1.5 hours the first time, mostly downloads.

**Words you will see**
- **Terminal**: the black window where you type commands. Windows: open "PowerShell". Mac: open "Terminal".
- **Repo**: the project folder shared on GitHub (`Breather-App/mobile`).
- **Branch**: your own copy of the work inside the repo, so you never touch `main`.
- **Emulator**: a fake Android phone that runs on your PC.
- **Fixture mode**: the app uses clearly labelled fake data, so it works without the backend.

---

## Part 1: Install the tools (one time)

1. **Git**: https://git-scm.com/downloads . Install with all defaults. Check: `git --version`
2. **Node.js (LTS)**: https://nodejs.org . Install the LTS version. Check: `node -v` (should be 20 or higher) and `npm -v`
3. **Android Studio**: https://developer.android.com/studio . Install with all defaults. It includes the Java (JDK) you need.
   - Open Android Studio once. On the welcome screen choose **More Actions > SDK Manager**.
   - Tab **SDK Platforms**: tick the newest **Android** version (and API 35 or 36 if listed). Click Apply.
   - Tab **SDK Tools**: tick **Android SDK Platform-Tools** and **Android SDK Command-line Tools**. Click Apply.
   - Copy the **Android SDK Location** path shown at the top of the SDK Manager.
4. **Tell your computer where Android is** (so `adb` works).
   - Windows: search "Edit environment variables" > New (user variable): name `ANDROID_HOME`, value = the SDK path you copied.
     Then edit `Path` > New > add `%ANDROID_HOME%\platform-tools`. Close and reopen PowerShell.
   - [Mac/Linux: add `export ANDROID_HOME=$HOME/Library/Android/sdk` (Mac) or `$HOME/Android/Sdk` (Linux) and `export PATH=$PATH:$ANDROID_HOME/platform-tools` to your shell profile.]
   - Check: `adb --version` prints a version.
5. **Make a fake phone**: in Android Studio choose **More Actions > Virtual Device Manager > Create Device**. Pick "Pixel 8", then a system image (download the recommended one), Finish. Press the play button to start it. Wait until you see the Android home screen.

## Part 2: Get the project

6. Make sure you can open https://github.com/Breather-App/mobile in your browser. If you get a 404, accept your GitHub invite (check your email). Still stuck? Message Omar once and continue with the fixture work below.
7. In the terminal:
   ```
   git clone https://github.com/Breather-App/mobile.git
   cd mobile
   git status
   git log -1 --oneline
   ```
   Write down the branch and commit shown (you need them for the evidence).
8. Open `docs/milestone-2/v1.0/START-SAMA.md` in the repo and follow its **safe initial branch** instructions. If the docs are not on `main` yet, they are on the review branch named in the ticket.
9. Create your branch (use the one in your ticket):
   - M0: `git switch -c feat/m2-m0-native-android-foundation-and-backend-authentication-handoff`
   - M2: `git switch -c feat/m2-m2-android-integrated-acceptance-and-install-evidence`
10. **Copy the app files in.** Unzip `breather-mobile.zip`, then copy everything *inside* the unzipped folder into the repo folder (`App.tsx`, `app.json`, `package.json`, `src/`, `scripts/`, `docs/`, ...).
    - If the repo already has files with the same names, **do not overwrite blindly**. Ask Omar or compare first ("preserve unrelated work").
    - Do NOT copy `node_modules` (it is not in the zip).

## Part 3: Run it

11. Install the packages: `npm ci`
    (If it complains there is no lockfile, use `npm install` once and commit the new `package-lock.json`.)
12. Start your fake phone (Part 1, step 5) and leave it open.
13. Run the app: `npm run android`
    The first run takes 5-15 minutes (it builds the Android app). Later runs are fast.
14. You should see **Breather** with a yellow **FIXTURE MODE** banner. Tap **Continue (fixture mode)**. You now have three tabs: **Courses**, **Register**, **Session**.
    - On **Session**, tap `loading`, `empty`, `error`, `ready` to see every screen state. Then go back to Courses/Register.
    - Tap **Log out** to return to login.

If something breaks, see **Troubleshooting** at the bottom.

## Part 4: Run the checks (these are your M0 verification commands)

```
npm ci
npx expo-doctor
npm run typecheck
npm test -- --runInBand
npx expo run:android
```
Copy the real output of each into `docs/EVIDENCE-M0.md`. Never write "passed" for a command you did not run.

## Part 5: Real backend login (when Omar's backend is ready)

15. Ask Omar for: the backend address and port, the real login/exchange/logout/me paths, and the released C0 contract version.
16. Copy `.env.example` to `.env` and set:
    ```
    EXPO_PUBLIC_USE_FIXTURES=0
    EXPO_PUBLIC_BACKEND_URL=http://10.0.2.2:8080
    ```
    - Emulator: `10.0.2.2` means "the PC running the emulator".
    - Real phone: run `adb reverse tcp:8080 tcp:8080` and use `http://localhost:8080`.
17. Edit `src/config.ts` -> `ENDPOINTS` to the real paths. Edit `src/auth/session.ts` (`Profile`) and `src/fixtures/c0.ts` to the released C0 types.
18. Restart with `npm run android`. Test: login, cancel the browser, wait for expiry, log out.

## Part 6: Open the pull request (draft) and hand off

19. Save and upload your work:
    ```
    git status
    git add .
    git commit -m "feat(mobile): native Android foundation and auth handoff"
    git push -u origin HEAD
    ```
    Never push to `main`. Never force-push.
20. On GitHub open a **Draft pull request** from your branch. Ask **Sedra and Omar** to review. **Only Omar merges.**
21. Fill in `docs/EVIDENCE-M0.md` (and later `docs/EVIDENCE-M2.md`) with real results, then tell Omar it is ready.

---

## M2 (after M0 works)

Follow `docs/DEVICE-ACCEPTANCE.md`. Install on a real phone: `npm run android:install`. Record the hash it prints.

## Troubleshooting

| Problem | Fix |
|---|---|
| `adb` not recognized | Redo Part 1 step 4, then close and reopen the terminal. |
| `SDK location not found` | Set `ANDROID_HOME`, or create `android/local.properties` with `sdk.dir=C:\\Users\\YOU\\AppData\\Local\\Android\\Sdk`. |
| `JAVA_HOME is not set` | Android Studio > Settings > Build Tools > Gradle > Gradle JDK; or set `JAVA_HOME` to Android Studio's `jbr` folder. |
| App says "Unable to load script" | Run `npx expo start` in a second terminal and press `a`. |
| Emulator very slow | Enable virtualization (Intel VT-x / AMD-V) in BIOS; give the emulator 4 GB RAM. |
| Real phone not listed by `adb devices` | Phone: Settings > About > tap Build number 7 times > Developer options > USB debugging ON. Accept the prompt on the phone. |
| Cannot reach backend from emulator | Use `10.0.2.2`, not `localhost`. Backend must listen on `0.0.0.0` or be reachable from the PC. |
| Weird cache errors | `npx expo start --clear` |
