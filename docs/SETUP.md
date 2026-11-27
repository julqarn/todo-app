# Setup

Todo Focus is one Expo / React Native codebase that runs on **Android and iOS**.

## Download the Android APK

Most users do not need to build anything:

1. Open the [latest GitHub Release](https://github.com/julqarn/todo-app/releases/latest).
2. Download the `todo-focus-*.apk` asset.
3. Install it on an Android phone. Android may ask you to allow installation from your browser or file manager.

The APK is produced by the **Build Android APK** GitHub Actions workflow in this repository: it installs dependencies, runs the typecheck and unit tests, generates the Android project with `npx expo prebuild --platform android`, builds a release APK with Gradle (`./gradlew assembleRelease`), and publishes the APK to GitHub Releases. Maintainers can start it manually from the Actions tab (**Build Android APK → Run workflow**) or by pushing a version tag such as `v1.0.1`.

This APK is for direct installation from GitHub. For Google Play submission, build a signed Android App Bundle with EAS production credentials instead (see Production builds below).

## Prerequisites

- Node.js 22 or newer (developed and verified with Node 24; the unit tests run TypeScript directly and need Node's type-stripping support)
- npm
- For a physical device: the Expo Go app, or a development build (recommended for alarms)
- For store builds: an Expo account for EAS Build, plus Apple / Google developer accounts for submission

## Install and run

```bash
npm install
npm start
```

Then:

- Press `a` to open on Android (emulator or connected device)
- Press `i` to open on iOS (simulator, macOS only)
- Or scan the QR code with Expo Go on a physical phone

Other scripts:

```bash
npm run android     # start and open on Android
npm run ios         # start and open on iOS
npm run typecheck   # TypeScript check (tsc --noEmit)
npm test            # Pomodoro logic unit tests (Node test runner)
npm run doctor      # Expo Doctor project checks
```

## Development build (recommended for alarms)

Expo Go supports local notifications, but Android exact-alarm behaviour, custom notification channels in production, and iOS notification behaviour are most reliable in a development or production build.

```bash
npm install -g eas-cli
eas login
eas build --profile development --platform android
eas build --profile development --platform ios
```

Build profiles are defined in [`eas.json`](../eas.json): `development`, `preview`, and `production`.

## Production builds

```bash
eas build --profile production --platform android
eas build --profile production --platform ios
```

Before a store submission, add final app icons / splash assets and reference them in `app.json` (`expo.icon`, `expo.splash`, `expo.android.adaptiveIcon.foregroundImage`). The current `app.json` intentionally omits binary icon assets, so Expo falls back to its default icon during development.

## Verify a change

```bash
npm run typecheck
npm test
npx expo export --platform android
npx expo export --platform ios
```

Both platform exports should bundle successfully. That is the same verification used for the initial release of this repository.
