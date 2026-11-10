# Saath · 0.7.0

An Android-first, English/Hindi **internal-testing wellness prototype** based on the attached idea summary and [PRD.md](PRD.md). Not a clinically approved product, diagnostic tool, therapy service, or monitored crisis service.

## Current features

- Mobile Today dashboard, optional local mood check-in, icon tabs, Back/Home/help controls and Android hardware-back integration.
- **Explore:** original story and poem prompts, song title/artist/link plus reflection on the user's explanation only. No song playback, lyrics fetching, or song-content analysis.
- Saved local reflections, draft recovery, tentative keyword-based themes with visible word evidence, and rejection of themes that do not fit.
- Tap-first seven-day journal: Day 1 pick one, Days 2–7 pick all that fit. Typing is optional and collapsed by default. Choice drafts recover and same-day entries can be edited. Weekly review retains selected options without turning them into inferred diagnoses. Missed days do not reset progress.
- Six exercise types: CBT-informed perspective, small daily action, basic mindfulness, self-compassion, expressive writing, and ACT-style values prompts.
- Optional conversational-style **English PHQ-9 / GAD-7** questionnaire flows, 0–3 scoring, non-diagnostic results, previous-question editing, discard/delete, and self-report limitations. No validated Hindi instrument translation is bundled.
- Local safety-word routing for supported English/Hindi/Roman-Hindi phrases across submitted journal/story/song/poem/exercise text. **Incomplete and not clinically validated**: it can miss signals or produce false positives. Never assume a user is safe because it did not trigger.
- PHQ-9 item 9 above zero immediately opens crisis support, independently of the total score or storage success. Ordinary results are suppressed for that response.
- Offline breathing, 5–4–3–2–1 grounding, back-counting, medical-emergency warning, optional trusted contact, India emergency/Tele-MANAS dialler links, and professional-support guidance.
- Optional Supabase email/password accounts, separate guest/account notebooks, explicit encrypted cloud backup/restore and account/data deletion. No automatic upload, ads, analytics or remote AI. Guest writing and Calm do not require login.

See [docs/FEATURE_COVERAGE.md](docs/FEATURE_COVERAGE.md) for the PDF-to-implementation map and remaining release gates.

## Important limitations

**Do not launch publicly or use for urgent support.** Content, translations, reflection rules, screening implementation and crisis routing await clinical review. Keyword matching is not AI, sentiment understanding, clinical risk assessment, or guaranteed detection. Nobody monitors the app or receives alerts.

Data is stored in app-local WebView storage **without app-level encryption**. Someone with access to the unlocked device/app may read it. Android backup is disabled; uninstalling/clearing app storage can erase everything. Guest deletion clears app-owned local content and in-memory navigation. Signed-in deletion also removes the cloud backup; account deletion is separate. Neither remotely wipes other offline devices or provider/OS-level copies. Avoid sensitive real-world data on shared/test devices.

External resources open only on user action. Dialler links require calling service and do not automatically place calls. India numbers were checked against official web listings on 7 November 2026, **not call-tested**. They are not a worldwide resource directory.

No remote AI/provider, validated Hindi screening, therapist booking/provider directory, voice journaling, payment, subscription, institution dashboard, cloud sync, or additional journal cycles are implemented. Some of these are optional business ideas in the PDF rather than core app requirements. A production launch requires clinical, native-speaker, accessibility, device, security, privacy/legal, and operational review—not just a successful build.

## In-app web updates (0.7.0 — activation pending)

My space now includes **App updates**. The Android updater supports signed web-only bundles, compatible-native-runtime checks, explicit download/restart, startup-failure rollback, and returning to the installed APK. It never installs automatically during writing or crisis support. Notebook/session data is not sent to the update host. Plugin telemetry is disabled; the app uses public GitHub Releases, not a paid Capgo service.

**Not live yet:** this GitHub connection returned HTTP 403 for Actions Secrets access. No release signing key was provisioned, and delivery is deliberately disabled. Follow [activation and publishing](docs/OTA_UPDATES.md) before distributing the one-time bootstrap APK. The current 0.7.0 debug build is for integration testing only, not an activated updater installer. Existing 0.6.0 APKs cannot gain a native updater through web changes alone.

One native APK installation will still be required **after activation**. Future compatible HTML/CSS/JavaScript/content updates use My space without APK reinstalls; native/plugin/permission changes still need a new APK. This is not a promise that every future change can be delivered OTA.

## Tap-first check-ins and research (0.6.0)

- Story/Song/Poem cards first open a research screen with independently sourced participation percentage bars, populations, dates, links and an explicit **not treatment evidence / not a preference ranking** notice. The activity follows via Continue; each supports tap-only answers and optional notes.
- Selecting **“I wish I could disappear” on Day 5** opens crisis support immediately, before saving/submitting. Tele-MANAS 14416 and emergency 112 remain visible. This precautionary rule is **awaiting psychologist review**, not a diagnosis or validated risk assessment; nobody is alerted.
- All journal/creative selections, notes and drafts are included in the existing single encrypted account backup in Supabase. They are saved on-device immediately; **cloud upload is manual**, with explicit consent/passphrase. No plaintext response table or activity tracking was added. Sign in, copy a guest notebook if needed, then use Account & backup → Encrypted cloud backup.
- Checked with 60 automated tests and 84 mobile Chromium screen combinations in English/Hindi at 320/390/768px. Physical Android, clinical and real-account/provider testing remain release gates.

