# Getting an installable APK (pick ONE path)

Expo Go is great for a demo but is NOT an installable app and is not "native build evidence". For M2 you need one of these.

## Path A: free cloud build with EAS (easiest on Windows, no Android Studio build needed)
Free tier is allowed (no paid service). You need a free expo.dev account.
```
npm.cmd install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```
`eas.json` (already in this folder) makes the `preview` profile produce an **.apk**. When the build ends, download the APK from the link.
Hash it:
```
Get-FileHash .\breather-preview.apk -Algorithm SHA256
```
Copy the phone: send the APK to the phone (USB, Drive), tap it, allow "install unknown apps".
Real-backend note: preview builds are release-like and BLOCK plain http. A real backend must use https, or use Path B.

## Path B: local build (needs Android Studio + a phone with USB debugging)
```
npx.cmd expo prebuild --platform android
npx.cmd expo run:android --device          # debug build, allows http to your laptop
adb reverse tcp:8080 tcp:8080              # phone can reach backend on laptop port 8080
```
The APK ends up in `android\app\build\outputs\apk\`. Hash it with Get-FileHash. Move the project out of OneDrive first (e.g. C:\dev\breather).

## What to record
APK file name, SHA-256, build date, the git commit it was built from, and phone model/Android version. Put them in docs/EVIDENCE-M2.md.
If you could not build one, write that plainly. Do not invent a hash.
