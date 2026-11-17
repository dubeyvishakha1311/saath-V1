# Saath over-the-air web updates · 0.7.0

## Current status / important limits

**Implementation added; delivery NOT activated.** On this run the GitHub integration returned **HTTP 403 / Resource not accessible by integration** for repository Actions Secrets. Provisioning stopped before generating a real release key or changing any secret. `src/ota-config.json` therefore has no public trust key/baseline and the app refuses release checks/downloads. The native plugin also has an unusable fail-closed trust-key sentinel, not unsigned mode. Do not distribute the present debug build as an activated updater.

The owner must provision signing securely and build/install the bootstrap APK once. Already installed 0.6.0 apps do not contain the native updater and cannot acquire it by downloading JavaScript alone. After the bootstrap installation, compatible web UI/CSS/JavaScript/content/assets can be updated in-app. Android permissions, native code, native plugin changes, signing-key rotation and other native compatibility changes still require an APK/app-store update. Supabase/server migrations are a separate, backward-compatible deployment—not mobile web-bundle updates.

This is a self-hosted public GitHub Releases channel using the open-source `@capgo/capacitor-updater` 7.53.0 **native engine**, not a Capgo Cloud subscription. No new paid service or billing was enabled. App Store/Google Play policies and clinical/privacy review still apply; OTA must not be used to evade platform review, expand permissions or make unreviewed medical claims.

## Owner activation — keep secrets out of chat/source

Use a trusted local checkout on the fixed branch `arena/55e548ad-saath-v1`, with Node 22+, `gh`, and a GitHub account/connection permitted to manage repository Actions secrets. Do not paste passwords/tokens/private keys into chat. The current Arena GitHub integration needs Secrets permission before the agent can run provisioning for you; alternatively run the owner script locally using an already authenticated `gh`.

```sh
npm ci
node scripts/setup-ota-key.mjs
npm run android:sync
npm run ota:baseline
npm run android:sync
npm test
```

The setup script checks existing secret metadata, refuses to overwrite an existing signing secret/key, generates an RSA-2048 key in memory, sends its private PEM directly to **GitHub Actions secret `SAATH_OTA_SIGNING_KEY`** over `gh` stdin, and writes only public keys to `capacitor.config.json` and `src/ota-config.json`. No private key is printed or written into the workspace. A failed permission check stops setup. Do not bypass this by disabling signature checks or putting the private key in `.env`/`VITE_` configuration.

`ota:baseline` records a SHA-256 fingerprint of native files/configuration and installed native-plugin versions. Run sync before recording it and rebuild afterward so the fingerprint is bundled into the bootstrap. Commit the **public** configuration/native registration changes on this branch, push, and build the Android APK with the existing workflow. Keep the publisher key secret protected; pin branch/workflow permissions and configure required reviewers for the GitHub **ota-production** environment before a real rollout.

Install that configured bootstrap once on dedicated test devices, then test a real 0.7.1 web release before wider distribution. **Back up notebooks before any native install.** APK signing identity is independent of web-update signing: CI debug signing keys may differ across builds and require uninstalling, which deletes local data. Do not uninstall an existing app until you have a verified recoverable backup/passphrase. Production APKs need a stable protected Android signing identity; no such keystore was created by this feature.

GitHub secrets are not downloadable backups. The generated publisher key is retained only in the Actions secret; losing/removing it requires a new native trust key/APK unless an owner-designed recovery plan exists. Plan administrative recovery and access control before a public rollout. Never silently rotate an already deployed key by rerunning setup.

## Publish a compatible web update

1. Make/review web-only changes. Review clinical content/safety rules with a psychologist; a green build is not clinical approval. Keep notebook formats backward compatible; do not introduce irreversible data migrations that break rollback.
2. Increase **only `package.json` / lockfile web version**, e.g. `npm version 0.7.1 --no-git-tag-version`. Do not bump Android versionCode/versionName, edit native config, or regenerate the native baseline for a web-only release.
3. Test, commit and push to this session's branch. Manually run the **Publish signed web update** workflow on that branch. Approve the protected `ota-production` environment if configured.
4. The workflow runs tests and web/native sync, verifies the existing native fingerprint, verifies matching native/web/publisher keys, packages `dist/` with `index.html` at ZIP root, encrypts/authenticates the archive, signs a bounded manifest, then creates immutable `saath-web-<version>` assets. It refuses to overwrite an existing version. The `saath-ota-stable` release body is updated only after assets exist.
5. Configured Android apps check the public stable release metadata once on app launch. Users can also open **My space → App updates → Check for updates**. They choose **Download verified update**, then **Restart & install update** when ready. There is no APK install prompt for these web updates.

