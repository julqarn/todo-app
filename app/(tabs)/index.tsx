import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';

export default function TodosScreen() {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Todos</Text>
      <Text style={{ color: theme.muted }}>Your tasks will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
});
