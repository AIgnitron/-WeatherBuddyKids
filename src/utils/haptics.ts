import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export async function tapHaptic() {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.selectionAsync();
  } catch {
    // ignore
  }
}

export async function successHaptic() {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // ignore
  }
}
