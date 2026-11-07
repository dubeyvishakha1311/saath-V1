# Saath

An Android-first, bilingual **internal-testing wellness prototype**, based on [PRD.md](PRD.md).

## Included

- English/Hindi onboarding and adult eligibility/consent notice
- Seven completed-day journal with local drafts; missed days do not reset progress
- Guided review of your own seven entries (not AI-generated analysis)
- Optional breathing, grounding, and back-counting tools
- Manually accessible crisis guidance and an optional trusted-contact dialler link
- Delete-all data control

## Important limitations

**Not clinically reviewed. Not therapy, diagnosis, or an emergency service.** No crisis detection, screening, automatic notifications, verified helpline directory, remote AI, account, payments, or analytics. Do not use this prototype with sensitive real-world data or as a public mental-health release. The PRD release gates remain unfulfilled.

Data is stored in app-local WebView storage, **without app-level encryption**. Android backup is disabled. Someone with access to the unlocked device/app may read entries. Uninstalling/clearing app storage may erase all data. The delete-all control clears this app's entries, drafts, contact, and preferences. Only one seven-day cycle is implemented. On-device dates determine progress; changing the device clock can affect it.

## Web development

Requires Node.js 22+.

```sh
npm ci
npm run dev
```

Vite serves on `0.0.0.0`; there are no backend requests or external asset/font dependencies.

## Build the APK locally

Requires Java 21 and Android SDK platform 35/build tools, or Android Studio configured with those dependencies.

```sh
npm ci
npm run android:sync
cd android
./gradlew assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`.

The GitHub Actions **Build Android APK** workflow performs the same build and uploads a `Saath-0.1.0-debug-apk` artifact. It runs on pushes to this session branch or manual dispatch.

### Install for internal testing

Download/unzip the artifact and open the APK on an Android 6.0+ device. Android may require permission to install from the downloading app. Alternatively use `adb install -r app-debug.apk`. A debug-signed APK is for testing, not Google Play distribution. CI builds may use different debug keys, requiring uninstall before updating (which deletes local entries). A production release needs a private signing key and all clinical, security, privacy, resource-verification, and accessibility gates in the PRD.

## First successful APK build

[Download the APK artifact](https://github.com/dubeyvishakha1311/saath-V1/actions/runs/42344303431/artifacts/13562902681) (GitHub sign-in may be required; retained for 14 days).

[Successful build run](https://github.com/dubeyvishakha1311/saath-V1/actions/runs/42344303431), source commit `a2a02fa`. Four DOM-based functional tests and the Android debug compilation passed. Physical-device installation, Android dialler integration, accessibility, and clinical review have **not** been validated. To run the automated functional tests locally: `npm test`.

## Mobile-app redesign (0.2.0)

The refreshed UI uses a compact Today dashboard, persistent icon tab bar, touch-sized controls, local-only mood check-in, daily journal progress card, one-tap calming exercises, and a mobile-width app canvas on desktop. Journal, consent, crisis guidance, and deletion remain available. Mood check-ins are optional local preferences, not clinical scores or remote analytics; delete-all removes them too. Native Android system-bar colours match the app.

Validation: six DOM functional tests pass. A Chromium smoke check at 390×844 covered onboarding, the Today dashboard, mood selection, and direct breathing-tool navigation with no horizontal overflow. Physical Android testing and clinical review are still outstanding. Version 0.2.0 supersedes the first-build APK linked above; use the latest successful **Build Android APK** workflow artifact.

## Navigation update (0.2.1)

- Back and Home controls appear on every screen alongside the existing language and Get help buttons. Back is disabled at the initial/root screen, where there is no previous view.
- Back returns through actual screen/exercise history and restores the prior scroll position. Home clears that navigation stack and returns to Today (or Welcome before consent).
- Android's system Back button uses the same in-app navigation through `@capacitor/app`; at the root it stays in the app. Use Android's Home gesture to leave.
- Journal drafts and unsaved trusted-contact edits survive navigation. Cancel changes resets the contact field to its saved value. Existing save, stop, call and deletion actions remain available in their relevant screens.
- Deleting all data clears navigation and temporary edits so Back cannot reopen deleted content. No journal/dashboard access is allowed before consent.

Ten DOM-based tests cover core functionality and navigation. Native hardware-back integration requires physical-device testing.
