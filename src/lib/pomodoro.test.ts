import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { durationForPhase, formatDuration, nextPhase, progressFor } from './pomodoro.ts';
import type { PomodoroSettings } from './types.ts';

const settings: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  alarmOnComplete: true,
};

describe('pomodoro logic', () => {
  it('returns phase durations in milliseconds', () => {
    assert.equal(durationForPhase('focus', settings), 25 * 60_000);
    assert.equal(durationForPhase('shortBreak', settings), 5 * 60_000);
    assert.equal(durationForPhase('longBreak', settings), 15 * 60_000);
  });

  it('takes a short break after focus, then a long break after the 4th focus', () => {
    assert.deepEqual(nextPhase('focus', 0, settings), { phase: 'shortBreak', cycle: 1 });
    assert.deepEqual(nextPhase('focus', 3, settings), { phase: 'longBreak', cycle: 0 });
    assert.deepEqual(nextPhase('shortBreak', 1, settings), { phase: 'focus', cycle: 1 });
    assert.deepEqual(nextPhase('longBreak', 0, settings), { phase: 'focus', cycle: 0 });
  });

  it('formats durations as mm:ss', () => {
    assert.equal(formatDuration(25 * 60_000), '25:00');
    assert.equal(formatDuration(61_000), '01:01');
    assert.equal(formatDuration(0), '00:00');
  });

  it('computes progress between 0 and 1', () => {
    assert.equal(progressFor(1000, 1000), 0);
    assert.equal(progressFor(500, 1000), 0.5);
    assert.equal(progressFor(0, 1000), 1);
  });
});
