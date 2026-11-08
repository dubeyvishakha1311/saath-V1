# Supabase connection · Saath 0.5.0

## Connected project

- Project: **saath**, reference `ittnpegkfonxvkcfqmgd`, Sydney region.
- Client configuration: `src/supabase-config.json`. The URL and **publishable** key are intentionally public. Authorization comes from verified user sessions and database Row Level Security (RLS), not from hiding this key.
- Optional build-time overrides: `.env.example`. Never put a service-role key, database password, SMTP password, or management token in a `VITE_` variable or the APK.
- Email/password Auth, email confirmation, refresh-token rotation and an explicit callback allowlist are enabled. No notebook upload occurs at signup or login.

## What is implemented

English/Hindi sign-in, signup, confirmation resend, password-reset request/recovery, local sign-out, account controls and account deletion. Continue without an account remains available; Calm and crisis help are not login-gated. Authentication requires internet access; the guest notebook and calming tools remain usable offline. Returning account sessions are verified with Auth before opening their local notebook.

Guest and individual accounts have separate local notebooks. Signing out returns to the guest notebook without merging anything. **Copy my guest notebook** is an explicit local replacement operation; it keeps the guest original and does not upload. Account notebooks and auth sessions remain in WebView/browser storage after sign-out; sign-out is not secure erasure.

The cloud feature is **manual encrypted backup/restore**, not automatic sync, multi-device merging, or a version history:

1. Sign in, open **Account & backup → Encrypted cloud backup**.
2. Choose a separate passphrase of at least 12 characters. Keep it somewhere safe and do not reuse the account password.
3. Explicitly check transfer consent, then choose upload or restore and confirm replacement.
4. Upload replaces that account's one cloud snapshot. Restore replaces that account's current-device notebook. New writing remains local until another upload.

Backup includes journal/drafts, mood, creative reflections, exercises, screening answers, trusted contact, notebook consent/language and reflection preferences. It excludes account passwords, sessions and tokens. Serialization uses a bounded allowlist. AES-256-GCM encrypts content **before** upload, with a fresh 16-byte salt, 12-byte IV, PBKDF2-SHA256/600,000 iterations, and account-bound authenticated data. The passphrase is neither retained by Saath nor transmitted. Password reset **cannot** recover it. The cryptographic implementation is tested, not independently audited; a weak passphrase still permits offline guessing if ciphertext is obtained.

Supabase stores account email/auth metadata plus ciphertext, salt, IV, format/KDF information, backup size, revision and timestamps. These metadata are not hidden. This does not encrypt the on-device notebook or auth session, protect an unlocked/compromised device, or replace legal/security review.

## Database and deletion

- `public.saath_vaults`: one encrypted envelope per `auth.users.id`; cascading deletion; forced RLS; authenticated own-user SELECT/INSERT/UPDATE/DELETE only; no anonymous grants.
- Server-owned timestamps/revisions and revision-filtered updates prevent silently overwriting a concurrently changed backup.
- `saath_delete_my_data(expected_user_id uuid)`: security-invoker RPC; rejects account-identity changes and deletes only the authenticated owner's backup.
- `saath-delete-account`: deployed Edge Function, JWT verification enabled. Requires explicit `DELETE`, revalidates the bearer with Auth, checks the expected current identity, and deletes **only that verified identity** through the administrative Auth API. A client-supplied target cannot authorize deleting anyone else. Privileged credentials are read only from the platform's function environment.

**Delete cloud backup** keeps local writing. **Delete all saved data** while signed in removes the cloud backup first, then this device's account notebook; failed remote deletion does not falsely clear local data. Guest deletion affects only the local guest notebook. **Delete account** removes the Auth user, its cloud row and its current-device notebook. It does not wipe other offline devices, independent guest notebooks, OS-level copies or provider backup retention. Existing short-lived JWT/offline copies must be considered in the production revocation/retention policy.

## Already deployed — do not apply setup twice

The two files under `supabase/migrations/` record the schema and identity guard already applied to this project through the connected management tools. The Edge Function source is in `supabase/functions/saath-delete-account/index.ts` (deployed version 2). Do not blindly reapply the initial migration to this existing database. Reconcile deployment history before using the CLI; make subsequent changes as new migrations.

For a **new empty project**, apply these SQL files in order in its SQL editor/migration pipeline, deploy the Edge Function with JWT verification, replace the public client configuration, and set Auth callbacks. Do not disable RLS or put privileged keys in the app to resolve permission errors.

The current allowlist covers the Arena preview callbacks on ports 5173/5174 and `in.saath.wellness://auth/callback`. For a permanent web deployment add only its exact HTTPS callback/recovery URLs and change the Auth site URL. A different Arena sandbox gets a different host and needs an explicit allowlist update. Avoid wildcard production redirects.

Android has the matching custom-scheme intent filter. PKCE confirmation/recovery links must be opened on the same app/device that initiated them; request a fresh link if verification state was lost. Native callbacks validate scheme, host and path before exchanging the code. These links still need physical-device end-to-end testing. Prefer verified App Links for a production release; custom schemes can be registered by another app.

## Important remaining owner setup: email delivery

**Custom SMTP is not configured.** Supabase's default email sender restricts delivery to organization-member addresses and has strict rate limits. Public-user confirmation/reset delivery is therefore **not ready**. This must not be worked around by disabling email verification.

In the project's Supabase dashboard:

1. Open **Authentication → Email / SMTP Settings**, enable custom SMTP, and configure a transactional provider and verified sending domain. Enter credentials directly in Supabase, never in chat/source code.
2. Publish the provider's required SPF/DKIM records and suitable DMARC policy. Review sender identity, email templates, rate limits, bounce handling and delivery monitoring.
3. Set production Site URL and exact redirect URLs. Keep confirmation enabled and refresh-token rotation on.
4. Raise the **server-side minimum password length to at least 12**. The app requires 12 for signup/reset, but the current hosted Auth minimum is 6; client validation is not a server policy.
5. Test signup, confirmation, resend, failed login, password recovery, expiry, logout, backup/restore and deletion with dedicated test accounts on both web and Android. Never use real sensitive notebooks for this test.

SMTP/provider/domain credentials are an owner-managed deployment dependency; none have been invented or provisioned in this repository. No real signup email has been sent or confirmed as part of this implementation.

## Verification and release gates

- `npm test`: DOM/controller, vault encryption/account binding/tamper rejection, deletion endpoint authorization, existing navigation and safety fixtures.
- `npm run check:supabase`: read-only public API smoke test; Auth enabled and anonymous reads/data deletion/account deletion denied. It creates no accounts, sends no emails and writes no notebook data. CI runs it from GitHub because this Arena shell cannot reach the Supabase hostname directly (TLS/network restriction).
- Live database transaction tests through the connector passed own-account access, cross-account isolation, anonymous denial, revision checks and deletion identity guards. Synthetic users/rows were rolled back; no real notebooks were used.
- Mobile Chromium checks covered 36 account/Calm screen combinations in English/Hindi at 320/390/768px, with mocked Auth responses: no horizontal overflow or page errors. This is not a real email, native-link or authenticated production REST end-to-end test.

Before any public pilot: complete email/device end-to-end tests, review SQL/crypto and XSS threat model independently, use a native secure token/key store and protect on-device notebooks, establish passphrase/key-lifecycle and backup-retention policies, review Supabase region/data processing under applicable Indian privacy law, appoint operations/incident owners, and complete the existing clinical/translation/accessibility gates. Do not advertise the prototype as a clinically validated or audited secure product.
