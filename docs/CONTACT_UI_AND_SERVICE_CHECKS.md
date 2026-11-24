# Trusted contact, interaction polish and service checks

## Trusted contact

Saved under the existing per-notebook `phone` field. Formatted phone input normalizes to 7–15 digits with an optional leading `+`. Invalid, blank, punctuation-only, double-plus and overlong inputs cannot overwrite a saved number. Emptying the text field is not a destructive action: use the explicit confirmed removal button. Storage failure retains the previous value, reports the error and does not claim a save. Save success re-renders the normalized input and a persistent saved-number card, not only a transient status message. A number is not verified/OTP-confirmed; reachability is not guaranteed. The user decides whether to call.

The same validated saved number is available from My space, Calm and crisis help. Invalid legacy values are not placed into dial links. A confirmed removal affects this local notebook; previously created encrypted cloud backups are unchanged until explicitly updated/deleted. No automatic upload, contact-book access, call, SMS or emergency notification is introduced. Reload, cancel, validation, error rollback, removal and guest/account isolation are automated-test cases. Existing encrypted-backup tests already include the phone field. Supabase's vault envelope/schema is unchanged; no migration is needed.

## Interaction design

A principles-inspired implementation of fast feedback, clear hierarchy and restrained motion—not a copy of an individual's site or an imported skill package. Pressed controls scale subtly; selected choices have a firm border and clear checkmark; soft inset highlights and minimal shadows add depth without a new card-grid redesign. Only navigation gets a 180ms, 4px arrival; choice rerenders do not animate the page. Crisis and Calm navigation never receive this class. All new motion is gated by `prefers-reduced-motion: no-preference`; the existing reduced-motion override remains. Phone fields use tabular number display and logical LTR direction. The app remains English/Hindi, narrow-screen friendly, with Back/Home/help controls and the larger central Calm button.

## Checks performed

- Connected project reports healthy Auth, database, REST and Storage services.
- Metadata-only queries confirm vault RLS enabled and forced, all four authenticated own-row policies use `auth.uid() = user_id`, anonymous table reads denied, authenticated table privilege present behind RLS, and data-deletion function is security-invoker with expected-identity guard and no anonymous execution.
- No real user rows were queried or modified. Metadata/health is not proof of every workflow's correctness.
- The owner reports successful Google sign-in, but live public Auth settings returned **Google enabled=false**, email enabled=true. OAuth implementation is preserved, and no provider settings were modified. The mismatch is unresolved (a cached session/different build or project is possible, not proven). The public-settings smoke script prints only provider-enabled booleans, never credentials. A distinct CI Google-readiness job requires Google enabled; it fails visibly and blocks new APK release publishing while ordinary database smoke/native compilation can still run. This is not an independent real-account OAuth/device test.
- Direct local Supabase HTTPS smoke checks fail with environment ECONNRESET; native CI is used to run those public-endpoint checks. Do not interpret this local network failure as a database outage or call it a successful local test.
- 30 headless Chromium checks: Home, Journal, My space, Calm and crisis at 320/390/768 widths in both languages. No horizontal overflow or page errors; additional actual-browser contact save/reload, journal feedback and reduced-motion checks passed. The screenshot uses a reserved fictional North American phone number, not a participant's number.
- Automated tests cover storage/auth/backup logic using mocks and WebCrypto. They do not replace real-account backup/restore across two devices or a real Google OAuth cancellation/cold-start callback test. Physical Android, secure native storage and clinical/youth review remain outstanding.

## OTA publication boundary

The main-branch push publisher has a public-configuration plus `SAATH_OTA_BOOTSTRAP_READY` readiness job. Unconfigured releases emit an explicit disabled notice and skip publication. Configured releases still require protected-environment approval (configure required reviewers), tests, matching native fingerprint/keys and a new immutable version. No forced install/reload is added. Existing signature verification, Settings-only confirmed restart, account-operation guard and rollback controls remain.

Current state: no trust key/native baseline in `src/ota-config.json`; native key sentinel remains. GitHub Actions Secrets metadata access still returns HTTP 403. No key/secret/OTA release was created. Neither distributed 0.7.0/0.7.1 nor this unconfigured source can become OTA-enabled by a database update. Owner provisioning, stable native signing identity, one configured-bootstrap install and physical signed-update/rollback QA are mandatory. After this one-time work, new compatible web versions can be offered through main pushes; native changes still need APKs. Setting the bootstrap variable is a release decision, not a test workaround.
