# Setup

Todo Focus is one Expo / React Native codebase that runs on **Android and iOS**.

## Prerequisites

- Node.js 20 or newer (developed with Node 24)
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
