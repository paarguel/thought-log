#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
signing="$HOME/.thinking-errors-notepad/android-signing.properties"
if [[ ! -f "$signing" ]]; then
  echo "Missing $signing. Follow docs/google-play/release-checklist.md." >&2
  exit 1
fi
npm run lint
npm test
npm run android:sync
(cd android && ./gradlew --no-daemon lintRelease bundleRelease)
bundle="android/app/build/outputs/bundle/release/app-release.aab"
"$JAVA_HOME/bin/jarsigner" -verify "$bundle"
shasum -a 256 "$bundle"
echo "Upload: $PWD/$bundle"
