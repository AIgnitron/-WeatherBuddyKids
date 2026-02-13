import { Platform } from 'react-native';
// NOTE: this is loaded dynamically so the project still typechecks
// even if expo-notifications hasn't been installed yet.
// Install with: `npx expo install expo-notifications`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Notifications: any | null = null;

function getNotifications(): any | null {
  if (Notifications) return Notifications;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Notifications = require('expo-notifications');
    return Notifications;
  } catch {
    return null;
  }
}

export type NotifyOptions = {
  title: string;
  body: string;
  soundEnabled: boolean;
};

export type DailyReminderConfig = {
  hour: number; // 0-23
  minute: number; // 0-59
  soundEnabled: boolean;
};

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

/**
 * Request notification permission from the user.
 * Returns the status after the request.
 */
export async function requestNotificationPermission(): Promise<PermissionStatus> {
  if (Platform.OS === 'web') return 'denied';
  
  const N = getNotifications();
  if (!N) return 'denied';
  
  try {
    const { status: existingStatus } = await N.getPermissionsAsync();
    if (existingStatus === 'granted') return 'granted';
    
    const { status } = await N.requestPermissionsAsync();
    return status as PermissionStatus;
  } catch {
    return 'denied';
  }
}

/**
 * Check current notification permission status without requesting.
 */
export async function getNotificationPermissionStatus(): Promise<PermissionStatus> {
  if (Platform.OS === 'web') return 'denied';
  
  const N = getNotifications();
  if (!N) return 'denied';
  
  try {
    const { status } = await N.getPermissionsAsync();
    return status as PermissionStatus;
  } catch {
    return 'denied';
  }
}

export async function ensureNotificationsReady(): Promise<void> {
  if (Platform.OS === 'web') return;

  const N = getNotifications();
  if (!N) return;

  N.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowAlert: true
    })
  });

  const settings = await N.getPermissionsAsync();
  if (!settings.granted) {
    await N.requestPermissionsAsync();
  }

  if (Platform.OS === 'android') {
    await N.setNotificationChannelAsync('alerts', {
      name: 'Weather Buddy Alerts',
      importance: N.AndroidImportance.HIGH,
      vibrationPattern: [0, 200, 80, 200],
      lightColor: '#FFB703'
    });
  }
}

export async function fireLocalNotification(opts: NotifyOptions): Promise<void> {
  if (Platform.OS === 'web') return;

  const N = getNotifications();
  if (!N) return;

  await N.scheduleNotificationAsync({
    content: {
      title: opts.title,
      body: opts.body,
      sound: opts.soundEnabled ? 'standard.wav' : null
    },
    trigger: null
  });
}

export async function scheduleDailyReminder(config: DailyReminderConfig): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  const N = getNotifications();
  if (!N) return null;

  try {
    // Ensure notification channel exists on Android
    if (Platform.OS === 'android') {
      await N.setNotificationChannelAsync('daily-reminder', {
        name: 'Daily Reminder',
        importance: N.AndroidImportance.HIGH,
        vibrationPattern: [0, 200, 80, 200],
        lightColor: '#FFB703'
      });
    }

    const id = await N.scheduleNotificationAsync({
      content: {
        title: 'Weather Buddy time!',
        body: 'Tap me to see todays kid-friendly forecast!',
        sound: config.soundEnabled ? 'standard.wav' : null,
        ...(Platform.OS === 'android' && { channelId: 'daily-reminder' })
      },
      trigger: {
        type: 'daily',
        hour: config.hour,
        minute: config.minute
      }
    });

    console.log('[DailyReminder] Scheduled with id:', id, 'at', config.hour, ':', config.minute);
    return id;
  } catch (err) {
    console.error('[DailyReminder] Failed to schedule:', err);
    return null;
  }
}

export async function cancelScheduledNotification(id: string | null | undefined): Promise<void> {
  if (!id) return;
  if (Platform.OS === 'web') return;
  const N = getNotifications();
  if (!N) return;
  try {
    await N.cancelScheduledNotificationAsync(id);
  } catch {
    // ignore
  }
}

/**
 * Cancel all scheduled notifications (useful for clearing daily reminders).
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;
  const N = getNotifications();
  if (!N) return;
  try {
    await N.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignore
  }
}
