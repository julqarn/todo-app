import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  cancelNotifications,
  scheduleAlarm,
  schedulePomodoroEnd,
  scheduleSnooze,
  scheduleTodoReminder,
} from '@/lib/notifications';
import { durationForPhase, nextPhase, shouldAutoStart } from '@/lib/pomodoro';
import type { ThemeMode } from '@/theme';
import {
  createId,
  DEFAULT_POMODORO_SETTINGS,
  type Alarm,
  type FocusSession,
  type PomodoroRuntime,
  type PomodoroSettings,
  type Todo,
} from '@/lib/types';

export interface TodoInput {
  title: string;
  notes: string;
  priority: Todo['priority'];
  category: string;
  dueAt: number | null;
  reminderAt: number | null;
}

export interface AlarmInput {
  label: string;
  hour: number;
  minute: number;
  days: number[];
  snoozeMinutes: number;
  linkedTodoId: string | null;
}

interface AppState {
  todos: Todo[];
  alarms: Alarm[];
  sessions: FocusSession[];
  themeMode: ThemeMode;
  pomodoroSettings: PomodoroSettings;
  pomodoro: PomodoroRuntime;

  addTodo: (input: TodoInput) => Promise<void>;
  updateTodo: (id: string, input: TodoInput) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;

  addAlarm: (input: AlarmInput) => Promise<void>;
  updateAlarm: (id: string, input: AlarmInput) => Promise<void>;
  toggleAlarm: (id: string) => Promise<void>;
  deleteAlarm: (id: string) => Promise<void>;
  snoozeAlarm: (id: string) => Promise<void>;

  setThemeMode: (mode: ThemeMode) => void;
  updatePomodoroSettings: (patch: Partial<PomodoroSettings>) => void;

  startPomodoro: (linkedTodoId?: string | null) => Promise<void>;
  pausePomodoro: () => Promise<void>;
  resumePomodoro: () => Promise<void>;
  resetPomodoro: () => Promise<void>;
  skipPhase: () => Promise<void>;
  completeCurrentPhase: () => Promise<void>;
  setLinkedTodo: (todoId: string | null) => void;
}

