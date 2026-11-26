# Google Play release — 2026-09-24

## Current state

- Apple reference verified via App Store Connect API: **Thought Record: CBT Notes**, app `6788916753`, version **1.0.1**, `READY_FOR_SALE`.
- Google Play organization account: **UrbanPyx**, account `7257870420459558056`.
- Identity and both phone numbers verified; Create app is enabled.
- Android package added: `com.urbanpyx.thinkingerrors`, version 1.0.1, version code 1.
- Signed native bundle uploaded and accepted by Google Play as version 1 (1.0.1), minimum API 24, target API 36. Internal release published September 24 at 8:53 PM; Console says **Available to internal testers**, **Not reviewed**. No testers are selected, so the track is inactive and nobody has access yet.
- Patrick approved the pending Play declarations and settings. Created free English app **Thought Record: CBT Notes**, Play app ID `4975077118867870359`; accepted signing/policy/export declarations and turned automatic installer protection off.
- All setup sections complete: privacy policy, unrestricted app access, no ads, non-government, no financial features, health (mental/behavioral health and stress management), Health & Fitness category/contact details, default English store listing, target audience, content rating, and data safety. Advertising ID declaration also saved: not used.
- Store description, 512px icon, feature graphic, and four native screenshots are uploaded and submitted for review. Screenshots show actual app UI; artwork was rendered from the existing native drawing script.
- Data safety finalized: no data collected or shared. Patrick authorized IARC terms and selected intended audience 13+: ages 13–15, 16–17, and 18+. This supersedes the earlier adults-only launch proposal. The IARC questionnaire completed September 24 at 8:59 PM, with ESRB Everyone and PEGI 3; content rating is separate from intended audience.
- Web verification: lint, 46 tests, and static production build passed.
- Native `lintRelease`, `bundleRelease`, and `assembleRelease` passed. Native lint reports zero errors and 29 warnings.
- Store icon (512×512), feature graphic (1024×500), and four actual Android screenshots (1080×1920) are prepared and visually reviewed. Screenshots contain only synthetic entries.
- Production version 1 (1.0.1) submitted September 24, 2026. Console visibly shows **Changes in review**, including full production rollout, English listing, and content declarations. On the follow-up check, automated quick checks had finished and Console explicitly said "Your changes are now in review." No outstanding approval or blocking issue is shown. No public availability is claimed.
- Distribution selected for all 177 available countries/regions (176 named plus Rest of World). Managed publishing is off, so approved changes publish automatically. No owner input remains pending.
- Resume in [Publishing overview](https://play.google.com/console/u/0/developers/7257870420459558056/app/4975077118867870359/publishing).

## Local build setup

Installed: Homebrew OpenJDK 21, Android command-line tools, platform tools,
platform 36, build tools 35.0.0 and 36.0.0, emulator, and API 36 Google APIs
ARM64 system image. Patrick authorized SDK license acceptance on September 24;
licenses were accepted and installation completed.

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export ANDROID_HOME="$HOME/Library/Android/sdk"
sdkmanager --sdk_root="$ANDROID_HOME" 'platform-tools' 'platforms;android-36' 'build-tools;36.0.0' 'emulator' 'system-images;android-36;google_apis;arm64-v8a'
```

An RSA 4096 upload key was generated at
`~/.thinking-errors-notepad/android-upload.jks`; its configuration is
`~/.thinking-errors-notepad/android-signing.properties` (both mode 0600).
Passwords and keys never enter git. Preserve a secure backup of this upload key;
no off-machine key backup has been verified. Play App Signing is active: the
uploaded bundle is signed by Google Play, automatic protection is off, and
automatic app text translation is off.

```bash
npm run android:release
# android/app/build/outputs/bundle/release/app-release.aab
```

The script runs lint, tests, static build, Capacitor Android sync, Android
release lint, signing and signature verification. It checks the AAB for the
Internet permission, Android backup and a remote Capacitor server URL, then
prints the package, version and SHA-256 digest. Increment `versionCode` in
`android/app/build.gradle` for each replacement bundle uploaded to Google Play.

To check a previously built AAB without rebuilding it:

```bash
bash scripts/android-check-offline-bundle.sh /path/to/app-release.aab
shasum -a 256 /path/to/app-release.aab
```

## Before upload

- [x] Accept SDK licenses and install required packages.
- [x] Native `lintRelease`, `assembleRelease`, and signed `bundleRelease` pass.
- [x] Inspect the signed release bundle: no Internet permission, Android backup
      disabled, no remote Capacitor server URL.
- [x] Android smoke: first-launch notice, worksheet, highlighting/labels, save,
      history/detail, notes, navigation/back button, keyboard and safe areas.
- [x] Export JSON and printable HTML through local picker; cancellation must not
      report success. Import JSON and verify entries/notes survive.
- [x] Relaunch in airplane mode and verify persistence.
- [x] Capture synthetic Android screenshots and create store feature graphic.
- [x] Complete phone verification.
- [x] Create free English app in Console after owner approves declarations.
- [x] Complete listing, privacy policy, data safety, app access, ads, content
      rating, target audience, health declaration, and financial declaration.
- [x] Upload signed AAB, enroll in Play App Signing, resolve Console validation.
- [x] Publish internal release. Warnings: no testers selected; no deobfuscation file (build does not use R8/ProGuard obfuscation).
- [ ] Run internal testing/pre-launch report and review results.
- [x] Submit production release for Google review; record actual status and URL.

Listing copy and supported declaration answers are in [listing.md](listing.md).
Legal agreements and any unsupported owner attestations require Patrick's input.
This checklist is not proof of publication or native-device verification.

## Native test receipt

Tested the signed release APK in `ThoughtRecord_API36` (Pixel 7 ARM64 emulator).
The full worksheet saved a synthetic entry with a Mind reading label, balanced
thought and notes. JSON export saved through the Android document picker;
canceling showed cancellation rather than success. Imported the backup and
verified the existing entry and notes. Printable HTML contained the balanced
thought and label and excluded notes when requested. Force-stop/relaunch in
airplane mode preserved the entry. Android system Back now returns from entry
detail to History. Privacy policy is available offline under Your data.

Bundle: `android/app/build/outputs/bundle/release/app-release.aab`

SHA-256: `ffea0c795a71879ebe6fd08d98a89e9908a333ee211ce63981a7b4900a012343`

No physical-device test or Play pre-launch report has been completed. The report
overview still shows the initial upload-artifacts message after internal release.
The synthetic backup and printable export were inspected outside the repository;
no personal journal data was used.

## Release record — 1.1.0 (November 2026)

- Signed bundle built November 20, 2026: versionCode 2, versionName 1.1.0.
  Uploaded to production as release "2 (1.1.0)" with en-US release notes and
  sent for review on November 20, 2026 (full rollout, managed publishing off, so it
  publishes when approved). The trader-status review had already finished.
- Store listing draft saved in Console: new short description, full
  description, and six phone screenshots replacing the four from 1.0.1.
  The November 25 resubmission below includes these listing changes.
- Listing source of truth is listing.md; screenshots are in screenshots/
  (1080×1920, Android emulator, synthetic entries only).

### November 25 appeal and resubmission

- Google accepted the appeal of its email-address Data safety finding. Policy
  status listed that finding for version code 2 and showed no other issues.
- Inspected the signed local 1.1.0 AAB (version code 2). Its manifest omits
  Internet permission and disables backup, and its Capacitor configuration
  loads bundled files. The app has no email field. The Android export writes
  through the local document picker only when the user chooses a destination.
  The existing Play declaration says the app collects and shares no user data.
- Saved listing copy explaining that no email is required and describing how
  the file picker handles exports. Sent the existing 1.1.0 release for 100%
  production rollout together with three default English listing changes
  (short description, full description and phone screenshots).
- Quick checks finished and Play Console confirmed all four changes were in
  review. With managed publishing off, Google published production version
  1.1.0 and the updated listing on November 25 at 10:10 PM Pacific. The public
  listing showed the updated short description and offline-use copy.
  [Submission activity](https://play.google.com/console/u/0/developers/7257870420459558056/app/4975077118867870359/publishing/submission-activity/5/details)

## Resubmit after an accepted appeal

1. Read the appeal decision and open **Policy status**. Check for additional
   violations and compare any Data safety finding with the affected build and
   active tracks. Verify the signed bundle and check how account fields, SDKs,
   local storage and user-initiated exports handle the affected data type.
   [Google Play Data safety guidance](https://support.google.com/googleplay/android-developer/answer/10787469)
2. If Play offers the appealed, compliant bundle in **Publishing overview**,
   verify its track, version and rollout before resubmitting it. If the app
   needs a binary fix, use a higher version code on every affected track and
   follow the rollout specified in the decision.
3. If listing changes are needed, edit the listing, select **Next** to review,
   check the visual asset declaration against the artwork and screenshots,
   and select **Save** to stage the changes.
4. Check the full submission in **Publishing overview**. Submit for review and
   verify the resulting status after quick checks finish. Record the date, track,
   version code, rollout, listing and declaration changes, and the status Play
   actually shows. Managed publishing controls what happens after approval.
   [Google Play Publishing overview guidance](https://support.google.com/googleplay/android-developer/answer/9859654)
