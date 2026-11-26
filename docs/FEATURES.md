# Features

## Todos

- Create, edit, complete, and delete todos
- Title, notes, priority (low / medium / high), and category
- Optional due date and time with a native date/time picker
- Optional reminder alarm at a chosen date and time
- Search across title, notes, and category
- Filters: All, Today, Upcoming, High priority, Completed
- Sorting: incomplete first, then earliest due date, then priority
- Overdue todos are highlighted
- Each todo counts completed Pomodoro focus sessions linked to it

## Alarms

- Create, edit, enable/disable, and delete alarms
- Label, time, repeat days (once, every day, weekdays, or custom days), and snooze length (5–30 minutes)
- Optional link to an open todo
- Android alarm notification channel with maximum importance, vibration, and Do Not Disturb bypass where the OS allows it
- Notification actions: **Snooze** and **Dismiss**
- Test alarm button that fires in 5 seconds
- Permission card that shows whether notifications are enabled

See [ALARMS.md](ALARMS.md) for how scheduling works and the platform limits.

## Pomodoro focus mode

- Focus, short break, and long break phases (default 25 / 5 / 15 minutes)
- Long break after a configurable number of focus cycles (default 4)
- Progress ring, cycle dots, start / pause / resume / skip / reset
- Link a focus session to a todo; completed focus sessions increment that todo's count
- Background-safe timer: the phase is stored as an end time, so leaving the app does not drift the timer
- Optional alarm notification when a phase ends
- Optional auto-start for breaks and for focus after breaks

See [POMODORO.md](POMODORO.md) for the phase rules.

## Stats and settings

- Focus minutes today and in total, focus session count, todos completed
- Recent focus/break sessions with their linked todo
- Pomodoro durations and cycle settings
- Theme: system, light, or dark
- Notification permission shortcut

## Data

All data is stored on-device (AsyncStorage via Zustand persist). There is no account, server, or network dependency in v1. Deleting the app deletes its local data.
