# Changelog
## 1.1.0 — 2026-11-27

- Fixed "App not installed as package appears to be invalid" on newer Android phones: upgraded to Expo SDK 54 / React Native 0.81 so native libraries use 16 KB page alignment.
- Release builds are now signed with a dedicated release keystore (v1+v2+v3 signing).
- New app icon designed with Canva (checkmark + focus-timer ring), plus splash and favicon.


## 1.0.0 APK — 2026-11-27

- Android APK published for direct download from GitHub Releases (`todo-focus-v1.0.0.apk`), built automatically by the **Build Android APK** GitHub Actions workflow.

## 1.0.0 — 2026-11-26

- Initial release of Todo Focus for Android and iOS (Expo SDK 52, React Native, TypeScript).
- Todos with priorities, categories, due dates, reminder alarms, search, and filters.
- Modern alarm system: repeat days, snooze/dismiss actions, test alarm, Android alarm channel, and permission handling.
- Pomodoro focus mode: focus/short/long break cycles, progress ring, linked todos, background-safe end-time timer, phase-end alarm, and session history.
- Stats and settings: focus totals, Pomodoro configuration, and system/light/dark theme.
- Documentation: setup, features, architecture, alarms, Pomodoro, contributing, and EAS build profiles.
- Verified with TypeScript checks, Pomodoro unit tests, and successful Expo exports for Android and iOS.
