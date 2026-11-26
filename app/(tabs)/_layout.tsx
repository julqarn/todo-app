import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useTheme } from '@/theme';

function TabIcon({ label }: { label: string }) {
  return <Text style={{ fontSize: 20 }}>{label}</Text>;
}

export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Todos', tabBarIcon: () => <TabIcon label="✓" /> }}
      />
      <Tabs.Screen
        name="focus"
        options={{ title: 'Focus', tabBarIcon: () => <TabIcon label="◎" /> }}
      />
      <Tabs.Screen
        name="alarms"
        options={{ title: 'Alarms', tabBarIcon: () => <TabIcon label="⏰" /> }}
      />
      <Tabs.Screen
        name="stats"
        options={{ title: 'Stats', tabBarIcon: () => <TabIcon label="▦" /> }}
      />
    </Tabs>
  );
}
