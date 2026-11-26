import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';

export default function AlarmsScreen() {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Alarms</Text>
      <Text style={{ color: theme.muted }}>Modern alarm system.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
});
