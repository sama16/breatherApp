# Breather M2: run the verification commands and save the REAL output to docs/evidence-run/.
# Usage (PowerShell, from the project folder):   powershell -ExecutionPolicy Bypass -File scripts\accept.ps1
# This script only records what happens. It never writes "pass" for you.
$ErrorActionPreference = 'Continue'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$out = "docs\evidence-run\run-$stamp.txt"
New-Item -ItemType Directory -Force -Path docs\evidence-run | Out-Null

function Section($title, [scriptblock]$cmd) {
  Add-Content $out "`n===== $title ====="
  Add-Content $out "(started $(Get-Date -Format o))"
  $o = & $cmd 2>&1 | Out-String
  Add-Content $out $o
  Add-Content $out "(exit code: $LASTEXITCODE)"
}

Add-Content $out "Breather M2 verification run $stamp"
Section 'Environment' { "node $(node -v)"; "npm $(npm.cmd -v)"; (Get-CimInstance Win32_OperatingSystem).Caption }
Section 'Git (BASE / head / status)' { git rev-parse --abbrev-ref HEAD; git rev-parse HEAD; git status --short; git log -3 --oneline }
Section 'npx expo-doctor' { npx.cmd expo-doctor }
Section 'npm run typecheck' { npm.cmd run typecheck }
Section 'npm test -- --runInBand' { npm.cmd test -- --runInBand }
Section 'adb devices' { adb devices -l }
Section 'Device properties' {
  "model:   $(adb shell getprop ro.product.model)"
  "brand:   $(adb shell getprop ro.product.brand)"
  "android: $(adb shell getprop ro.build.version.release) (API $(adb shell getprop ro.build.version.sdk))"
}
Section 'APK hash (if an APK exists)' {
  $apk = Get-ChildItem -Recurse -Filter *.apk -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if ($apk) { $apk.FullName; Get-FileHash $apk.FullName -Algorithm SHA256 | Format-List } else { "No APK found. Build one first (see docs/APK-BUILD.md)." }
}
Write-Host "`nSaved: $out  (open it, check it, and paste the relevant parts into docs/EVIDENCE-M2.md)"
