#!/usr/bin/env bash
# Builds a RELEASE APK locally (no paid cloud), prints its SHA-256, and installs it on the connected device.
# Usage: npm run android:install
# Needs: JDK 17, Android SDK (ANDROID_HOME set), adb, a connected device/emulator.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -d android ]; then
  echo ">> Generating native Android project (expo prebuild)"
  npx expo prebuild --platform android --no-install
fi

echo ">> Building release APK"
(cd android && ./gradlew assembleRelease)

APK=$(ls android/app/build/outputs/apk/release/*.apk | head -1)
echo ">> APK: $APK"
echo ">> SHA-256:"
sha256sum "$APK" | tee "$(dirname "$APK")/SHA256.txt"

echo ">> Installing"
adb install -r "$APK"
echo ">> Done. Open 'Breather' on the device. Record the hash above in docs/EVIDENCE-M2.md."
echo "NOTE: release builds block plain http. For a local http backend use the debug build: npm run android"
