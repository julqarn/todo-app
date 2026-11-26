export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  title: string;
  notes: string;
  completed: boolean;
  priority: Priority;
  category: string;
  dueAt: number | null;
  reminderAt: number | null;
  reminderNotificationId: string | null;
  pomodorosCompleted: number;
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
}

export interface Alarm {
  id: string;
  label: string;
  hour: number;
  minute: number;
  /** 0 = Sunday … 6 = Saturday. Empty means a one-time alarm at the next occurrence. */
  days: number[];
  enabled: boolean;
  snoozeMinutes: number;
  notificationIds: string[];
  linkedTodoId: string | null;
  createdAt: number;
  updatedAt: number;
}

export type PomodoroPhase = 'focus' | 'shortBreak' | 'longBreak';

export interface PomodoroSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  cyclesBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  alarmOnComplete: boolean;
}

export interface FocusSession {
  id: string;
  phase: PomodoroPhase;
  todoId: string | null;
  startedAt: number;
  endedAt: number;
  durationMinutes: number;
  completed: boolean;
}

export interface PomodoroRuntime {
  phase: PomodoroPhase;
  status: 'idle' | 'running' | 'paused';
  endsAt: number | null;
  remainingMs: number;
  cycle: number;
  linkedTodoId: string | null;
  notificationId: string | null;
  startedAt: number | null;
}

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  alarmOnComplete: true,
};

export const CATEGORIES = ['General', 'Work', 'Study', 'Personal', 'Health', 'Errands'] as const;

export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
