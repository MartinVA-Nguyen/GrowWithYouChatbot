import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
/*
import { initDB } from '../database';
import { supabase } from '@/lib/supabase';
import * as Device from 'expo-device';


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


async function savePushToken(token: string) {
  const user = await supabase.auth.getUser();

  const userId = user.data.user?.id;

  const { error } = await supabase.from('push_tokens').upsert({
    user_id: userId,
    token,
    platform: Device.osName,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.log('Error saving token:', error.message);
  }
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

useEffect(() => {
  initDB();

  async function setupPush() {
    // Code to set up personalized notifications.
    const token = await registerForPushNotificationsAsync(); // Asks user for permission, returns a unique ID for device.

    if (token) {
      console.log("Expo token:", token); // Essentially address of the phone for notifications.
      await savePushToken(token); // Saves it to Supabase.
    }
  }
  setupPush();
}, []);*/

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    //initDB();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerBackTitle: 'Home',
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Chatbot' }} />
        <Stack.Screen name="chat/[id]" options={{ title: 'Chat' }} />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}