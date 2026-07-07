#!/usr/bin/env bash
# Thinking Errors NotePad — iOS release preflight doctor

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/ios-release-common.sh
source "$SCRIPT_DIR/ios-release-common.sh"

ten_ios_header "Thinking Errors NotePad — iOS Release Doctor"

ten_ios_require_main_branch
echo "✓  Branch: $(git rev-parse --abbrev-ref HEAD)"

if git diff --quiet && git diff --cached --quiet; then
  echo "✓  Worktree clean"
else
  echo "⚠  Worktree has local changes:"
  git status --short
fi

ten_ios_require_xcode
echo "✓  Xcode: $("${TEN_IOS_XCODEBUILD}" -version | tr '\n' ' ')"

ten_ios_load_asc_config
echo "✓  App Store Connect key config: $TEN_IOS_CONFIG_FILE"
echo "✓  App Store Connect key ID: $ASC_KEY_ID"
echo "✓  App Store Connect key file exists"

PROJECT_PATH="ios/App/App.xcodeproj"
if [ ! -d "$PROJECT_PATH" ]; then
  echo "✗  Missing Xcode project: $PROJECT_PATH"
  exit 1
fi

if "$TEN_IOS_XCODEBUILD" -list -project "$PROJECT_PATH" | grep -q "App"; then
  echo "✓  Xcode scheme available: App"
else
  echo "✗  Xcode scheme not found: App"
  exit 1
fi

BUNDLE_ID="$(ten_ios_project_setting PRODUCT_BUNDLE_IDENTIFIER)"
TEAM="$(ten_ios_project_setting DEVELOPMENT_TEAM)"
VERSION="$(ten_ios_project_setting MARKETING_VERSION)"
BUILD="$(ten_ios_project_setting CURRENT_PROJECT_VERSION)"

echo "✓  Bundle ID: $BUNDLE_ID"
echo "✓  Team ID: $TEAM"
echo "✓  Version: $VERSION ($BUILD)"

if [ "$BUNDLE_ID" != "$TEN_IOS_BUNDLE_ID" ]; then
  echo "✗  Unexpected bundle ID: $BUNDLE_ID"
  exit 1
fi

if [ "$TEAM" != "$TEN_IOS_TEAM_ID" ]; then
  echo "✗  Unexpected team ID: $TEAM"
  exit 1
fi

echo ""
echo "✓  iOS release preflight passed."
echo "   This app has no server, no auth redirects, and no push entitlements —"
echo "   there is nothing to configure outside this repo."
