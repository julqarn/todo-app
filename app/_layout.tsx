import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { configureNotifications } from '@/lib/notifications';
import { useAppStore } from '@/store/useAppStore';

export default function RootLayout() {
  useEffect(() => {
    configureNotifications().catch(() => undefined);

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as
        | { type?: string; alarmId?: string }
        | undefined;
      if (response.actionIdentifier === 'snooze' && data?.type === 'alarm' && data.alarmId) {
        useAppStore.getState().snoozeAlarm(data.alarmId).catch(() => undefined);
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
