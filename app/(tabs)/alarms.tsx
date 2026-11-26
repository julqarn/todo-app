import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { AlarmFormModal } from '@/components/AlarmFormModal';
import { formatTime, repeatLabel } from '@/lib/date';
import { getNotificationPermission, requestNotificationPermission, scheduleTestAlarm } from '@/lib/notifications';
import type { Alarm } from '@/lib/types';
import { useAppStore, type AlarmInput } from '@/store/useAppStore';
import { useTheme } from '@/theme';

export default function AlarmsScreen() {
  const themeMode = useAppStore((s) => s.themeMode);
  const theme = useTheme(themeMode);
  const alarms = useAppStore((s) => s.alarms);
  const todos = useAppStore((s) => s.todos);
  const addAlarm = useAppStore((s) => s.addAlarm);
  const updateAlarm = useAppStore((s) => s.updateAlarm);
  const toggleAlarm = useAppStore((s) => s.toggleAlarm);
  const deleteAlarm = useAppStore((s) => s.deleteAlarm);

  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Alarm | null>(null);
  const [permission, setPermission] = useState<boolean | null>(null);

  const refreshPermission = useCallback(async () => {
    setPermission(await getNotificationPermission());
  }, []);

  useEffect(() => {
    refreshPermission();
  }, [refreshPermission]);

  const askPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermission(granted);
    if (!granted) {
      Alert.alert('Notifications are off', 'Enable notifications for Todo Focus in your device settings so alarms can sound.');
    }
  };

  const testAlarm = async () => {
    const granted = permission ?? (await requestNotificationPermission());
    setPermission(granted);
    if (!granted) {
      Alert.alert('Notifications are off', 'Enable notifications first, then try the test alarm again.');
      return;
    }
    await scheduleTestAlarm();
    Alert.alert('Test alarm set', 'It will fire in 5 seconds with sound, vibration, and Snooze/Dismiss actions.');
  };

  const save = async (input: AlarmInput) => {
    if (editing) await updateAlarm(editing.id, input);
    else await addAlarm(input);
    refreshPermission();
  };

  const confirmDelete = (alarm: Alarm) => {
    Alert.alert('Delete alarm?', `“${alarm.label}” at ${formatTime(alarm.hour, alarm.minute)} will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteAlarm(alarm.id) },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Alarms</Text>
      <Text style={{ color: theme.muted }}>Sound, vibration, repeat days, and snooze — even when the app is closed.</Text>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Notification permission</Text>
        <Text style={{ color: theme.muted }}>
          {permission === null ? 'Checking…' : permission ? 'Enabled — alarms can sound.' : 'Not enabled — alarms will not sound until you allow notifications.'}
        </Text>
        <View style={styles.row}>
          <Pressable onPress={askPermission} style={[styles.smallPrimary, { backgroundColor: theme.accent }]}>
            <Text style={{ color: theme.accentText, fontWeight: '800' }}>Allow notifications</Text>
          </Pressable>
          <Pressable onPress={testAlarm} style={[styles.smallSecondary, { borderColor: theme.border }]}>
            <Text style={{ color: theme.text, fontWeight: '700' }}>Test alarm (5s)</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>No alarms yet</Text>
            <Text style={{ color: theme.muted }}>Create a wake-up alarm, a study alarm, or link an alarm to a todo.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const linked = todos.find((t) => t.id === item.linkedTodoId);
          return (
            <View style={[styles.alarmCard, { backgroundColor: theme.surface, borderColor: theme.border, opacity: item.enabled ? 1 : 0.55 }]}>
              <Pressable style={styles.alarmBody} onPress={() => { setEditing(item); setFormVisible(true); }}>
                <Text style={[styles.alarmTime, { color: theme.text }]}>{formatTime(item.hour, item.minute)}</Text>
                <Text style={{ color: theme.text, fontWeight: '700' }}>{item.label}</Text>
                <Text style={{ color: theme.muted }}>
                  {repeatLabel(item.days)} · Snooze {item.snoozeMinutes} min{linked ? ` · ${linked.title}` : ''}
                </Text>
              </Pressable>
              <View style={styles.alarmActions}>
                <Switch value={item.enabled} onValueChange={() => toggleAlarm(item.id)} />
                <Pressable onPress={() => confirmDelete(item)} hitSlop={8}>
                  <Text style={{ color: theme.danger, fontWeight: '700' }}>Delete</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />

      <Pressable
        onPress={() => { setEditing(null); setFormVisible(true); }}
        style={[styles.addButton, { backgroundColor: theme.accent }]}
      >
        <Text style={{ color: theme.accentText, fontWeight: '800', fontSize: 16 }}>+ New alarm</Text>
      </Pressable>

      <AlarmFormModal visible={formVisible} theme={theme} initial={editing} todos={todos} onClose={() => setFormVisible(false)} onSave={save} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56, gap: 10 },
  title: { fontSize: 28, fontWeight: '800' },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  smallPrimary: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
  smallSecondary: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
  list: { paddingBottom: 90, gap: 0 },
  alarmCard: { flexDirection: 'row', borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 10, gap: 12 },
  alarmBody: { flex: 1, gap: 3 },
  alarmTime: { fontSize: 30, fontWeight: '800' },
  alarmActions: { alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 },
  addButton: { position: 'absolute', right: 20, bottom: 24, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 13 },
});
