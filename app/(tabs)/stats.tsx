import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';

export default function StatsScreen() {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Stats</Text>
      <Text style={{ color: theme.muted }}>Your progress at a glance.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
});
