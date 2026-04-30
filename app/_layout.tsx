import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { initDB } from '../database';

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return;

  const tokenData = await Notifications.getExpoPushTokenAsync();
  return tokenData.data;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

useEffect(() => {
  initDB();

  async function setupPush() {
    const token = await registerForPushNotificationsAsync(); // Asks user for permission, returns a unique ID for device.

    if (token) {
      console.log("Expo token:", token); // Essentially address of the phone for notifications.
    }
  }

  setupPush();
}, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerBackTitle: 'Home', // 👈 )
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen name="chat/[id]" options={{ title: 'Chat' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}