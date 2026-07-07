#!/usr/bin/env bash
# Thinking Errors NotePad — iOS release prep
#
# Builds the static web export, syncs it into the iOS project, and bumps
# the build number. Run before archiving.
#
# Usage:
#   npm run ios:release            # interactive
#   TEN_IOS_YES=1 npm run ios:release   # non-interactive (auto-increment, no tag)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/ios-release-common.sh
source "$SCRIPT_DIR/ios-release-common.sh"

ten_ios_header "Thinking Errors NotePad — iOS Release Prep"

if ! command -v git &>/dev/null; then
  echo "✗  git not found. Install Xcode Command Line Tools: xcode-select --install"
  exit 1
fi
if ! command -v npm &>/dev/null; then
  echo "✗  npm not found. Install Node.js from https://nodejs.org"
  exit 1
fi
echo "✓  git: $(git --version)"
echo "✓  npm: $(npm --version)"

ten_ios_require_main_branch
echo "✓  Branch: $(git rev-parse --abbrev-ref HEAD)"

if git diff --quiet && git diff --cached --quiet; then
  echo "✓  Worktree clean"
else
  echo "⚠  Worktree has uncommitted changes:"
  git status --short
  if [ "${TEN_IOS_YES:-0}" != "1" ]; then
    read -r -p "   Continue anyway? [y/N] " CONFIRM
    if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
      echo "   Aborted."
      exit 1
    fi
  fi
fi

echo ""
echo "── npm install ─────────────────────────────────────────────"
npm install

echo ""
echo "── npm run build (static export → out/) ────────────────────"
npm run build

echo ""
echo "── npx cap sync ios ────────────────────────────────────────"
npx cap sync ios

# ── Build number ──────────────────────────────────────────────────────────────
# Apple rejects uploads with a duplicate CFBundleVersion. The Capacitor
# template keeps it in the Xcode project (CURRENT_PROJECT_VERSION).

PROJECT_FILE="ios/App/App.xcodeproj/project.pbxproj"

echo ""
echo "── Build number (CURRENT_PROJECT_VERSION) ──────────────────"

CURRENT_BUILD="$(ten_ios_project_setting CURRENT_PROJECT_VERSION)"
if [[ "$CURRENT_BUILD" =~ ^[0-9]+$ ]]; then
  NEXT_BUILD=$(( CURRENT_BUILD + 1 ))
  echo "   Current: $CURRENT_BUILD  →  Next: $NEXT_BUILD"
  DO_BUMP="y"
  if [ "${TEN_IOS_YES:-0}" != "1" ]; then
    read -r -p "   Auto-increment to $NEXT_BUILD? [Y/n] " AUTO_INC
    [[ "$AUTO_INC" =~ ^[Nn]$ ]] && DO_BUMP="n"
  fi
  if [ "$DO_BUMP" = "y" ]; then
    perl -0pi -e "s/CURRENT_PROJECT_VERSION = \Q$CURRENT_BUILD\E;/CURRENT_PROJECT_VERSION = $NEXT_BUILD;/g" "$PROJECT_FILE"
    echo "✓  CURRENT_PROJECT_VERSION set to $NEXT_BUILD"
    git add "$PROJECT_FILE"
    git commit -m "chore: bump iOS build number to $NEXT_BUILD"
    echo "✓  Committed build number bump"
  else
    echo "⚠  Increment CURRENT_PROJECT_VERSION manually before archiving."
  fi
else
  echo "⚠  Could not read build number; increment it manually in Xcode."
fi

VERSION="$(ten_ios_project_setting MARKETING_VERSION)"
BUILD="$(ten_ios_project_setting CURRENT_PROJECT_VERSION)"

echo ""
echo "✓  Release prep complete."
echo "   Version:   ${VERSION:-unknown} (${BUILD:-unknown})"
echo "   Bundle ID: $TEN_IOS_BUNDLE_ID"
echo "   Next:      npm run ios:archive   (or npm run ios:testflight for the full flow)"
