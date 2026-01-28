import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { playTapSound, playSuccessSound, playToggleSound, playRefreshSound, playErrorSound } from './sounds';

export async function tapHaptic() {
  if (Platform.OS === 'web') return;
  try {
    await Promise.all([
      Haptics.selectionAsync(),
      playTapSound()
    ]);
  } catch {
    // ignore
  }
}

export async function successHaptic() {
  if (Platform.OS === 'web') return;
  try {
    await Promise.all([
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
      playSuccessSound()
    ]);
  } catch {
    // ignore
  }
}

export async function toggleHaptic() {
  if (Platform.OS === 'web') return;
  try {
    await Promise.all([
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
      playToggleSound()
    ]);
  } catch {
    // ignore
  }
}

export async function refreshHaptic() {
  if (Platform.OS === 'web') return;
  try {
    await Promise.all([
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
      playRefreshSound()
    ]);
  } catch {
    // ignore
  }
}

export async function errorHaptic() {
  if (Platform.OS === 'web') return;
  try {
    await Promise.all([
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
      playErrorSound()
    ]);
  } catch {
    // ignore
  }
}