See [research sources, storage map and review checklist](docs/RESEARCH_AND_CHOICES.md).

## Accounts and Supabase (0.5.0)

Connected to your **saath** Supabase project. Sign in/create account is available from welcome and My space. Account & backup has manual upload/restore with a separate passphrase; writing is never silently uploaded. Back/Home/help/language controls and the prominent middle Calm tab are preserved.

**Email delivery still needs custom SMTP in Supabase.** Verification remains enabled; the default sender is restricted to organization-member addresses. Public signup/reset delivery, real email/native-link end-to-end tests and secure on-device token storage are not production-ready. See [Supabase setup, privacy and remaining owner steps](docs/SUPABASE.md).

## Google sign-in (0.5.1)

**Continue with Google** is available on sign-in and signup, with a separate 18+/identity-sharing choice. Android uses a system browser/Custom Tab; web uses a full-page redirect. Both return through Supabase PKCE. No notebook upload follows login.

**Not active yet:** the connected project has Google disabled and no OAuth client credentials. The app checks provider availability and explains the setup requirement rather than launching a broken flow. Follow [Google activation steps](docs/SUPABASE.md#google-sign-in-activation-051); enter the client secret directly in Supabase, not in source or chat. No real Google account sign-in/device callback has been tested.

## Run and test

Requires Node.js 22+.

```sh
npm ci
npm run dev
npm test
npm run build
```

Vite binds to `0.0.0.0` and accepts Arena preview hosts. All core assets are bundled; there are no remote fonts or runtime model calls.

## Build Android APK

Requires Java 21 and Android SDK platform 35/build tools (or Android Studio configured with these).

```sh
npm ci
npm run android:sync
cd android
./gradlew assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`.

The GitHub Actions **Build Android APK** workflow performs tests, web/native sync and debug compilation on pushes to `arena/55e548ad-saath-v1`, or manual dispatch. Download the latest successful run's **Saath-0.7.0-debug-apk** artifact from [Actions](https://github.com/dubeyvishakha1311/saath-V1/actions). Artifacts are retained for 14 days.

### Install for internal testing

Extract the artifact ZIP and open `app-debug.apk` on Android 6.0+. Enable permission to install from that source if prompted, or use `adb install -r app-debug.apk`. CI debug signing keys may differ between builds; uninstall may be necessary before an update, deleting local data. This is not a signed production/Play Store release. Never share private signing credentials in the repository.

### Validation

60 automated tests cover account isolation, explicit backup consent, authenticated deletion, session races, cryptography/tamper rejection, original features, scoring and incomplete inputs, safety overrides, draft preservation, user-theme rejection, HTML escaping, navigation, and delete-all. Mobile Chromium smoke checks exercise Explore screens at 320/390/768px, story reflection, and PHQ-9 safety routing, with no horizontal overflow or uncaught page errors. These checks do not replace clinical validation, a security audit, accessibility testing, or physical Android installation/calling/back-button tests.

## Navigation emphasis (0.3.1)

Bottom tabs are ordered Today → Explore → **Calm** → Journal → My space. Calm uses a raised 60px circular icon with a larger touch area and remains visually prominent when inactive. Browser geometry checks at 320/390/768px confirm it is centered, larger than other tab icons, and opens the calming tools.

## UI/UX refinement (0.4.0)

- Warm paper, ink, forest and restrained rust accents replace the multi-colour card grid. Serif reading headings are paired with system UI text; no remote font service is used.
- Today has one clear journal action, neutral feeling buttons, visible seven-day progress, simple calming-tool rows and a secondary Explore entry.
- Explore is an indexed reading list with distinct icons rather than identical coloured tiles. Story/poem content uses a readable reading surface; forms and screening use consistent input and selection controls.
- Calm retains its raised, larger centre tab. Exercise choices use full-width rows; breathing text stays still while only the surrounding ring animates. Reduced-motion preferences disable that animation.
- Mood buttons can be deselected with a second tap. Clear feedback explains how to clear a selection and where drafts are stored.
- Local selections preserve keyboard focus; navigation and new questionnaire questions focus their headings. This is targeted accessibility work, not a claim of a complete accessibility audit.
- Hindi glyphs are bundled offline with Noto Sans Devanagari 400/600 (SIL Open Font License; distributed at `public/licenses/NotoSansDevanagari-OFL.txt`). English screening item wording remains unchanged.

Validation: 28 automated tests plus browser checks of 11 screens in English/Hindi at 320, 390 and 768px (66 combinations), mood toggling, question focus and reduced motion. No horizontal overflow or uncaught page errors in these checks. Physical Android and clinical review remain outstanding. See [UI design notes](docs/UI_DESIGN.md) for rationale and limits.
