import type { Priority, Todo } from './types';

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export function formatTime(hour: number, minute: number): string {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

export function formatDateTime(ts: number | null): string {
  if (!ts) return 'No date';
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDate(ts: number | null): string {
  if (!ts) return 'No date';
  return new Date(ts).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function isToday(ts: number | null): boolean {
  if (!ts) return false;
  const d = new Date(ts);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export function isOverdue(todo: Todo): boolean {
  return !todo.completed && todo.dueAt !== null && todo.dueAt < Date.now();
}

export function priorityWeight(priority: Priority): number {
  if (priority === 'high') return 0;
  if (priority === 'medium') return 1;
  return 2;
}

export function sortTodos(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const dueA = a.dueAt ?? Number.MAX_SAFE_INTEGER;
    const dueB = b.dueAt ?? Number.MAX_SAFE_INTEGER;
    if (dueA !== dueB) return dueA - dueB;
    const pw = priorityWeight(a.priority) - priorityWeight(b.priority);
    if (pw !== 0) return pw;
    return b.createdAt - a.createdAt;
  });
}

export type TodoFilter = 'all' | 'today' | 'upcoming' | 'completed' | 'high';

export function filterTodos(todos: Todo[], filter: TodoFilter, query: string): Todo[] {
  const q = query.trim().toLowerCase();
  const now = Date.now();
  return sortTodos(
    todos.filter((todo) => {
      if (q && !`${todo.title} ${todo.notes} ${todo.category}`.toLowerCase().includes(q)) return false;
      switch (filter) {
        case 'today':
          return !todo.completed && isToday(todo.dueAt);
        case 'upcoming':
          return !todo.completed && todo.dueAt !== null && todo.dueAt >= now;
        case 'completed':
          return todo.completed;
        case 'high':
          return !todo.completed && todo.priority === 'high';
        default:
          return true;
      }
    }),
  );
}

export function nextAlarmDate(hour: number, minute: number, from = new Date()): Date {
  const next = new Date(from);
  next.setHours(hour, minute, 0, 0);
  if (next.getTime() <= from.getTime()) next.setDate(next.getDate() + 1);
  return next;
}

export function repeatLabel(days: number[]): string {
  if (days.length === 0) return 'Once';
  if (days.length === 7) return 'Every day';
  const weekdays = [1, 2, 3, 4, 5];
  if (weekdays.every((d) => days.includes(d)) && days.length === 5) return 'Weekdays';
  return [...days].sort((a, b) => a - b).map((d) => DAY_LABELS[d]).join(', ');
}
