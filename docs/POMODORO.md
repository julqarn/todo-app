# Pomodoro focus mode

## Default cycle

- Focus: 25 minutes
- Short break: 5 minutes
- Long break: 15 minutes after every 4 focus sessions

All durations and the cycle count are configurable in the Stats tab.

## Phase rules

Implemented in `src/lib/pomodoro.ts` (`nextPhase`) and covered by unit tests:

1. After a focus phase, the cycle count increases by one.
2. If the cycle count reaches `cyclesBeforeLongBreak`, the next phase is a long break and the cycle resets to 0.
3. Otherwise the next phase is a short break.
4. After any break, the next phase is focus.

## Timer behaviour

- Starting a phase stores `endsAt = now + duration` and schedules the phase-end alarm notification (if "Alarm when a phase ends" is on).
- Pausing stores the remaining milliseconds and cancels the scheduled notification. Resuming recomputes `endsAt` from the remaining time and reschedules.
- Skipping completes the current phase immediately (and records the session).
- Reset returns to an idle focus phase and cancels any scheduled notification.
- If the app is closed when a phase ends, the notification still fires. On reopen, the Focus screen sees that `endsAt` has passed, records the session, and prepares the next phase.
- Auto-start settings control whether breaks and subsequent focus phases begin automatically after a phase completes.

## Sessions and todos

- Every completed phase is recorded as a session (phase, start/end, duration, linked todo).
- Completing a focus phase increments `pomodorosCompleted` on the linked todo.
- Stats aggregates focus minutes for today and in total from the recorded sessions.
