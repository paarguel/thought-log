# iOS release checklist — Thought Record

The scripted part is three commands; the manual part is App Store Connect
web UI. Listing copy lives in [listing.md](listing.md).

## One-time setup (first release only)

- [x] **API key / provisioning permissions** — RESOLVED 2026-07-08. The earlier
      "Unable to find a team with the given Team ID 'CLKKD53664'" error was the
      lapsed Developer Program membership, not the key's role. With the
      membership active again, the existing ASC key (9WQYS5M8NZ) creates
      provisioning resources fine.
- [x] **Register the bundle ID** `com.urbanpyx.thinkingerrors` — registered
      2026-07-08 via `POST /v1/bundleIds` (id `4Q87QC6D87`). Verify with
      `node scripts/asc-api.mjs GET '/v1/bundleIds?filter[identifier]=com.urbanpyx.thinkingerrors'`.
- [ ] **Create the app record** in [App Store Connect](https://appstoreconnect.apple.com)
      → My Apps → **+** → New App (web UI only — the API forbids `apps` CREATE):
      - Platform: iOS
      - Name: **Thought Record** (fall back to a variant if taken — see listing.md)
      - Primary language: English (U.S.)
      - Bundle ID: **com.urbanpyx.thinkingerrors**
      - SKU: `thought-record`
- [x] Local signing config exists: `~/.thinking-errors-notepad/ios-release.env`
      (in place; config dir/env prefix kept as-is despite the app rename)

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