const initialPomodoro: PomodoroRuntime = {
  phase: 'focus',
  status: 'idle',
  endsAt: null,
  remainingMs: DEFAULT_POMODORO_SETTINGS.focusMinutes * 60_000,
  cycle: 0,
  linkedTodoId: null,
  notificationId: null,
  startedAt: null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      todos: [],
      alarms: [],
      sessions: [],
      themeMode: 'system',
      pomodoroSettings: DEFAULT_POMODORO_SETTINGS,
      pomodoro: initialPomodoro,

      addTodo: async (input) => {
        const now = Date.now();
        const todo: Todo = {
          id: createId(),
          title: input.title.trim(),
          notes: input.notes.trim(),
          completed: false,
          priority: input.priority,
          category: input.category || 'General',
          dueAt: input.dueAt,
          reminderAt: input.reminderAt,
          reminderNotificationId: null,
          pomodorosCompleted: 0,
          createdAt: now,
          updatedAt: now,
          completedAt: null,
        };
        const reminderNotificationId = await scheduleTodoReminder(todo);
        set((s) => ({ todos: [{ ...todo, reminderNotificationId }, ...s.todos] }));
      },

      updateTodo: async (id, input) => {
        const existing = get().todos.find((t) => t.id === id);
        if (!existing) return;
        const updated: Todo = {
          ...existing,
          title: input.title.trim(),
          notes: input.notes.trim(),
          priority: input.priority,
          category: input.category || 'General',
          dueAt: input.dueAt,
          reminderAt: input.reminderAt,
          updatedAt: Date.now(),
        };
        const reminderNotificationId = await scheduleTodoReminder(updated);
        set((s) => ({
          todos: s.todos.map((t) => (t.id === id ? { ...updated, reminderNotificationId } : t)),
        }));
      },

      toggleTodo: async (id) => {
        const existing = get().todos.find((t) => t.id === id);
        if (!existing) return;
        const completed = !existing.completed;
        const updated: Todo = {
          ...existing,
          completed,
          completedAt: completed ? Date.now() : null,
          updatedAt: Date.now(),
        };
        if (completed) {
          await cancelNotifications([existing.reminderNotificationId]);
          updated.reminderNotificationId = null;
        } else {
          updated.reminderNotificationId = await scheduleTodoReminder(updated);
        }
        set((s) => ({ todos: s.todos.map((t) => (t.id === id ? updated : t)) }));
      },

      deleteTodo: async (id) => {
        const existing = get().todos.find((t) => t.id === id);
        await cancelNotifications([existing?.reminderNotificationId]);
        set((s) => ({
          todos: s.todos.filter((t) => t.id !== id),
          pomodoro: s.pomodoro.linkedTodoId === id ? { ...s.pomodoro, linkedTodoId: null } : s.pomodoro,
        }));
      },

      addAlarm: async (input) => {
        const now = Date.now();
        const alarm: Alarm = {
          id: createId(),
          label: input.label.trim() || 'Alarm',
          hour: input.hour,
          minute: input.minute,
          days: [...input.days].sort((a, b) => a - b),
          enabled: true,
          snoozeMinutes: input.snoozeMinutes,
          notificationIds: [],
          linkedTodoId: input.linkedTodoId,
          createdAt: now,
          updatedAt: now,
        };
        const notificationIds = await scheduleAlarm(alarm);
        set((s) => ({ alarms: [{ ...alarm, notificationIds }, ...s.alarms] }));
      },

      updateAlarm: async (id, input) => {
        const existing = get().alarms.find((a) => a.id === id);
        if (!existing) return;
        const updated: Alarm = {
          ...existing,
          label: input.label.trim() || 'Alarm',
          hour: input.hour,
          minute: input.minute,
          days: [...input.days].sort((a, b) => a - b),
          snoozeMinutes: input.snoozeMinutes,
          linkedTodoId: input.linkedTodoId,
          updatedAt: Date.now(),
        };
        const notificationIds = await scheduleAlarm(updated);
        set((s) => ({ alarms: s.alarms.map((a) => (a.id === id ? { ...updated, notificationIds } : a)) }));
      },

      toggleAlarm: async (id) => {
        const existing = get().alarms.find((a) => a.id === id);
        if (!existing) return;
        const updated: Alarm = { ...existing, enabled: !existing.enabled, updatedAt: Date.now() };
        const notificationIds = updated.enabled ? await scheduleAlarm(updated) : [];
        if (!updated.enabled) await cancelNotifications(existing.notificationIds);
        set((s) => ({ alarms: s.alarms.map((a) => (a.id === id ? { ...updated, notificationIds } : a)) }));
      },

      deleteAlarm: async (id) => {
        const existing = get().alarms.find((a) => a.id === id);
        await cancelNotifications(existing?.notificationIds ?? []);
        set((s) => ({ alarms: s.alarms.filter((a) => a.id !== id) }));
      },

      snoozeAlarm: async (id) => {
        const existing = get().alarms.find((a) => a.id === id);
        if (!existing) return;
        const snoozeId = await scheduleSnooze(existing);
        set((s) => ({
          alarms: s.alarms.map((a) =>
            a.id === id ? { ...a, notificationIds: [...a.notificationIds, snoozeId], updatedAt: Date.now() } : a,
          ),
        }));
      },

      setThemeMode: (mode) => set({ themeMode: mode }),

      updatePomodoroSettings: (patch) => {
        set((s) => {
          const pomodoroSettings = { ...s.pomodoroSettings, ...patch };
          const pomodoro =
            s.pomodoro.status === 'idle'
              ? { ...s.pomodoro, remainingMs: durationForPhase(s.pomodoro.phase, pomodoroSettings) }
              : s.pomodoro;
          return { pomodoroSettings, pomodoro };
        });
      },

      setLinkedTodo: (todoId) => set((s) => ({ pomodoro: { ...s.pomodoro, linkedTodoId: todoId } })),

      startPomodoro: async (linkedTodoId) => {
        const { pomodoroSettings, pomodoro } = get();
        const phase = pomodoro.status === 'idle' ? pomodoro.phase : 'focus';
        const total = durationForPhase(phase, pomodoroSettings);
        const endsAt = Date.now() + total;
        await cancelNotifications([pomodoro.notificationId]);
        const notificationId = pomodoroSettings.alarmOnComplete ? await schedulePomodoroEnd(phase, endsAt) : null;
        set({
          pomodoro: {
            phase,
            status: 'running',
            endsAt,
            remainingMs: total,
            cycle: phase === 'focus' && pomodoro.status !== 'idle' ? pomodoro.cycle : pomodoro.cycle,
            linkedTodoId: linkedTodoId !== undefined ? linkedTodoId : pomodoro.linkedTodoId,
            notificationId,
            startedAt: Date.now(),
          },
        });
      },

      pausePomodoro: async () => {
        const { pomodoro } = get();
        if (pomodoro.status !== 'running' || !pomodoro.endsAt) return;
        const remainingMs = Math.max(0, pomodoro.endsAt - Date.now());
        await cancelNotifications([pomodoro.notificationId]);
        set({ pomodoro: { ...pomodoro, status: 'paused', endsAt: null, remainingMs, notificationId: null } });
      },

      resumePomodoro: async () => {
        const { pomodoro, pomodoroSettings } = get();
        if (pomodoro.status !== 'paused') return;
        const endsAt = Date.now() + pomodoro.remainingMs;
        const notificationId = pomodoroSettings.alarmOnComplete
          ? await schedulePomodoroEnd(pomodoro.phase, endsAt)
          : null;
        set({ pomodoro: { ...pomodoro, status: 'running', endsAt, notificationId } });
      },

      resetPomodoro: async () => {
        const { pomodoro, pomodoroSettings } = get();
        await cancelNotifications([pomodoro.notificationId]);
        set({
          pomodoro: {
            ...initialPomodoro,
            remainingMs: durationForPhase('focus', pomodoroSettings),
            linkedTodoId: pomodoro.linkedTodoId,
          },
        });
      },

      skipPhase: async () => {
        await get().completeCurrentPhase();
      },

      completeCurrentPhase: async () => {
        const { pomodoro, pomodoroSettings } = get();
        await cancelNotifications([pomodoro.notificationId]);
        const now = Date.now();
        const total = durationForPhase(pomodoro.phase, pomodoroSettings);
        const session: FocusSession = {
          id: createId(),
          phase: pomodoro.phase,
          todoId: pomodoro.linkedTodoId,
          startedAt: pomodoro.startedAt ?? now - total,
          endedAt: now,
          durationMinutes: Math.round(total / 60_000),
          completed: true,
        };
        const next = nextPhase(pomodoro.phase, pomodoro.cycle, pomodoroSettings);
        const nextTotal = durationForPhase(next.phase, pomodoroSettings);
        const autoStart = shouldAutoStart(next.phase, pomodoroSettings);
        const endsAt = autoStart ? now + nextTotal : null;
        const notificationId =
          autoStart && pomodoroSettings.alarmOnComplete && endsAt
            ? await schedulePomodoroEnd(next.phase, endsAt)
            : null;

        set((s) => ({
          sessions: [session, ...s.sessions],
          todos:
            pomodoro.phase === 'focus' && pomodoro.linkedTodoId
              ? s.todos.map((t) =>
                  t.id === pomodoro.linkedTodoId
                    ? { ...t, pomodorosCompleted: t.pomodorosCompleted + 1, updatedAt: now }
                    : t,
                )
              : s.todos,
          pomodoro: {
            phase: next.phase,
            status: autoStart ? 'running' : 'idle',
            endsAt,
            remainingMs: nextTotal,
            cycle: next.cycle,
            linkedTodoId: pomodoro.linkedTodoId,
            notificationId,
            startedAt: autoStart ? now : null,
          },
        }));
      },
    }),
    {
      name: 'todo-focus-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
