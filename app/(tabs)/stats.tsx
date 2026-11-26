import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Chip } from '@/components/Chip';
import { formatDateTime, isToday } from '@/lib/date';
import { requestNotificationPermission } from '@/lib/notifications';
import { phaseLabel } from '@/lib/pomodoro';
import { useAppStore } from '@/store/useAppStore';
import { useTheme, type ThemeMode } from '@/theme';

function Stepper({
  label,
  value,
  suffix,
  theme,
  onChange,
}: {
  label: string;
  value: number;
  suffix: string;
  theme: ReturnType<typeof useTheme>;
  onChange: (value: number) => void;
}) {
  return (
    <View style={styles.stepperRow}>
      <Text style={{ color: theme.text, flex: 1 }}>{label}</Text>
      <Pressable onPress={() => onChange(value - 1)} style={[styles.stepButton, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
        <Text style={{ color: theme.text, fontWeight: '800' }}>−</Text>
      </Pressable>
      <Text style={{ color: theme.text, fontWeight: '800', minWidth: 64, textAlign: 'center' }}>{value} {suffix}</Text>
      <Pressable onPress={() => onChange(value + 1)} style={[styles.stepButton, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
        <Text style={{ color: theme.text, fontWeight: '800' }}>+</Text>
      </Pressable>
    </View>
  );
}

export default function StatsScreen() {
  const themeMode = useAppStore((s) => s.themeMode);
  const theme = useTheme(themeMode);
  const todos = useAppStore((s) => s.todos);
  const sessions = useAppStore((s) => s.sessions);
  const settings = useAppStore((s) => s.pomodoroSettings);
  const setThemeMode = useAppStore((s) => s.setThemeMode);
  const updatePomodoroSettings = useAppStore((s) => s.updatePomodoroSettings);
  const [permissionMessage, setPermissionMessage] = useState('');

  const stats = useMemo(() => {
    const focusSessions = sessions.filter((s) => s.phase === 'focus' && s.completed);
    const todayMinutes = focusSessions.filter((s) => isToday(s.endedAt)).reduce((sum, s) => sum + s.durationMinutes, 0);
    const totalMinutes = focusSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    return {
      todayMinutes,
      totalMinutes,
      focusCount: focusSessions.length,
      completedTodos: todos.filter((t) => t.completed).length,
      openTodos: todos.filter((t) => !t.completed).length,
    };
  }, [sessions, todos]);

  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

  const askPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionMessage(granted ? 'Notifications enabled.' : 'Notifications are still off. Enable them in device settings.');
    if (!granted) Alert.alert('Notifications are off', 'Enable notifications for Todo Focus in your device settings.');
  };

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>Stats</Text>

      <View style={styles.grid}>
        {[
          { label: 'Focus today', value: `${stats.todayMinutes} min` },
          { label: 'Total focus', value: `${stats.totalMinutes} min` },
          { label: 'Focus sessions', value: String(stats.focusCount) },
          { label: 'Todos done', value: `${stats.completedTodos}/${todos.length}` },
        ].map((item) => (
          <View key={item.label} style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.statValue, { color: theme.text }]}>{item.value}</Text>
            <Text style={{ color: theme.muted }}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Pomodoro settings</Text>
        <Stepper label="Focus" value={settings.focusMinutes} suffix="min" theme={theme} onChange={(v) => updatePomodoroSettings({ focusMinutes: clamp(v, 1, 180) })} />
        <Stepper label="Short break" value={settings.shortBreakMinutes} suffix="min" theme={theme} onChange={(v) => updatePomodoroSettings({ shortBreakMinutes: clamp(v, 1, 60) })} />
        <Stepper label="Long break" value={settings.longBreakMinutes} suffix="min" theme={theme} onChange={(v) => updatePomodoroSettings({ longBreakMinutes: clamp(v, 1, 120) })} />
        <Stepper label="Cycles before long break" value={settings.cyclesBeforeLongBreak} suffix="" theme={theme} onChange={(v) => updatePomodoroSettings({ cyclesBeforeLongBreak: clamp(v, 1, 12) })} />
        <View style={styles.toggleRow}>
          <Text style={{ color: theme.text, flex: 1 }}>Auto-start breaks</Text>
          <Switch value={settings.autoStartBreaks} onValueChange={(v) => updatePomodoroSettings({ autoStartBreaks: v })} />
        </View>
        <View style={styles.toggleRow}>
          <Text style={{ color: theme.text, flex: 1 }}>Auto-start focus after breaks</Text>
          <Switch value={settings.autoStartFocus} onValueChange={(v) => updatePomodoroSettings({ autoStartFocus: v })} />
        </View>
        <View style={styles.toggleRow}>
          <Text style={{ color: theme.text, flex: 1 }}>Alarm when a phase ends</Text>
          <Switch value={settings.alarmOnComplete} onValueChange={(v) => updatePomodoroSettings({ alarmOnComplete: v })} />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Appearance & notifications</Text>
        <View style={styles.row}>
          {(['system', 'light', 'dark'] as ThemeMode[]).map((mode) => (
            <Chip key={mode} label={mode} selected={themeMode === mode} theme={theme} onPress={() => setThemeMode(mode)} />
          ))}
        </View>
        <Pressable onPress={askPermission} style={[styles.primary, { backgroundColor: theme.accent }]}>
          <Text style={{ color: theme.accentText, fontWeight: '800' }}>Enable notifications</Text>
        </Pressable>
        {!!permissionMessage && <Text style={{ color: theme.muted }}>{permissionMessage}</Text>}
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Recent sessions</Text>
        {sessions.length === 0 && <Text style={{ color: theme.muted }}>No focus sessions yet. Start one from the Focus tab.</Text>}
        {sessions.slice(0, 10).map((session) => {
          const todo = todos.find((t) => t.id === session.todoId);
          return (
            <View key={session.id} style={styles.sessionRow}>
              <Text style={{ color: theme.text, fontWeight: '700' }}>{phaseLabel(session.phase)} · {session.durationMinutes} min</Text>
              <Text style={{ color: theme.muted }}>{formatDateTime(session.endedAt)}{todo ? ` · ${todo.title}` : ''}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 56, gap: 14, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '48%', borderWidth: 1, borderRadius: 16, padding: 14, gap: 4 },
  statValue: { fontSize: 22, fontWeight: '800' },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 12 },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepButton: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  primary: { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 11, alignSelf: 'flex-start' },
  sessionRow: { gap: 2, paddingVertical: 4 },
});
