# iOS release checklist — Thinking Errors NotePad

The scripted part is three commands; the manual part is App Store Connect
web UI. Listing copy lives in [listing.md](listing.md).

## One-time setup (first release only)

- [ ] **Create the app record** in [App Store Connect](https://appstoreconnect.apple.com)
      → My Apps → **+** → New App:
      - Platform: iOS
      - Name: **Thinking Errors NotePad**
      - Primary language: English (U.S.)
      - Bundle ID: **com.urbanpyx.thinkingerrors** (register it if the picker
        doesn't offer it — the archive step with `-allowProvisioningUpdates`
        usually registers it automatically on first archive)
      - SKU: `thinking-errors-notepad`
      (This cannot be done via the API — web UI only.)
- [ ] Local signing config exists: `~/.thinking-errors-notepad/ios-release.env`
      (same App Store Connect API key as AttuneTogether — team CLKKD53664)

## Every release

- [ ] On `main`, clean worktree, tests green (`npm run lint && npm test`)
- [ ] `npm run ios:doctor` passes
- [ ] `TEN_IOS_YES=1 npm run ios:testflight`
      (= web build → cap sync → build bump → archive → upload)
- [ ] Wait 5–30 min for the build to process in ASC
- [ ] Smoke test via TestFlight on a real device:
      - [ ] First-launch data notice appears once, "Got it" dismisses it
      - [ ] Full worksheet: situation → feelings → thoughts → highlight →
            label → review → balanced thought → save on device
      - [ ] Entry appears in History; opens; delete works
      - [ ] Your data: export all entries produces a JSON file; import restores
      - [ ] Airplane mode: everything still works (the app is offline-first)
- [ ] Tag the release: `git tag ios-v<version>-b<build> && git push origin <tag>`

## First submission (listing)

- [ ] Screenshots: 6.7" (1290×2796) required; 6.5" and 5.5" optional
      (take on iPhone 15/16 Pro Max simulator: `xcrun simctl io booted screenshot`)
- [ ] Paste subtitle, promotional text, description, keywords from listing.md
- [ ] Support URL + privacy policy URL (see listing.md)
- [ ] App Privacy: **Data Not Collected**
- [ ] Age rating questionnaire → 4+
- [ ] Pricing: Free, all territories (or select)
- [ ] App Review notes from listing.md
- [ ] Select the processed build → Submit for Review
