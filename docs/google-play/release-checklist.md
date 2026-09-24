# Google Play release — 2026-09-24

## Current state

- Apple reference verified via App Store Connect API: **Thought Record: CBT Notes**, app `6788916753`, version **1.0.1**, `READY_FOR_SALE`.
- Google Play organization account: **UrbanPyx**, account `7257870420459558056`.
- Identity verified. Console still requires private contact and public developer phone verification; **Create app is disabled**. Patrick is completing those verifications.
- Android package added: `com.urbanpyx.thinkingerrors`, version 1.0.1, version code 1.
- Native bundle **not yet built or uploaded**. SDK installation awaits Patrick's license approval.
- Web verification: lint, 46 tests, and static production build passed.
- Store icon (512×512) and feature graphic (1024×500) generated from the existing artwork and visually reviewed; native screenshots remain pending.

## Local build setup

Installed: Homebrew OpenJDK 21 and Android command-line tools. SDK packages
requested: platform tools, platform 36, build tools 36.0.0, emulator, and API 36
Google APIs ARM64 system image. Their license acceptance is still pending.

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export ANDROID_HOME="$HOME/Library/Android/sdk"
sdkmanager --sdk_root="$ANDROID_HOME" 'platform-tools' 'platforms;android-36' 'build-tools;36.0.0' 'emulator' 'system-images;android-36;google_apis;arm64-v8a'
```

An RSA 4096 upload key was generated at
`~/.thinking-errors-notepad/android-upload.jks`; its configuration is
`~/.thinking-errors-notepad/android-signing.properties` (both mode 0600).
Passwords and keys never enter git. Preserve a secure backup of this upload key;
no off-machine key backup has been verified. Play App Signing enrollment still
needs to happen when the first bundle is uploaded.

```bash
npm run android:release
# android/app/build/outputs/bundle/release/app-release.aab
```

The script runs lint, tests, static build, Capacitor Android sync, Android
release lint, bundle signing, signature verification, and a SHA-256 digest.
Increment `versionCode` in `android/app/build.gradle` for every later upload.

## Before upload

- [ ] Accept SDK licenses and install required packages.
- [ ] Native `lintRelease`, `assembleDebug`, and signed `bundleRelease` pass.
- [ ] Inspect merged release manifest: no Internet permission; backup disabled.
- [ ] Android smoke: first-launch notice, worksheet, highlighting/labels, save,
      history/detail, notes, navigation/back button, keyboard and safe areas.
- [ ] Export JSON and printable HTML through local picker; cancellation must not
      report success. Import JSON and verify entries/notes survive.
- [ ] Relaunch in airplane mode and verify persistence.
- [ ] Capture synthetic Android screenshots and create store feature graphic.
- [ ] Complete phone verification and create free English app in Console.
- [ ] Complete listing, privacy policy, data safety, app access, ads, content
      rating, target audience, health declaration, and financial declaration.
- [ ] Upload signed AAB, enroll in Play App Signing, resolve Console validation.
- [ ] Run internal testing/pre-launch report and review results.
- [ ] Submit production release for Google review; record actual status and URL.

Listing copy and supported declaration answers are in [listing.md](listing.md).
Legal agreements and any unsupported owner attestations require Patrick's input.
This checklist is not proof of publication or native-device verification.
