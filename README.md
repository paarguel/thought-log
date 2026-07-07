# Thinking Errors NotePad

A private, mobile-first notepad for thinking errors. Write out what's in your
head, circle the thoughts — like on a paper CBT worksheet — name the thinking
patterns (cognitive distortions), and land on a more balanced thought.

Free and open source. **Everything stays on your device**: no account, no
cloud, no server, no analytics, no AI. The app never makes a network request.

> **Your data, honestly:** entries live only on the device. If the app is
> deleted or the device is lost, they're gone. Export regularly — this is a
> working notepad, not long-term storage. It's a self-help writing tool, not
> therapy or a medical device.

## How your data is stored

| Choice | Where it lives | Who can see it |
| --- | --- | --- |
| **Save on this device** | On-device storage (IndexedDB) | Only this device |
| **Export (printable / JSON)** | A file you download | Whoever you give the file to |
| **Discard** | Nowhere | Nobody |

Drafts autosave to the device while you work so nothing is lost mid-worksheet;
they are never uploaded (there is nowhere to upload them to). The **Your data**
page can export every entry as one backup file and import it again later.

See [PRIVACY.md](PRIVACY.md) for the full posture.

## Develop

```bash
npm install
npm run dev
```

There is no configuration — no env vars, no keys, no services.

## Verify

```bash
npm run lint
npm run test
npm run build   # static export → out/
```

## iOS app (Capacitor)

The web app is statically exported and bundled into a Capacitor iOS shell —
the native app works fully offline.

```bash
npm run ios:doctor      # preflight: Xcode, signing config, project settings
npm run ios:release     # build web → sync into ios/ → bump build number
npm run ios:archive     # xcodebuild archive (App Store Connect API key auth)
npm run ios:upload      # upload the archive to App Store Connect
npm run ios:testflight  # all of the above in one go
```

The archive/upload steps need a local config file (never committed) at
`~/.thinking-errors-notepad/ios-release.env`:

```
ASC_KEY_ID=<App Store Connect API key id>
ASC_ISSUER_ID=<issuer id>
ASC_KEY_PATH=$HOME/.appstoreconnect/private_keys/AuthKey_<key id>.p8
```

App Store listing copy and release process live in
[docs/app-store/](docs/app-store/).

The app icon and splash are generated, not hand-drawn — edit
`scripts/generate-app-art.swift` and run `swift scripts/generate-app-art.swift`,
then `npx @capacitor/assets generate --ios`.

## License

[MIT](LICENSE) — free to use, copy, and adapt.
