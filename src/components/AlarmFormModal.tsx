import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Chip } from './Chip';
import { DAY_LABELS, formatTime } from '@/lib/date';
import type { Alarm, Todo } from '@/lib/types';
import type { AlarmInput } from '@/store/useAppStore';
import type { Theme } from '@/theme';

interface Props {
  visible: boolean;
  theme: Theme;
  initial: Alarm | null;
  todos: Todo[];
  onClose: () => void;
  onSave: (input: AlarmInput) => Promise<void>;
}

export function AlarmFormModal({ visible, theme, initial, todos, onClose, onSave }: Props) {
  const [label, setLabel] = useState('');
  const [time, setTime] = useState<Date>(new Date());
  const [days, setDays] = useState<number[]>([]);
  const [snoozeMinutes, setSnoozeMinutes] = useState(10);
  const [linkedTodoId, setLinkedTodoId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const base = new Date();
    base.setHours(initial?.hour ?? 7, initial?.minute ?? 0, 0, 0);
    setTime(base);
    setLabel(initial?.label ?? '');
    setDays(initial?.days ?? []);
    setSnoozeMinutes(initial?.snoozeMinutes ?? 10);
    setLinkedTodoId(initial?.linkedTodoId ?? null);
    setShowPicker(false);
  }, [visible, initial]);

  const toggleDay = (day: number) => {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => a - b)));
  };

  const onPickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (event.type === 'dismissed' || !date) return;
    setTime(date);
    if (Platform.OS === 'ios') setShowPicker(false);
  };

  const save = async () => {
    await onSave({
      label,
      hour: time.getHours(),
      minute: time.getMinutes(),
      days,
      snoozeMinutes,
      linkedTodoId,
    });
    onClose();
  };

  const openTodos = todos.filter((t) => !t.completed);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Pressable onPress={onClose}><Text style={{ color: theme.accent, fontWeight: '700' }}>Cancel</Text></Pressable>
          <Text style={[styles.title, { color: theme.text }]}>{initial ? 'Edit alarm' : 'New alarm'}</Text>
          <Pressable onPress={save}><Text style={{ color: theme.accent, fontWeight: '800' }}>Save</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={[styles.label, { color: theme.muted }]}>Label</Text>
          <TextInput
            value={label}
            onChangeText={setLabel}
            placeholder="Wake up, study, gym…"
            placeholderTextColor={theme.muted}
            style={[styles.input, { backgroundColor: theme.surfaceMuted, borderColor: theme.border, color: theme.text }]}
          />

          <Text style={[styles.label, { color: theme.muted }]}>Time</Text>
          <Pressable onPress={() => setShowPicker(true)} style={[styles.timeButton, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={{ color: theme.text, fontSize: 32, fontWeight: '800' }}>{formatTime(time.getHours(), time.getMinutes())}</Text>
            <Text style={{ color: theme.muted }}>Tap to change</Text>
          </Pressable>
          {showPicker && (
            <DateTimePicker value={time} mode="time" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onPickerChange} />
          )}

          <Text style={[styles.label, { color: theme.muted }]}>Repeat</Text>
          <View style={styles.row}>
            <Chip label="Once" selected={days.length === 0} theme={theme} onPress={() => setDays([])} />
            <Chip label="Every day" selected={days.length === 7} theme={theme} onPress={() => setDays([0, 1, 2, 3, 4, 5, 6])} />
            <Chip label="Weekdays" selected={days.length === 5 && [1, 2, 3, 4, 5].every((d) => days.includes(d))} theme={theme} onPress={() => setDays([1, 2, 3, 4, 5])} />
          </View>
          <View style={styles.row}>
            {DAY_LABELS.map((labelDay, index) => (
              <Chip key={labelDay} label={labelDay} selected={days.includes(index)} theme={theme} onPress={() => toggleDay(index)} />
            ))}
          </View>

          <Text style={[styles.label, { color: theme.muted }]}>Snooze</Text>
          <View style={styles.row}>
            {[5, 10, 15, 30].map((m) => (
              <Chip key={m} label={`${m} min`} selected={snoozeMinutes === m} theme={theme} onPress={() => setSnoozeMinutes(m)} />
            ))}
          </View>

          <Text style={[styles.label, { color: theme.muted }]}>Linked todo (optional)</Text>
          <View style={styles.row}>
            <Chip label="None" selected={!linkedTodoId} theme={theme} onPress={() => setLinkedTodoId(null)} />
            {openTodos.slice(0, 8).map((todo) => (
              <Chip key={todo.id} label={todo.title} selected={linkedTodoId === todo.id} theme={theme} onPress={() => setLinkedTodoId(todo.id)} />
            ))}
          </View>
          {openTodos.length === 0 && <Text style={{ color: theme.muted }}>No open todos to link yet.</Text>}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 20 },
  title: { fontSize: 18, fontWeight: '800' },
  body: { padding: 16, gap: 10, paddingBottom: 40 },
  label: { fontWeight: '700', marginTop: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, fontSize: 16 },
  timeButton: { borderWidth: 1, borderRadius: 16, padding: 16, alignItems: 'center', gap: 4 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
