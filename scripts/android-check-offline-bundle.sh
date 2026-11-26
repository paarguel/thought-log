#!/usr/bin/env bash
set -euo pipefail

bundle="${1:?Usage: bash scripts/android-check-offline-bundle.sh <signed.aab>}"
sdk="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
aapt2="$sdk/build-tools/36.0.0/aapt2"

if [[ ! -x "$aapt2" ]]; then
  echo 'Install Android SDK Build Tools 36.0.0 before checking the bundle.' >&2
  exit 1
fi

scratch_dir="$(mktemp -d)"
trap 'rm -rf "$scratch_dir"' EXIT

# AAPT2 reads the bundle's protobuf XML when the manifest is at the ZIP root.
unzip -p "$bundle" base/manifest/AndroidManifest.xml > "$scratch_dir/AndroidManifest.xml"
zip -jq "$scratch_dir/manifest.apk" "$scratch_dir/AndroidManifest.xml"
manifest="$("$aapt2" dump xmltree --file AndroidManifest.xml "$scratch_dir/manifest.apk")"

if [[ "$manifest" == *'android.permission.INTERNET'* ]]; then
  echo 'Offline release check failed: the bundle includes the Internet permission.' >&2
  exit 1
fi

if ! grep -Eq ':allowBackup\([^)]*\)=false([[:space:]]|$)' <<< "$manifest"; then
  echo 'Offline release check failed: the bundle must disable Android backup.' >&2
  exit 1
fi

unzip -p "$bundle" base/assets/capacitor.config.json | node -e '
  const { readFileSync } = require("node:fs");
  const config = JSON.parse(readFileSync(0, "utf8"));
  if (config.server?.url) {
    console.error("Offline release check failed: Capacitor loads a remote server URL.");
    process.exitCode = 1;
  }
'

echo 'Offline bundle checks passed. Packaged identity:'
grep -E 'A: (package=|[^[:space:]]*:version(Code|Name)\()' <<< "$manifest"
