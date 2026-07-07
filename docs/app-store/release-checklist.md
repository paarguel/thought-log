# iOS release checklist — Thinking Errors NotePad

The scripted part is three commands; the manual part is App Store Connect
web UI. Listing copy lives in [listing.md](listing.md).

## One-time setup (first release only)

- [ ] **Fix the API key permissions** (verified blocker, July 2026): the
      existing ASC API key (9WQYS5M8NZ, reused from AttuneTogether) can upload
      builds but CANNOT touch Certificates, Identifiers & Profiles — both
      `xcodebuild -allowProvisioningUpdates` and `POST /v1/bundleIds` fail with
      "Unable to find a team with the given Team ID 'CLKKD53664'". That's
      Apple's (misleading) insufficient-role error. Fix one of:
      - **Preferred:** App Store Connect → Users and Access → Integrations →
        create a new API key with **App Manager** (or Admin) role. Update
        `~/.thinking-errors-notepad/ios-release.env` and drop the new `.p8`
        into `~/.appstoreconnect/private_keys/`. Everything below then runs
        scripted, including automatic bundle-ID registration.
      - Or: sign into Xcode (Settings → Accounts) with the Apple ID that owns
        team CLKKD53664, register the bundle ID at developer.apple.com →
        Identifiers, then archive with `TEN_IOS_AUTH=xcode npm run ios:archive`.
- [ ] **Register the bundle ID** `com.urbanpyx.thinkingerrors` (automatic with
      an App Manager key on first archive; manual at developer.apple.com
      otherwise)
- [ ] **Create the app record** in [App Store Connect](https://appstoreconnect.apple.com)
      → My Apps → **+** → New App:
      - Platform: iOS
      - Name: **Thinking Errors NotePad**
      - Primary language: English (U.S.)
      - Bundle ID: **com.urbanpyx.thinkingerrors**
      - SKU: `thinking-errors-notepad`
      (App records cannot be created via the API — web UI only.)
- [ ] Local signing config exists: `~/.thinking-errors-notepad/ios-release.env`
      (already in place — but see the key-role fix above)

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

- [ ] Screenshots: ready-made in [screenshots/](screenshots/) —
      captured on the iPhone 17 Pro Max simulator at 1320×2868 (6.9" class):
      first-launch notice, labeling, review, history, your-data.
      Retake any time with `xcrun simctl io booted screenshot`.
- [ ] Paste subtitle, promotional text, description, keywords from listing.md
- [ ] Support URL + privacy policy URL (see listing.md)
- [ ] App Privacy: **Data Not Collected**
- [ ] Age rating questionnaire → 4+
- [ ] Pricing: Free, all territories (or select)
- [ ] App Review notes from listing.md
- [ ] Select the processed build → Submit for Review
