# Saath 0.7.1 — faculty demonstration release

## Included

Isolated faculty sandbox, 50 labelled fictional adult profiles, 500 observations, 50 schema-validated seven-day notebook fixtures, CSV/JSON downloads, fillable English AcroForm PDF and pilot-study guidance. Synthetic data is bundled publicly, contains no real people and is not clinical evidence. Screenshot presentation awaits the supplied screenshots.

## Database compatibility

No database migration or real-user record update is required. Existing encrypted vault payloads and account APIs are unchanged; no new remote tables or permissions are needed. The connected Saath project was checked read-only: `public.saath_vaults` has enabled and forced RLS, with authenticated SELECT/INSERT/UPDATE/DELETE own-vault policies present. Synthetic data must not be seeded into real participants' accounts. No notebook, account, backup, or database row was changed by this release inspection.

## Deployment boundaries

Version 0.7.1, Android versionCode 11. The manual Android workflow can publish a standalone debug APK after all tests, the read-only Supabase smoke check, native sync and Gradle compilation succeed. Push builds run on main and the current development branch. The signed-web publishing workflow now targets main rather than the obsolete development branch, but remains fail-closed without configured keys and native baseline.

**Not an OTA rollout.** Existing publicly distributed 0.7.0 APKs contain empty public-key/fingerprint pins and a native signing-key sentinel. They cannot authenticate or request this update; changing a database or release channel cannot retrofit a trust anchor. The GitHub connection still returns HTTP 403 for Actions Secrets access. No key was generated or secret created, and no web update was published.

Even 0.7.1 debug is intentionally unconfigured until owner provisioning; installing it does not activate future OTA. To enable OTA, follow `docs/OTA_UPDATES.md`, establish protected release approvals and stable Android signing identity, build a configured bootstrap and device-test an actual signed update/rollback before distribution. Existing users need that one-time configured native install. Future web changes can then be offered with explicit user confirmation; native/plugin changes still require APKs.

Back up and verify notebooks before any native installation. CI debug signing keys can differ across runs. If Android rejects an upgrade, do not uninstall without a verified backup; uninstall deletes local data. Physical-device and PDF reader QA remain outstanding. Source merging and a successful build do not establish clinical or production readiness.