The GitHub channel is global for the pinned native runtime, not a percentage/staged rollout service. Do not call this a staged rollout. Test privately/on dedicated devices before moving stable; use separate trust/channel configurations and a reviewed distribution process if QA/production separation is required. The current repo is public; making it private without changing hosting breaks unauthenticated client checks. Do not embed a GitHub access token in the app to work around that.

## Security and compatibility boundary

- The stable-pointer body contains a base64 payload plus a standard RSA-SHA256 signature; Web Crypto verifies it against a public SPKI key bundled in the app before any download. Invalid signatures, wrong platform/runtime, non-increasing versions, unexpected URLs, oversize declared archives and malformed fields are rejected.
- Bundle URLs must be HTTPS GitHub release assets in this repository, with the matching immutable version tag/name. GitHub may redirect downloads to its release CDN. Only public release/version data is requested; no notebook, passphrase, Supabase JWT or account identifier is sent.
- Independently, the native updater has a pinned PKCS#1 public key. Packaging uses the engine's V2 format: AES-128-CBC ZIP, private-RSA-wrapped random session key, and private-RSA-wrapped SHA-256 ZIP digest. Native decryption/checksum verification prevents the JS manifest check from being the only integrity boundary. This format authenticates app assets; it is **not confidential distribution**—the public app key allows reading public update content.
- Native fingerprinting covers Android files (except generated web assets/build caches/local SDK paths), root native config and installed native-plugin versions. A native change fails OTA packaging. Updating this baseline is a deliberate new-APK operation, not a way to make an incompatible bundle fit an old APK.
- Automatic plugin update endpoints, URL modification and telemetry are disabled. No Capgo Cloud account, API token, remote analytics or notebook-data endpoint is used. GitHub/CDN still see ordinary request IP/network metadata. Readiness/crash telemetry is not sent.
- The signing authority can change executable application code. Protect repository Actions/secrets/workflows as a production signing system; this is not an independent security audit or protection from a compromised authorized publisher.

## Safe restart and rollback

No `next()` scheduling, background application or forced reload is used. Downloads may finish while the user navigates elsewhere, but installation/reset requires **My space**, explicit restart confirmation and no active account/backup operation. It cannot be triggered from journal, Calm or crisis screens. Existing local drafts stay in WebView storage; the updater never clears notebook/session storage. Finish unsaved My space contact edits before leaving/restarting; on-device verification is still required.

After successful initial screen/navigation render, the app calls `notifyAppReady()`. The native engine has a 30-second startup readiness timeout and supports rollback when a downloaded app fails to acknowledge startup. Failed-release metadata is retained and the controller refuses automatic retries of that failed version. A readiness acknowledgement proves initial render only—not clinical correctness, every feature, or freedom from later crashes.

**Return to installed APK version** is available with the same Settings/confirmation guard. Retained bundles consume disk space; include low-storage/cache management checks in device QA. A publisher rollback uses known-good web content under a **new increasing version**, never an unsigned downgrade. Removing a stable release is not an instant remote wipe/revocation; offline devices and already applied bundles persist. Re-checking a missing/up-to-date/failed release clears pending in-memory installation state. Physical-device tests must confirm native fallback and storage survival before claiming production-ready rollback.

## Verification / release gates

Automated tests cover signature/runtime/source/version rejection, native codec round trip, native-change packaging failure, no automatic download/reload, Settings-only confirmed activation, cancellation, account-operation guards, download completion during crisis, network failure, failed-release blocking and disabled/web mode. The prior app/auth/safety/crypto tests remain in place.

**Not yet tested end-to-end:** a real signed release delivered to a configured physical Android bootstrap, interrupted/corrupt downloads, killed/cold-start rollback, disk-full behavior, draft/token retention across actual native reload/reset, store-review handling, long-term release retention or publisher-key recovery. Do not label this active/production-ready until signing is configured and these tests pass. No real OTA release was published during the permission-blocked setup.
