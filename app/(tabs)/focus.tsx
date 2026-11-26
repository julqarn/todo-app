import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Chip } from '@/components/Chip';
import { ProgressRing } from '@/components/ProgressRing';
import { durationForPhase, formatDuration, phaseLabel, progressFor } from '@/lib/pomodoro';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/theme';

export default function FocusScreen() {
  const themeMode = useAppStore((s) => s.themeMode);
  const theme = useTheme(themeMode);
  const pomodoro = useAppStore((s) => s.pomodoro);
  const settings = useAppStore((s) => s.pomodoroSettings);
  const todos = useAppStore((s) => s.todos);
  const startPomodoro = useAppStore((s) => s.startPomodoro);
  const pausePomodoro = useAppStore((s) => s.pausePomodoro);
  const resumePomodoro = useAppStore((s) => s.resumePomodoro);
  const resetPomodoro = useAppStore((s) => s.resetPomodoro);
  const skipPhase = useAppStore((s) => s.skipPhase);
  const completeCurrentPhase = useAppStore((s) => s.completeCurrentPhase);
  const setLinkedTodo = useAppStore((s) => s.setLinkedTodo);

  const [now, setNow] = useState(Date.now());
  const completingRef = useRef(false);

  useEffect(() => {
    if (pomodoro.status !== 'running') return;
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [pomodoro.status]);

  const totalMs = durationForPhase(pomodoro.phase, settings);
  const remainingMs =
    pomodoro.status === 'running' && pomodoro.endsAt ? Math.max(0, pomodoro.endsAt - now) : pomodoro.remainingMs;

  useEffect(() => {
    if (pomodoro.status !== 'running' || remainingMs > 0 || completingRef.current) return;
    completingRef.current = true;
    completeCurrentPhase().finally(() => {
      completingRef.current = false;
      setNow(Date.now());
    });
  }, [pomodoro.status, remainingMs, completeCurrentPhase]);

  const openTodos = useMemo(() => todos.filter((t) => !t.completed), [todos]);
  const linkedTodo = todos.find((t) => t.id === pomodoro.linkedTodoId);
  const ringColor = pomodoro.phase === 'focus' ? theme.focus : theme.breakColor;

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>Focus</Text>
      <Text style={{ color: theme.muted }}>
        {settings.focusMinutes} min focus · {settings.shortBreakMinutes} min short break · {settings.longBreakMinutes} min long break
      </Text>

      <View style={styles.ringWrap}>
        <ProgressRing progress={progressFor(remainingMs, totalMs)} color={ringColor} trackColor={theme.surfaceMuted}>
          <Text style={[styles.phase, { color: ringColor }]}>{phaseLabel(pomodoro.phase)}</Text>
          <Text style={[styles.time, { color: theme.text }]}>{formatDuration(remainingMs)}</Text>
          <Text style={{ color: theme.muted }}>
            Cycle {Math.min(pomodoro.cycle + (pomodoro.phase === 'focus' ? 1 : 0), settings.cyclesBeforeLongBreak)} of {settings.cyclesBeforeLongBreak}
          </Text>
        </ProgressRing>
      </View>

      <View style={styles.dots}>
        {Array.from({ length: settings.cyclesBeforeLongBreak }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i < pomodoro.cycle ? theme.focus : theme.surfaceMuted, borderColor: theme.border },
            ]}
          />
        ))}
      </View>

      {linkedTodo && <Text style={{ color: theme.muted, textAlign: 'center' }}>Focusing on: {linkedTodo.title}</Text>}

      <View style={styles.controls}>
        {pomodoro.status === 'idle' && (
          <Pressable onPress={() => startPomodoro()} style={[styles.primary, { backgroundColor: theme.accent }]}>
            <Text style={{ color: theme.accentText, fontWeight: '800' }}>Start {phaseLabel(pomodoro.phase).toLowerCase()}</Text>
          </Pressable>
        )}
        {pomodoro.status === 'running' && (
          <Pressable onPress={pausePomodoro} style={[styles.primary, { backgroundColor: theme.accent }]}>
            <Text style={{ color: theme.accentText, fontWeight: '800' }}>Pause</Text>
          </Pressable>
        )}
        {pomodoro.status === 'paused' && (
          <Pressable onPress={resumePomodoro} style={[styles.primary, { backgroundColor: theme.accent }]}>
            <Text style={{ color: theme.accentText, fontWeight: '800' }}>Resume</Text>
          </Pressable>
        )}
        <Pressable onPress={skipPhase} style={[styles.secondary, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <Text style={{ color: theme.text, fontWeight: '700' }}>Skip</Text>
        </Pressable>
        <Pressable onPress={resetPomodoro} style={[styles.secondary, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <Text style={{ color: theme.text, fontWeight: '700' }}>Reset</Text>
        </Pressable>
      </View>

      <Text style={[styles.section, { color: theme.text }]}>Link a todo</Text>
      <View style={styles.row}>
        <Chip label="No todo" selected={!pomodoro.linkedTodoId} theme={theme} onPress={() => setLinkedTodo(null)} />
        {openTodos.slice(0, 10).map((todo) => (
          <Chip
            key={todo.id}
            label={todo.title}
            selected={pomodoro.linkedTodoId === todo.id}
            theme={theme}
            onPress={() => setLinkedTodo(todo.id)}
          />
        ))}
      </View>
      {openTodos.length === 0 && <Text style={{ color: theme.muted }}>Add a todo first, then link it here to count completed focus sessions on it.</Text>}

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>How it works</Text>
        <Text style={{ color: theme.muted }}>
          The timer is stored as an end time, so it stays correct if you leave the app. When a phase ends, the alarm notification fires (if enabled in Stats) and the next phase is prepared. Completed focus sessions are counted on the linked todo and in Stats.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 56, gap: 12, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800' },
  ringWrap: { alignItems: 'center', marginVertical: 12 },
  phase: { fontSize: 16, fontWeight: '800', textTransform: 'uppercase' },
  time: { fontSize: 56, fontWeight: '800' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1 },
  controls: { flexDirection: 'row', justifyContent: 'center', gap: 10, flexWrap: 'wrap' },
  primary: { borderRadius: 999, paddingHorizontal: 20, paddingVertical: 12 },
  secondary: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 12 },
  section: { fontSize: 17, fontWeight: '800', marginTop: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 6, marginTop: 8 },
  cardTitle: { fontWeight: '800', fontSize: 16 },
});
