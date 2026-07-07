#!/usr/bin/env bash
# Shared helpers for Thinking Errors NotePad iOS release scripts.
# Ported from the AttuneTogether release tooling.

TEN_IOS_TEAM_ID="${TEAM_ID:-CLKKD53664}"
TEN_IOS_BUNDLE_ID="com.urbanpyx.thinkingerrors"
TEN_IOS_CONFIG_FILE="${TEN_IOS_RELEASE_ENV:-$HOME/.thinking-errors-notepad/ios-release.env}"
TEN_IOS_DEVELOPER_DIR="/Applications/Xcode.app/Contents/Developer"
TEN_IOS_ARCHIVES_DIR="$HOME/Library/Developer/Xcode/Archives"

ten_ios_header() {
  local TITLE="$1"

  echo ""
  echo "══════════════════════════════════════════════════════════"
  echo "  $TITLE"
  echo "  $(date '+%Y-%m-%d %H:%M')"
  echo "══════════════════════════════════════════════════════════"
  echo ""
}

ten_ios_require_xcode() {
  local ACTIVE_DEVELOPER_DIR

  ACTIVE_DEVELOPER_DIR="$(xcode-select -p 2>/dev/null || true)"
  if [ "$ACTIVE_DEVELOPER_DIR" != "$TEN_IOS_DEVELOPER_DIR" ]; then
    echo "✗  Xcode is not the active developer directory."
    echo "   Current:  ${ACTIVE_DEVELOPER_DIR:-unknown}"
    echo "   Expected: $TEN_IOS_DEVELOPER_DIR"
    echo ""
    echo "   Run: sudo xcode-select -s $TEN_IOS_DEVELOPER_DIR"
    exit 1
  fi

  TEN_IOS_XCODEBUILD="$TEN_IOS_DEVELOPER_DIR/usr/bin/xcodebuild"
  if [ ! -x "$TEN_IOS_XCODEBUILD" ]; then
    echo "✗  xcodebuild not found at $TEN_IOS_XCODEBUILD"
    exit 1
  fi
}

ten_ios_load_asc_config() {
  # TEN_IOS_AUTH=xcode: skip API-key auth and rely on an Apple ID signed into
  # Xcode (Settings → Accounts). Needed when the API key can't touch
  # provisioning (role below App Manager).
  if [ "${TEN_IOS_AUTH:-key}" = "xcode" ]; then
    echo "⚠  Using Xcode's signed-in Apple ID session (TEN_IOS_AUTH=xcode)."
    TEN_IOS_ASC_AUTH_ARGS=()
    return
  fi

  if [ -f "$TEN_IOS_CONFIG_FILE" ]; then
    # shellcheck disable=SC1090
    source "$TEN_IOS_CONFIG_FILE"
  else
    echo "✗  Missing local iOS release config: $TEN_IOS_CONFIG_FILE"
    echo ""
    echo "   Create it with:"
    echo "   ASC_KEY_ID=<key id>"
    echo "   ASC_ISSUER_ID=<issuer id>"
    echo "   ASC_KEY_PATH=\$HOME/.appstoreconnect/private_keys/AuthKey_<key id>.p8"
    echo ""
    echo "   (The same App Store Connect API key used for AttuneTogether works —"
    echo "    both apps live in team $TEN_IOS_TEAM_ID.)"
    exit 1
  fi

  for NAME in ASC_KEY_ID ASC_ISSUER_ID ASC_KEY_PATH; do
    if [ -z "${!NAME:-}" ]; then
      echo "✗  Missing $NAME in $TEN_IOS_CONFIG_FILE"
      exit 1
    fi
  done

  ASC_KEY_PATH="${ASC_KEY_PATH/#\~/$HOME}"
  if [ ! -f "$ASC_KEY_PATH" ]; then
    echo "✗  ASC_KEY_PATH does not exist: $ASC_KEY_PATH"
    exit 1
  fi

  TEN_IOS_ASC_AUTH_ARGS=(
    -authenticationKeyPath "$ASC_KEY_PATH"
    -authenticationKeyID "$ASC_KEY_ID"
    -authenticationKeyIssuerID "$ASC_ISSUER_ID"
  )
}

ten_ios_require_main_branch() {
  local BRANCH

  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo UNKNOWN)"
  if [ "$BRANCH" != "main" ] && [ "${TEN_IOS_BRANCH_OVERRIDE:-0}" != "1" ]; then
    echo "✗  Not on main (currently on: $BRANCH)"
    echo "   iOS releases must be cut from main."
    echo ""
    echo "   Run: git checkout main && git pull --ff-only origin main"
    echo "   (Set TEN_IOS_BRANCH_OVERRIDE=1 only for test archives.)"
    exit 1
  fi
}

ten_ios_require_clean_worktree() {
  if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "✗  Worktree has uncommitted changes:"
    echo ""
    git status --short
    echo ""
    echo "   Commit or stash these before archiving/uploading."
    exit 1
  fi
}

ten_ios_latest_archive() {
  if [ ! -d "$TEN_IOS_ARCHIVES_DIR" ]; then
    return 1
  fi

  find "$TEN_IOS_ARCHIVES_DIR" -name 'ThinkingErrors-*.xcarchive' -print0 |
    while IFS= read -r -d '' ARCHIVE; do
      stat -f '%m	%N' "$ARCHIVE"
    done |
    sort -nr |
    head -1 |
    cut -f2-
}

ten_ios_project_setting() {
  local SETTING="$1"

  awk -F' = ' -v setting="$SETTING" '$1 ~ setting {
    gsub(/;/, "", $2)
    print $2
    exit
  }' ios/App/App.xcodeproj/project.pbxproj
}

ten_ios_archive_info() {
  local ARCHIVE_PATH="$1"
  local APP_INFO_PLIST="$ARCHIVE_PATH/Products/Applications/App.app/Info.plist"

  if [ ! -f "$APP_INFO_PLIST" ]; then
    echo "✗  Archive does not look like the Thinking Errors NotePad iOS archive:"
    echo "   $ARCHIVE_PATH"
    exit 1
  fi

  TEN_IOS_ARCHIVE_VERSION="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$APP_INFO_PLIST" 2>/dev/null || echo unknown)"
  TEN_IOS_ARCHIVE_BUILD="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleVersion' "$APP_INFO_PLIST" 2>/dev/null || echo unknown)"
}

ten_ios_write_export_options() {
  local EXPORT_OPTIONS="$1"

  cat > "$EXPORT_OPTIONS" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>app-store-connect</string>
  <key>destination</key>
  <string>upload</string>
  <key>signingStyle</key>
  <string>automatic</string>
  <key>teamID</key>
  <string>$TEN_IOS_TEAM_ID</string>
  <key>manageAppVersionAndBuildNumber</key>
  <false/>
  <key>stripSwiftSymbols</key>
  <true/>
  <key>uploadSymbols</key>
  <true/>
</dict>
</plist>
PLIST
}
