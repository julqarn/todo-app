# Todo Focus

A cross-platform Todo app for **Android and iOS** with a modern alarm system and Pomodoro focus mode.

One React Native + Expo (TypeScript) codebase runs on both platforms. Data is stored on-device, so the app works fully offline.

## Features

- **Todos** — create, edit, complete, delete, search, and filter tasks with priorities, categories, due dates, and reminder alarms
- **Modern alarms** — repeat days (once / daily / weekdays / custom), snooze and dismiss actions, test alarm, Android alarm channel with vibration, and todo reminders
- **Pomodoro focus mode** — focus / short break / long break cycles, progress ring, linked todos, background-safe timer, phase-end alarm, and session history
- **Stats & settings** — focus minutes today and in total, recent sessions, Pomodoro durations, auto-start options, and system/light/dark theme

## Quick start

```bash
npm install
npm start
```

Press `a` for Android or `i` for iOS, or scan the QR code with Expo Go.

> Alarms work best in a development build. Expo Go supports local notifications, but Android exact-alarm behaviour is most reliable in a development/production build. See [docs/ALARMS.md](docs/ALARMS.md) and [docs/SETUP.md](docs/SETUP.md).

## Project structure

```text
app/(tabs)/        Todos, Focus, Alarms, and Stats screens (Expo Router)
src/components/    Todo/alarm forms, cards, chips, progress ring
src/lib/           Types, date helpers, Pomodoro logic, notification scheduling
src/store/         Zustand store with AsyncStorage persistence
docs/              Setup, features, architecture, alarms, Pomodoro
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Start the Expo dev server |
| `npm run android` | Start and open on Android |
| `npm run ios` | Start and open on iOS |
| `npm run typecheck` | TypeScript check |
| `npm test` | Pomodoro logic unit tests |
| `npm run doctor` | Expo Doctor checks |

## Builds

EAS profiles (`development`, `preview`, `production`) are defined in [`eas.json`](eas.json):

```bash
eas build --profile production --platform android
eas build --profile production --platform ios
```

## Documentation

- [Setup](docs/SETUP.md) — install, run, verify, and build
- [Features](docs/FEATURES.md) — what each screen does
- [Architecture](docs/ARCHITECTURE.md) — code structure and data flow
- [Alarms](docs/ALARMS.md) — scheduling, permissions, and platform limits
- [Pomodoro](docs/POMODORO.md) — phase rules and timer behaviour
- [Contributing](CONTRIBUTING.md) — workflow and verification steps
- [Changelog](CHANGELOG.md)

## Verification

The initial release was verified with `npm run typecheck`, `npm test`, and successful `expo export` bundles for both Android and iOS. Run the same checks before every push (see [CONTRIBUTING.md](CONTRIBUTING.md)).

## License

MIT — see [LICENSE](LICENSE).
