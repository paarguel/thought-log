#!/usr/bin/env bash
# Thinking Errors NotePad — App Store Connect upload
#
# Uploads an existing Xcode archive to App Store Connect/TestFlight using an
# App Store Connect API key. This avoids relying on Xcode's GUI Apple ID session.
#
# Usage:
#   npm run ios:upload -- "/path/to/App.xcarchive"
#   bash scripts/ios-upload.sh          # uses the newest ThinkingErrors archive

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/ios-release-common.sh
source "$SCRIPT_DIR/ios-release-common.sh"

EXPORT_PATH="${EXPORT_PATH:-/tmp/ThinkingErrors-ios-upload-$(date '+%Y%m%d-%H%M%S')}"

ten_ios_header "Thinking Errors NotePad — App Store Connect Upload"
ten_ios_require_xcode
ten_ios_load_asc_config

ARCHIVE_PATH="${1:-${ARCHIVE_PATH:-}}"
if [ -z "$ARCHIVE_PATH" ]; then
  if [ ! -d "$TEN_IOS_ARCHIVES_DIR" ]; then
    echo "✗  No archive path provided and archives directory does not exist:"
    echo "   $TEN_IOS_ARCHIVES_DIR"
    exit 1
  fi

  ARCHIVE_PATH="$(ten_ios_latest_archive)"
fi

if [ -z "$ARCHIVE_PATH" ] || [ ! -d "$ARCHIVE_PATH" ]; then
  echo "✗  Archive not found: ${ARCHIVE_PATH:-none}"
  echo ""
  echo "   Pass one explicitly:"
  echo "   npm run ios:upload -- \"$TEN_IOS_ARCHIVES_DIR/<date>/<archive>.xcarchive\""
  exit 1
fi

ten_ios_archive_info "$ARCHIVE_PATH"

EXPORT_OPTIONS="$(mktemp /tmp/ThinkingErrors-ExportOptions.XXXXXX.plist)"
trap 'rm -f "$EXPORT_OPTIONS"' EXIT

ten_ios_write_export_options "$EXPORT_OPTIONS"

echo "✓  Xcode:     $("${TEN_IOS_XCODEBUILD}" -version | tr '\n' ' ')"
echo "✓  Config:    $TEN_IOS_CONFIG_FILE"
echo "✓  Key ID:    $ASC_KEY_ID"
echo "✓  Archive:   $ARCHIVE_PATH"
echo "✓  Version:   $TEN_IOS_ARCHIVE_VERSION ($TEN_IOS_ARCHIVE_BUILD)"
echo "✓  Export to: $EXPORT_PATH"
echo ""
echo "── Uploading to App Store Connect ─────────────────────────"

if [ "${TEN_IOS_DRY_RUN:-0}" = "1" ]; then
  echo "DRY RUN: would run xcodebuild -exportArchive."
  echo "DRY RUN: would upload archive $ARCHIVE_PATH"
  exit 0
fi

"$TEN_IOS_XCODEBUILD" -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_PATH" \
  -exportOptionsPlist "$EXPORT_OPTIONS" \
  -allowProvisioningUpdates \
  "${TEN_IOS_ASC_AUTH_ARGS[@]}"

echo ""
echo "✓  Upload command completed."
echo "   Next: wait for processing in App Store Connect, then submit for review."
