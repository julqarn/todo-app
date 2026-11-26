import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatDateTime, isOverdue } from '@/lib/date';
import type { Todo } from '@/lib/types';
import type { Theme } from '@/theme';

interface Props {
  todo: Todo;
  theme: Theme;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const priorityColor: Record<Todo['priority'], string> = {
  high: '#DC2626',
  medium: '#D97706',
  low: '#059669',
};

export function TodoCard({ todo, theme, onToggle, onEdit, onDelete }: Props) {
  const overdue = isOverdue(todo);
  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Pressable onPress={onToggle} style={[styles.check, { borderColor: theme.accent, backgroundColor: todo.completed ? theme.accent : 'transparent' }]}>
        <Text style={{ color: todo.completed ? theme.accentText : theme.accent, fontWeight: '800' }}>{todo.completed ? '✓' : ''}</Text>
      </Pressable>
      <Pressable style={styles.body} onPress={onEdit}>
        <Text
          style={[
            styles.title,
            { color: theme.text, textDecorationLine: todo.completed ? 'line-through' : 'none', opacity: todo.completed ? 0.55 : 1 },
          ]}
        >
          {todo.title}
        </Text>
        {!!todo.notes && <Text style={{ color: theme.muted }} numberOfLines={2}>{todo.notes}</Text>}
        <View style={styles.meta}>
          <Text style={[styles.badge, { color: priorityColor[todo.priority] }]}>{todo.priority.toUpperCase()}</Text>
          <Text style={{ color: theme.muted }}>{todo.category}</Text>
          {todo.dueAt && <Text style={{ color: overdue ? theme.danger : theme.muted }}>{overdue ? 'Overdue · ' : ''}{formatDateTime(todo.dueAt)}</Text>}
          {todo.pomodorosCompleted > 0 && <Text style={{ color: theme.muted }}>◎ {todo.pomodorosCompleted}</Text>}
        </View>
      </Pressable>
      <Pressable onPress={onDelete} hitSlop={8}>
        <Text style={{ color: theme.danger, fontWeight: '700' }}>Delete</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 12, borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 10, alignItems: 'flex-start' },
  check: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  body: { flex: 1, gap: 4 },
  title: { fontSize: 16, fontWeight: '700' },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 2 },
  badge: { fontWeight: '800', fontSize: 12 },
});
