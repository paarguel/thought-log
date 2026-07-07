#!/usr/bin/env bash
# Thinking Errors NotePad — iOS archive
#
# Archives the Capacitor iOS app from the command line using App Store Connect
# API-key authentication for Xcode provisioning updates.
#
# Usage:
#   npm run ios:archive
#   ARCHIVE_PATH="/path/to/App.xcarchive" npm run ios:archive

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/ios-release-common.sh
source "$SCRIPT_DIR/ios-release-common.sh"

ten_ios_header "Thinking Errors NotePad — iOS Archive"
ten_ios_require_main_branch
ten_ios_require_clean_worktree
ten_ios_require_xcode
ten_ios_load_asc_config

PROJECT_PATH="ios/App/App.xcodeproj"
SCHEME="${IOS_SCHEME:-App}"
CONFIGURATION="${IOS_CONFIGURATION:-Release}"
DESTINATION="${IOS_DESTINATION:-generic/platform=iOS}"

if [ ! -d "$PROJECT_PATH" ]; then
  echo "✗  Missing Xcode project: $PROJECT_PATH"
  exit 1
fi

VERSION="$(ten_ios_project_setting MARKETING_VERSION)"
BUILD="$(ten_ios_project_setting CURRENT_PROJECT_VERSION)"
VERSION="${VERSION:-unknown}"
BUILD="${BUILD:-unknown}"

ARCHIVE_PATH="${ARCHIVE_PATH:-$TEN_IOS_ARCHIVES_DIR/$(date '+%Y-%m-%d')/ThinkingErrors-${VERSION}-b${BUILD}-$(date '+%H%M%S').xcarchive}"
mkdir -p "$(dirname "$ARCHIVE_PATH")"

echo "✓  Xcode:       $("${TEN_IOS_XCODEBUILD}" -version | tr '\n' ' ')"
echo "✓  Config:      $TEN_IOS_CONFIG_FILE"
echo "✓  Key ID:      $ASC_KEY_ID"
echo "✓  Project:     $PROJECT_PATH"
echo "✓  Scheme:      $SCHEME"
echo "✓  Version:     $VERSION ($BUILD)"
echo "✓  Archive:     $ARCHIVE_PATH"
echo ""
echo "── Archiving ─────────────────────────────────────────────"

if [ "${TEN_IOS_DRY_RUN:-0}" = "1" ]; then
  echo "DRY RUN: would run xcodebuild archive."
  echo "DRY RUN: would create archive at $ARCHIVE_PATH"
  exit 0
fi

"$TEN_IOS_XCODEBUILD" \
  -project "$PROJECT_PATH" \
  -scheme "$SCHEME" \
  -configuration "$CONFIGURATION" \
  -destination "$DESTINATION" \
  -archivePath "$ARCHIVE_PATH" \
  archive \
  -allowProvisioningUpdates \
  "${TEN_IOS_ASC_AUTH_ARGS[@]}"

ten_ios_archive_info "$ARCHIVE_PATH"

echo ""
echo "✓  Archive completed: $ARCHIVE_PATH"
echo "   Version: $TEN_IOS_ARCHIVE_VERSION ($TEN_IOS_ARCHIVE_BUILD)"
echo "   Next: npm run ios:upload -- \"$ARCHIVE_PATH\""
