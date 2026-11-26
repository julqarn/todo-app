# Architecture

## Stack

| Layer | Choice |
| --- | --- |
| Framework | React Native 0.76 + Expo SDK 52 |
| Language | TypeScript (strict) |
| Navigation | Expo Router (file-based, bottom tabs) |
| State | Zustand with AsyncStorage persistence |
| Notifications / alarms | `expo-notifications` local scheduling |
| Date/time input | `@react-native-community/datetimepicker` |
| Timer ring | `react-native-svg` |

One codebase targets Android and iOS. Platform differences are handled through Expo and React Native APIs; the only platform-specific code is notification channel setup (Android) and date-picker presentation.

## Project structure

```text
app/
  _layout.tsx            Root layout: notification setup + Snooze action handling
  (tabs)/
    _layout.tsx          Bottom tabs (Todos, Focus, Alarms, Stats)
    index.tsx            Todos screen
    focus.tsx            Pomodoro focus screen
    alarms.tsx           Alarms screen
    stats.tsx            Stats + settings screen
src/
  theme.ts               Light/dark theme tokens and useTheme hook
  components/
    Chip.tsx             Selectable chip
    ProgressRing.tsx     SVG progress ring for the timer
    TodoCard.tsx         Todo list row
    TodoFormModal.tsx    Create/edit todo form
    AlarmFormModal.tsx   Create/edit alarm form
  lib/
    types.ts             Todo, Alarm, Pomodoro and session types
    date.ts              Formatting, filtering, sorting helpers
    pomodoro.ts          Pure Pomodoro phase logic (unit-tested)
    pomodoro.test.ts     Node test-runner tests for pomodoro.ts
    notifications.ts     Alarm/reminder/focus notification scheduling
  store/
    useAppStore.ts       Zustand store: state + actions + persistence
docs/                    Setup, features, architecture, alarms, Pomodoro
eas.json                 EAS Build profiles
```

## Data flow

1. Screens read state from `useAppStore` and call its actions.
2. Actions update state and, where needed, schedule or cancel notifications through `src/lib/notifications.ts`.
3. The store is persisted to AsyncStorage (`todo-focus-store-v1`), including todos, alarms, sessions, settings, theme, and the Pomodoro runtime.
4. The Pomodoro runtime stores `endsAt` (a timestamp) while running. The Focus screen derives the remaining time from `endsAt - now`, so backgrounding or restarting the app does not drift the timer. If `endsAt` has passed when the screen mounts, the phase completes and the next phase is prepared.
5. Notification responses are handled in `app/_layout.tsx`: tapping **Snooze** on an alarm notification calls `snoozeAlarm`, which schedules a new alarm notification after the alarm's snooze interval.

## Key design decisions

- **End-time timer, not tick counting.** Interval ticks only re-render the countdown; the source of truth is `endsAt`.
- **Pure Pomodoro logic.** `src/lib/pomodoro.ts` has no React Native imports, so it is unit-tested with the Node test runner (`npm test`).
- **Notification ids are stored.** Todos keep `reminderNotificationId` and alarms keep `notificationIds`, so edits, completion, disabling, and deletion can cancel exactly the notifications they scheduled.
- **Offline-first.** No backend in v1. Sync/accounts can be added later behind the store actions without changing screens.
