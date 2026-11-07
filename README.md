# Saath · 0.3.0

An Android-first, English/Hindi **internal-testing wellness prototype** based on the attached idea summary and [PRD.md](PRD.md). Not a clinically approved product, diagnostic tool, therapy service, or monitored crisis service.

## Current features

- Mobile Today dashboard, optional local mood check-in, icon tabs, Back/Home/help controls and Android hardware-back integration.
- **Explore:** original story and poem prompts, song title/artist/link plus reflection on the user's explanation only. No song playback, lyrics fetching, or song-content analysis.
- Saved local reflections, draft recovery, tentative keyword-based themes with visible word evidence, and rejection of themes that do not fit.
- Seven completed-day journal, weekly themes, user-selected positive moments, and optional small exercises. Missed days do not reset progress.
- Six exercise types: CBT-informed perspective, small daily action, basic mindfulness, self-compassion, expressive writing, and ACT-style values prompts.
- Optional conversational-style **English PHQ-9 / GAD-7** questionnaire flows, 0–3 scoring, non-diagnostic results, previous-question editing, discard/delete, and self-report limitations. No validated Hindi instrument translation is bundled.
- Local safety-word routing for supported English/Hindi/Roman-Hindi phrases across submitted journal/story/song/poem/exercise text. **Incomplete and not clinically validated**: it can miss signals or produce false positives. Never assume a user is safe because it did not trigger.
- PHQ-9 item 9 above zero immediately opens crisis support, independently of the total score or storage success. Ordinary results are suppressed for that response.
- Offline breathing, 5–4–3–2–1 grounding, back-counting, medical-emergency warning, optional trusted contact, India emergency/Tele-MANAS dialler links, and professional-support guidance.
- Local-only storage, no ads, no analytics, no account, and delete-all covering new drafts, reflections, screening answers, contact, and preferences.

See [docs/FEATURE_COVERAGE.md](docs/FEATURE_COVERAGE.md) for the PDF-to-implementation map and remaining release gates.

## Important limitations

**Do not launch publicly or use for urgent support.** Content, translations, reflection rules, screening implementation and crisis routing await clinical review. Keyword matching is not AI, sentiment understanding, clinical risk assessment, or guaranteed detection. Nobody monitors the app or receives alerts.

Data is stored in app-local WebView storage **without app-level encryption**. Someone with access to the unlocked device/app may read it. Android backup is disabled; uninstalling/clearing app storage can erase everything. Delete-all clears app-owned local content and in-memory navigation; it does not control OS-level copies outside the app. Avoid sensitive real-world data on shared/test devices.

External resources open only on user action. Dialler links require calling service and do not automatically place calls. India numbers were checked against official web listings on 7 November 2026, **not call-tested**. They are not a worldwide resource directory.

No remote AI/provider, validated Hindi screening, therapist booking/provider directory, voice journaling, payment, subscription, institution dashboard, cloud sync, or additional journal cycles are implemented. Some of these are optional business ideas in the PDF rather than core app requirements. A production launch requires clinical, native-speaker, accessibility, device, security, privacy/legal, and operational review—not just a successful build.

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

The GitHub Actions **Build Android APK** workflow performs tests, web/native sync and debug compilation on pushes to `arena/55e548ad-saath-v1`, or manual dispatch. Download the latest successful run's **Saath-0.3.0-debug-apk** artifact from [Actions](https://github.com/dubeyvishakha1311/saath-V1/actions). Artifacts are retained for 14 days.

### Install for internal testing

Extract the artifact ZIP and open `app-debug.apk` on Android 6.0+. Enable permission to install from that source if prompted, or use `adb install -r app-debug.apk`. CI debug signing keys may differ between builds; uninstall may be necessary before an update, deleting local data. This is not a signed production/Play Store release. Never share private signing credentials in the repository.

### Validation

24 automated DOM/domain tests cover original features, new flows, scoring and incomplete inputs, safety overrides, draft preservation, user-theme rejection, HTML escaping, navigation, and delete-all. Mobile Chromium smoke checks exercise Explore screens at 320/390/768px, story reflection, and PHQ-9 safety routing, with no horizontal overflow or uncaught page errors. These checks do not replace clinical validation, a security audit, accessibility testing, or physical Android installation/calling/back-button tests.
