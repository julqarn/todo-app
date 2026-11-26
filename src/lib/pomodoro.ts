import type { PomodoroPhase, PomodoroSettings } from './types.ts';

export function durationForPhase(phase: PomodoroPhase, settings: PomodoroSettings): number {
  const minutes =
    phase === 'focus'
      ? settings.focusMinutes
      : phase === 'shortBreak'
        ? settings.shortBreakMinutes
        : settings.longBreakMinutes;
  return Math.max(1, minutes) * 60_000;
}

export function phaseLabel(phase: PomodoroPhase): string {
  if (phase === 'focus') return 'Focus';
  if (phase === 'shortBreak') return 'Short break';
  return 'Long break';
}

/**
 * Work out the next phase after `phase` completes.
 * `cycle` counts completed focus sessions in the current set.
 * After every `cyclesBeforeLongBreak` focus sessions, take a long break and reset the cycle.
 */
export function nextPhase(
  phase: PomodoroPhase,
  cycle: number,
  settings: PomodoroSettings,
): { phase: PomodoroPhase; cycle: number } {
  if (phase !== 'focus') {
    return { phase: 'focus', cycle };
  }
  const completed = cycle + 1;
  if (completed >= Math.max(1, settings.cyclesBeforeLongBreak)) {
    return { phase: 'longBreak', cycle: 0 };
  }
  return { phase: 'shortBreak', cycle: completed };
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function progressFor(remainingMs: number, totalMs: number): number {
  if (totalMs <= 0) return 0;
  const done = 1 - Math.max(0, remainingMs) / totalMs;
  return Math.min(1, Math.max(0, done));
}

export function shouldAutoStart(next: PomodoroPhase, settings: PomodoroSettings): boolean {
  return next === 'focus' ? settings.autoStartFocus : settings.autoStartBreaks;
}
