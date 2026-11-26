# Alarm system

Todo Focus implements alarms with **local notifications** (`expo-notifications`). There is no server push involved: every alarm, todo reminder, and Pomodoro end alert is scheduled on the device.

## How scheduling works

| Kind | Trigger | Channel (Android) |
| --- | --- | --- |
| One-time alarm | Date trigger at the next occurrence of the chosen time | `alarms` |
| Daily alarm (all 7 days) | Daily trigger | `alarms` |
| Repeat on selected days | One weekly trigger per selected day (Expo weekday 1 = Sunday … 7 = Saturday) | `alarms` |
| Snooze | Date trigger `now + snoozeMinutes` | `alarms` |
| Todo reminder | Date trigger at `reminderAt` | `reminders` |
| Pomodoro phase end | Date trigger at the phase `endsAt` | `focus` |
| Test alarm | Date trigger 5 seconds from now | `alarms` |

Android channels are created in `src/lib/notifications.ts`:

- **alarms** — maximum importance, vibration pattern, public lock-screen visibility, Do Not Disturb bypass requested
- **reminders** — high importance
- **focus** — high importance

Alarm notifications use the `alarm` category with **Snooze** and **Dismiss** actions. Snooze is handled in `app/_layout.tsx` and reschedules the alarm after its snooze interval.

## Permissions

- Android 13+ and iOS require notification permission before alarms can sound. The Alarms and Stats screens show the permission state and can request it.
- `app.json` declares the Android permissions used by the alarm system, including `POST_NOTIFICATIONS`, `SCHEDULE_EXACT_ALARM`, `VIBRATE`, `WAKE_LOCK`, and `RECEIVE_BOOT_COMPLETED`.

## Platform limits (honest notes)

- **Expo Go vs. builds.** Local notifications work in Expo Go for development, but exact-alarm timing and channel behaviour are most reliable in a development or production build. Use EAS Build (see [SETUP.md](SETUP.md)) for real alarm testing on Android.
- **Android exact alarms.** Android 12+ restricts exact alarms. `SCHEDULE_EXACT_ALARM` is declared, but some devices also require the user to allow "Alarms & reminders" for the app in system settings. If an alarm fires late on such a device, check that setting first.
- **Full-screen alarms.** This version uses high-priority notifications with sound, vibration, and actions rather than a full-screen ringing activity. A full-screen alarm UI on Android requires a native module / config plugin and is a possible future upgrade.
- **iOS.** iOS does not offer Android-style exact alarms or Do Not Disturb bypass to ordinary apps. Alarms arrive as time-sensitive notifications with sound; Critical Alerts require a special Apple entitlement.
- **Reboot.** Scheduled local notifications are restored by the OS after reboot on both platforms, subject to the permissions above.
