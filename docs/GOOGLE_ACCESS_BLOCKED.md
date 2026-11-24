# Google “Access blocked”: verified boundaries and owner checklist

## What has been verified

The connected Saath Supabase project is healthy, Google is enabled, nonce checks are not skipped, signup is enabled and the exact Android callback `in.saath.wellness://auth/callback` is allowlisted. The app uses Supabase PKCE and Capacitor Browser/system browser for Android—not an embedded Google login WebView. Do not “fix” a Google block by spoofing a user agent, disabling nonce/PKCE, relaxing RLS, disabling email verification, or allowing arbitrary redirects.

Provider enabled is **not** the same as Google accepting this OAuth application/account. Supabase's authorized return destinations govern the later Supabase-to-app step. Google's authorized HTTPS redirect URI is a different configuration:

`https://ittnpegkfonxvkcfqmgd.supabase.co/auth/v1/callback`

The management connector does not control Google Cloud consent-screen audience, test users, OAuth client type, authorized redirect registration, app verification or Workspace policy. No provider credentials, redirect settings or real user data have been changed without a verified reason. Do not put OAuth secrets into source, chat or the APK.

## Check the exact error on Google's page

Ask the affected user for a cropped screenshot/error **name/code**, not their password, full OAuth URL, state value, authorization code or token. The actual reported screen/error has not yet been supplied, so the cause of this particular block is unconfirmed.

- **403 access_denied / app is being tested / developer has not given access:** in the matching Google Cloud project, open Google Auth Platform → Audience. If the app is External + Testing, the owner must add the intended test Google accounts to Test users. Use a dedicated pilot list with permission; do not publish an unfinished app merely to evade testing restrictions. If the intended audience is broader, complete the appropriate publishing/verification/privacy requirements first. The agent does not need users' Google passwords or emails in chat.
- **redirect_uri_mismatch:** configure a **Web application** OAuth client for Supabase's hosted OAuth flow, with exactly the HTTPS Supabase callback above under Authorized redirect URIs. Store that client's matching ID/secret directly in Supabase → Authentication → Providers → Google. Do not use the Android custom scheme as Google's redirect URI; keep that scheme in the Supabase redirect allowlist only.
- **disallowed_useragent:** use an up-to-date system browser/Chrome via the Android app's external sign-in action. Do not open Google OAuth inside an unrelated messaging/social app's embedded browser. The shipped native flow already uses a system browser. Obtain the device/browser and error code before changing this path.
- **org_internal / admin_policy_enforced / account restricted:** the organization's Google Workspace administrator or the OAuth app owner must authorize the appropriate audience/access. The app cannot bypass organizational or account protections.
- **invalid_client / deleted_client:** the owner must confirm the Google client exists and is active, and that Supabase contains its matching configuration. Never paste the secret into a support chat. Do not rotate credentials without a coordinated owner action.
- **invalid_grant / code already used / code verifier error after returning to the app:** the Android callback code may have been delivered more than once or opened on another device. This change deduplicates concurrent launch/event delivery and successful callbacks in memory, without persisting authorization codes. Start a fresh sign-in on the same device rather than reusing an old callback link. A process death can still invalidate an in-progress flow and needs device QA.

## App-side corrections

`src/native-auth-callback.js` accepts only the exact app callback, rejects ambiguous/error responses, coalesces duplicate in-flight exchanges and ignores already successfully consumed codes within a bounded, memory-only cache. Failed exchanges remain retryable; unsupported Browser.close does not turn a successful login into an error. Provider descriptions/codes/URLs are never logged or reflected as user-controlled error text. Login/signup now include collapsible, bilingual blocked-access guidance and maintain guest/Calm/help access.

## Stronger readiness checks

Google CI readiness now performs a public Supabase authorize request with a fresh PKCE challenge and `redirect: manual`. It checks the **unfollowed** redirect: HTTPS accounts.google.com, known authorization path, exact Supabase callback, code flow, Google client-ID format, and basic identity scopes only. It does not print or persist the Location/OAuth state, follow Google, authenticate a person, create a session, establish Google verification status or prove a real user's access. Tests cover validator failures and duplicate/error callback handling. A successful preflight cannot resolve a blocked consent screen without the specific Google error and the owner's Google Cloud settings.

The final merge is an app-side fix/diagnostic improvement, not proof that the reported Google-side block is resolved. The already distributed 0.7.2 APK is unchanged by a source merge; it needs a later native build to include the callback improvements because OTA is not activated.
