import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { nextAlarmDate } from './date';
import type { Alarm, PomodoroPhase, Todo } from './types';
import { phaseLabel } from './pomodoro';

export const ALARM_CHANNEL = 'alarms';
export const REMINDER_CHANNEL = 'reminders';
export const FOCUS_CHANNEL = 'focus';

let configured = false;

/** Configure foreground behaviour, Android channels, and alarm actions (Snooze / Dismiss). */
export async function configureNotifications(): Promise<void> {
  if (configured) return;
  configured = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ALARM_CHANNEL, {
      name: 'Alarms',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 300, 200, 300, 200, 500],
      lightColor: '#4F46E5',
      sound: 'default',
      bypassDnd: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL, {
      name: 'Todo reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 200, 150, 200],
      sound: 'default',
    });
    await Notifications.setNotificationChannelAsync(FOCUS_CHANNEL, {
      name: 'Focus timer',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 150, 250],
      sound: 'default',
    });
  }

  await Notifications.setNotificationCategoryAsync('alarm', [
    { identifier: 'snooze', buttonTitle: 'Snooze', options: { opensAppToForeground: false } },
    { identifier: 'dismiss', buttonTitle: 'Dismiss', options: { opensAppToForeground: false, isDestructive: true } },
  ]);
}

export async function getNotificationPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  return settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function requestNotificationPermission(): Promise<boolean> {
  await configureNotifications();
  if (!Device.isDevice && Platform.OS !== 'web') {
    // Simulators can still schedule local notifications on iOS; Android emulators usually can too.
    // We still ask so the UI can explain the state honestly.
  }
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const requested = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return requested.granted;
}

async function schedule(content: Notifications.NotificationContentInput, trigger: Notifications.NotificationTriggerInput): Promise<string> {
  await configureNotifications();
  return Notifications.scheduleNotificationAsync({ content, trigger });
}

export async function cancelNotifications(ids: (string | null | undefined)[]): Promise<void> {
  await Promise.all(
    ids.filter(Boolean).map(async (id) => {
      try {
        await Notifications.cancelScheduledNotificationAsync(id as string);
      } catch {
        // Already fired or cancelled — nothing to do.
      }
    }),
  );
}

/** Schedule (or reschedule) the reminder for a todo. Returns the notification id, or null. */
export async function scheduleTodoReminder(todo: Todo): Promise<string | null> {
  await cancelNotifications([todo.reminderNotificationId]);
  if (todo.completed || !todo.reminderAt || todo.reminderAt <= Date.now()) return null;
  const granted = await getNotificationPermission();
  if (!granted) return null;
  return schedule(
    {
      title: 'Todo reminder',
      body: todo.title,
      sound: 'default',
      data: { type: 'todo-reminder', todoId: todo.id },
    },
    {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(todo.reminderAt),
      channelId: REMINDER_CHANNEL,
    },
  );
}

/** Schedule an alarm. One-time alarms use a date trigger; repeats use daily/weekly triggers. */
export async function scheduleAlarm(alarm: Alarm): Promise<string[]> {
  await cancelNotifications(alarm.notificationIds);
  if (!alarm.enabled) return [];
  const granted = await getNotificationPermission();
  if (!granted) return [];

  const content: Notifications.NotificationContentInput = {
    title: alarm.label || 'Alarm',
    body: 'Tap Snooze to delay, or Dismiss to stop.',
    sound: 'default',
    categoryIdentifier: 'alarm',
    sticky: true,
    data: { type: 'alarm', alarmId: alarm.id, snoozeMinutes: alarm.snoozeMinutes },
  };

  if (alarm.days.length === 0) {
    const id = await schedule(content, {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: nextAlarmDate(alarm.hour, alarm.minute),
      channelId: ALARM_CHANNEL,
    });
    return [id];
  }

  if (alarm.days.length === 7) {
    const id = await schedule(content, {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: alarm.hour,
      minute: alarm.minute,
      channelId: ALARM_CHANNEL,
    });
    return [id];
  }

  const ids: string[] = [];
  for (const day of alarm.days) {
    const id = await schedule(content, {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: day + 1, // Expo: 1 = Sunday … 7 = Saturday
      hour: alarm.hour,
      minute: alarm.minute,
      channelId: ALARM_CHANNEL,
    });
    ids.push(id);
  }
  return ids;
}

export async function scheduleSnooze(alarm: Alarm): Promise<string> {
  return schedule(
    {
      title: alarm.label || 'Alarm',
      body: `Snoozed alarm (${alarm.snoozeMinutes} min)`,
      sound: 'default',
      categoryIdentifier: 'alarm',
      sticky: true,
      data: { type: 'alarm', alarmId: alarm.id, snoozeMinutes: alarm.snoozeMinutes },
    },
    {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(Date.now() + alarm.snoozeMinutes * 60_000),
      channelId: ALARM_CHANNEL,
    },
  );
}

/** Fire a test alarm in 5 seconds so users can verify sound, vibration, and actions. */
export async function scheduleTestAlarm(): Promise<string> {
  return schedule(
    {
      title: 'Test alarm',
      body: 'Your alarm sound, vibration, and Snooze/Dismiss actions are working.',
      sound: 'default',
      categoryIdentifier: 'alarm',
      data: { type: 'test-alarm' },
    },
    {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(Date.now() + 5_000),
      channelId: ALARM_CHANNEL,
    },
  );
}

export async function schedulePomodoroEnd(phase: PomodoroPhase, endsAt: number): Promise<string | null> {
  const granted = await getNotificationPermission();
  if (!granted || endsAt <= Date.now()) return null;
  const isFocus = phase === 'focus';
  return schedule(
    {
      title: isFocus ? 'Focus complete' : `${phaseLabel(phase)} complete`,
      body: isFocus ? 'Time for a break. Well done.' : 'Break over — ready to focus again?',
      sound: 'default',
      data: { type: 'pomodoro-end', phase },
    },
    {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(endsAt),
      channelId: FOCUS_CHANNEL,
    },
  );
}
