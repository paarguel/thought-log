#!/usr/bin/env bash
# Thinking Errors NotePad — cohesive iOS release
#
# Runs release prep (web build + sync + build number), command-line archive,
# and App Store Connect upload. The happy path once the local API-key config
# is installed.
#
# Usage:
#   npm run ios:testflight
#   TEN_IOS_YES=1 npm run ios:testflight   # fully non-interactive

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/ios-release-common.sh
source "$SCRIPT_DIR/ios-release-common.sh"

ten_ios_header "Thinking Errors NotePad — iOS Release"
ten_ios_require_xcode
ten_ios_load_asc_config

echo "This will run:"
echo "  1. Release prep: web build, cap sync, build number bump"
echo "  2. Command-line archive with App Store Connect API-key auth"
echo "  3. App Store Connect upload with the same API-key auth"
echo ""

bash "$SCRIPT_DIR/ios-release.sh"

VERSION="$(ten_ios_project_setting MARKETING_VERSION)"
BUILD="$(ten_ios_project_setting CURRENT_PROJECT_VERSION)"
ARCHIVE_PATH="${ARCHIVE_PATH:-$TEN_IOS_ARCHIVES_DIR/$(date '+%Y-%m-%d')/ThinkingErrors-${VERSION}-b${BUILD}-$(date '+%H%M%S').xcarchive}"

ARCHIVE_PATH="$ARCHIVE_PATH" bash "$SCRIPT_DIR/ios-archive.sh"
bash "$SCRIPT_DIR/ios-upload.sh" "$ARCHIVE_PATH"

echo ""
echo "✓  Release flow completed for build $BUILD."
echo "   Next: wait for processing, install via TestFlight, and smoke test."
