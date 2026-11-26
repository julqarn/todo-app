# Todo Focus

A cross-platform Todo app for **Android and iOS** with a modern alarm system and Pomodoro focus mode.

Built with React Native + Expo (TypeScript), so one codebase runs on both platforms.

## Features

- **Todos** — create, edit, complete, delete, search, filter, priorities, categories, due dates and reminders
- **Modern alarms** — local notifications with Android alarm channel, repeat days, snooze, test alarm, and todo reminders
- **Pomodoro focus mode** — focus / short break / long break cycles, progress ring, linked todo, background-safe timer, completion alarm, session history
- **Stats** — focus minutes, completed todos, and recent sessions
- **Offline-first** — all data is stored on-device with AsyncStorage
- **Light / dark / system theme**

## Quick start

```bash
npm install
npm start
```

Then scan the QR code with Expo Go, or press `a` for Android / `i` for iOS in the Expo CLI.

> Alarms and exact notifications work best in a development build. Expo Go supports local notifications, but Android exact-alarm and full-screen alarm behaviour require a development / production build. See [docs/ALARMS.md](docs/ALARMS.md).

## Documentation

- [Setup](docs/SETUP.md) — install, run, and build for Android / iOS
- [Features](docs/FEATURES.md) — what each screen does
- [Architecture](docs/ARCHITECTURE.md) — code structure and data flow
- [Alarms](docs/ALARMS.md) — how the alarm system works and its platform limits
- [Pomodoro](docs/POMODORO.md) — focus-mode rules and settings
- [Contributing](CONTRIBUTING.md)

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Start the Expo dev server |
| `npm run android` | Start and open on Android |
| `npm run ios` | Start and open on iOS |
| `npm run typecheck` | Run TypeScript checks |
| `npm run doctor` | Run Expo Doctor |

## License

MIT — see [LICENSE](LICENSE).
