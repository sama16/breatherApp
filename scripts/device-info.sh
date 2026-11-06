#!/usr/bin/env bash
# Prints real device/emulator facts for the evidence doc. Needs `adb` and a connected device or emulator.
set -euo pipefail

if ! command -v adb >/dev/null 2>&1; then
  echo "adb not found. Install Android Studio and add platform-tools to PATH." >&2
  exit 1
fi

DEVICES=$(adb devices | awk 'NR>1 && $2=="device" {print $1}')
if [ -z "$DEVICES" ]; then
  echo "No device connected. Start an emulator or plug in a phone with USB debugging on." >&2
  exit 1
fi

for d in $DEVICES; do
  echo "=== $d ==="
  echo "Model:        $(adb -s "$d" shell getprop ro.product.model | tr -d '\r')"
  echo "Manufacturer: $(adb -s "$d" shell getprop ro.product.manufacturer | tr -d '\r')"
  echo "Android:      $(adb -s "$d" shell getprop ro.build.version.release | tr -d '\r') (API $(adb -s "$d" shell getprop ro.build.version.sdk | tr -d '\r'))"
  echo "Emulator?:    $(adb -s "$d" shell getprop ro.kernel.qemu | tr -d '\r' | sed 's/^$/0/')"
done
echo "--- Host ---"
echo "Date:   $(date -Iseconds)"
echo "Node:   $(node -v)"
echo "Java:   $(java -version 2>&1 | head -1)"
echo "Git:    $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo n/a) @ $(git rev-parse --short HEAD 2>/dev/null || echo n/a)"
