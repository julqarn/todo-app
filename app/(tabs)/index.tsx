import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Chip } from '@/components/Chip';
import { TodoCard } from '@/components/TodoCard';
import { TodoFormModal } from '@/components/TodoFormModal';
import { filterTodos, type TodoFilter } from '@/lib/date';
import type { Todo } from '@/lib/types';
import { useAppStore, type TodoInput } from '@/store/useAppStore';
import { useTheme } from '@/theme';

const FILTERS: { key: TodoFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'high', label: 'High priority' },
  { key: 'completed', label: 'Completed' },
];

export default function TodosScreen() {
  const themeMode = useAppStore((s) => s.themeMode);
  const theme = useTheme(themeMode);
  const todos = useAppStore((s) => s.todos);
  const addTodo = useAppStore((s) => s.addTodo);
  const updateTodo = useAppStore((s) => s.updateTodo);
  const toggleTodo = useAppStore((s) => s.toggleTodo);
  const deleteTodo = useAppStore((s) => s.deleteTodo);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Todo | null>(null);

  const visible = useMemo(() => filterTodos(todos, filter, query), [todos, filter, query]);
  const openCount = todos.filter((t) => !t.completed).length;
  const doneCount = todos.length - openCount;

  const openNew = () => {
    setEditing(null);
    setFormVisible(true);
  };

  const openEdit = (todo: Todo) => {
    setEditing(todo);
    setFormVisible(true);
  };

  const save = async (input: TodoInput) => {
    if (editing) await updateTodo(editing.id, input);
    else await addTodo(input);
  };

  const confirmDelete = (todo: Todo) => {
    Alert.alert('Delete todo?', `“${todo.title}” will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTodo(todo.id) },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Todos</Text>
      <Text style={{ color: theme.muted }}>{openCount} open · {doneCount} completed</Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search todos…"
        placeholderTextColor={theme.muted}
        style={[styles.search, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
      />

      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Chip key={f.key} label={f.label} selected={filter === f.key} theme={theme} onPress={() => setFilter(f.key)} />
        ))}
      </View>

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={[styles.empty, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Nothing here yet</Text>
            <Text style={{ color: theme.muted }}>Add your first todo, set a due date and a reminder alarm, then start a focus session.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TodoCard
            todo={item}
            theme={theme}
            onToggle={() => toggleTodo(item.id)}
            onEdit={() => openEdit(item)}
            onDelete={() => confirmDelete(item)}
          />
        )}
      />

      <Pressable onPress={openNew} style={[styles.addButton, { backgroundColor: theme.accent }]}>
        <Text style={{ color: theme.accentText, fontWeight: '800', fontSize: 16 }}>+ New todo</Text>
      </Pressable>

      <TodoFormModal visible={formVisible} theme={theme} initial={editing} onClose={() => setFormVisible(false)} onSave={save} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56 },
  title: { fontSize: 28, fontWeight: '800' },
  search: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, marginTop: 14 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 12 },
  list: { paddingBottom: 90 },
  empty: { borderWidth: 1, borderRadius: 16, padding: 18, gap: 6 },
  emptyTitle: { fontSize: 17, fontWeight: '800' },
  addButton: { position: 'absolute', right: 20, bottom: 24, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 13 },
});
