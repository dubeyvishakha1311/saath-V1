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
