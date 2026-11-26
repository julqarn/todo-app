# Contributing

Thanks for helping improve Todo Focus.

## Workflow

1. Install dependencies: `npm install`
2. Run the app: `npm start`
3. Make your change in a focused commit-sized step.
4. Verify before pushing:

```bash
npm run typecheck
npm test
npx expo export --platform android
npx expo export --platform ios
```

5. Push every implementation, update, or upgrade as its own commit with a clear message (for example `feat: …`, `fix: …`, `docs: …`, `chore: …`). Do not batch unrelated changes into one push.

## Code conventions

- TypeScript strict mode; keep `npm run typecheck` green.
- Screens live in `app/(tabs)/`, reusable UI in `src/components/`, pure logic in `src/lib/`, and state/actions in `src/store/useAppStore.ts`.
- Keep Pomodoro phase rules in `src/lib/pomodoro.ts` and add/adjust tests in `src/lib/pomodoro.test.ts` when they change.
- Any new scheduled notification must store its notification id so it can be cancelled on edit/delete. See `src/lib/notifications.ts` and `docs/ALARMS.md`.
- Update the relevant doc in `docs/` when behaviour changes, and add a `CHANGELOG.md` entry.

## Testing alarms

Use the **Test alarm (5s)** button on the Alarms tab for a quick check. For Android exact-alarm behaviour, test in a development build rather than Expo Go (see `docs/SETUP.md`).
