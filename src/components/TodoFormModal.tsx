import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Chip } from './Chip';
import { formatDateTime } from '@/lib/date';
import { CATEGORIES, type Priority, type Todo } from '@/lib/types';
import type { TodoInput } from '@/store/useAppStore';
import type { Theme } from '@/theme';

interface Props {
  visible: boolean;
  theme: Theme;
  initial: Todo | null;
  onClose: () => void;
  onSave: (input: TodoInput) => Promise<void>;
}

type PickerTarget = 'due' | 'reminder' | null;

export function TodoFormModal({ visible, theme, initial, onClose, onSave }: Props) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<string>('General');
  const [dueAt, setDueAt] = useState<number | null>(null);
  const [reminderAt, setReminderAt] = useState<number | null>(null);
  const [picker, setPicker] = useState<PickerTarget>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;
    setTitle(initial?.title ?? '');
    setNotes(initial?.notes ?? '');
    setPriority(initial?.priority ?? 'medium');
    setCategory(initial?.category ?? 'General');
    setDueAt(initial?.dueAt ?? null);
    setReminderAt(initial?.reminderAt ?? null);
    setError('');
    setPicker(null);
  }, [visible, initial]);

  const onPickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setPicker(null);
    if (event.type === 'dismissed' || !date) return;
    if (picker === 'due') setDueAt(date.getTime());
    if (picker === 'reminder') setReminderAt(date.getTime());
    if (Platform.OS === 'ios') setPicker(null);
  };

  const save = async () => {
    if (!title.trim()) {
      setError('Give the todo a title.');
      return;
    }
    await onSave({ title, notes, priority, category, dueAt, reminderAt });
    onClose();
  };

  const inputStyle = [styles.input, { backgroundColor: theme.surfaceMuted, borderColor: theme.border, color: theme.text }];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Pressable onPress={onClose}><Text style={{ color: theme.accent, fontWeight: '700' }}>Cancel</Text></Pressable>
          <Text style={[styles.title, { color: theme.text }]}>{initial ? 'Edit todo' : 'New todo'}</Text>
          <Pressable onPress={save}><Text style={{ color: theme.accent, fontWeight: '800' }}>Save</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.body}>
          {!!error && <Text style={{ color: theme.danger }}>{error}</Text>}
          <Text style={[styles.label, { color: theme.muted }]}>Title</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="What needs doing?" placeholderTextColor={theme.muted} style={inputStyle} />
          <Text style={[styles.label, { color: theme.muted }]}>Notes</Text>
          <TextInput value={notes} onChangeText={setNotes} placeholder="Optional details" placeholderTextColor={theme.muted} style={[inputStyle, styles.notes]} multiline />

          <Text style={[styles.label, { color: theme.muted }]}>Priority</Text>
          <View style={styles.row}>
            {(['low', 'medium', 'high'] as Priority[]).map((p) => (
              <Chip key={p} label={p} selected={priority === p} theme={theme} onPress={() => setPriority(p)} />
            ))}
          </View>

          <Text style={[styles.label, { color: theme.muted }]}>Category</Text>
          <View style={styles.row}>
            {CATEGORIES.map((c) => (
              <Chip key={c} label={c} selected={category === c} theme={theme} onPress={() => setCategory(c)} />
            ))}
          </View>

          <Text style={[styles.label, { color: theme.muted }]}>Due date</Text>
          <View style={styles.row}>
            <Chip label={dueAt ? formatDateTime(dueAt) : 'Set due date'} theme={theme} onPress={() => setPicker('due')} />
            {dueAt && <Chip label="Clear" theme={theme} onPress={() => setDueAt(null)} />}
          </View>

          <Text style={[styles.label, { color: theme.muted }]}>Reminder alarm</Text>
          <View style={styles.row}>
            <Chip label={reminderAt ? formatDateTime(reminderAt) : 'Set reminder'} theme={theme} onPress={() => setPicker('reminder')} />
            {reminderAt && <Chip label="Clear" theme={theme} onPress={() => setReminderAt(null)} />}
          </View>
          <Text style={{ color: theme.muted }}>Reminders use the alarm notification channel with sound and vibration. Notification permission is required.</Text>

          {picker && (
            <DateTimePicker
              value={new Date(picker === 'due' ? (dueAt ?? Date.now() + 3600_000) : (reminderAt ?? Date.now() + 3600_000))}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={onPickerChange}
            />
          )}
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
  notes: { minHeight: 84, textAlignVertical: 'top' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
