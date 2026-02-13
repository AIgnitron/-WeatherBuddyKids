import { Audio } from 'expo-av';
import { Platform } from 'react-native';

// Standard sound - using local asset
const STANDARD_SOUND = require('../../assets/sounds/standard.wav');

const SOUNDS = {
  tap: STANDARD_SOUND,
  success: STANDARD_SOUND,
  refresh: STANDARD_SOUND,
  toggle: STANDARD_SOUND,
  error: STANDARD_SOUND,
};

let soundEnabled = true;

export const setSoundEnabled = async (enabled: boolean) => {
  soundEnabled = enabled;
  // If disabling, stop all currently playing sounds
  if (!enabled) {
    await stopAllSounds();
  }
};

export const getSoundEnabled = () => soundEnabled;

// Stop all currently playing sounds
export async function stopAllSounds() {
  try {
    const sounds = Object.values(soundCache);
    await Promise.all(
      sounds.map(async (sound) => {
        if (sound) {
          await sound.stopAsync();
        }
      })
    );
  } catch {
    // Ignore errors
  }
}

const soundCache: { [key: string]: Audio.Sound | null } = {};

async function loadSound(key: keyof typeof SOUNDS): Promise<Audio.Sound | null> {
  if (Platform.OS === 'web') return null;
  
  try {
    if (soundCache[key]) {
      return soundCache[key];
    }
    
    const { sound } = await Audio.Sound.createAsync(
      SOUNDS[key],
      { shouldPlay: false, volume: 0.5 }
    );
    soundCache[key] = sound;
    return sound;
  } catch {
    return null;
  }
}

async function playSound(key: keyof typeof SOUNDS) {
  if (!soundEnabled || Platform.OS === 'web') return;
  
  try {
    const sound = await loadSound(key);
    if (sound) {
      await sound.setPositionAsync(0);
      await sound.playAsync();
    }
  } catch {
    // Silently fail - sound is non-essential
  }
}

export async function playTapSound() {
  await playSound('tap');
}

export async function playSuccessSound() {
  await playSound('success');
}

export async function playRefreshSound() {
  await playSound('refresh');
}

export async function playToggleSound() {
  await playSound('toggle');
}

export async function playErrorSound() {
  await playSound('error');
}

// Preload common sounds for faster playback
export async function preloadSounds() {
  if (Platform.OS === 'web') return;
  
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
      staysActiveInBackground: false,
    });
    
    // Preload frequently used sounds
    await Promise.all([
      loadSound('tap'),
      loadSound('toggle'),
      loadSound('success'),
    ]);
  } catch {
    // Ignore errors during preload
  }
}

// Cleanup sounds when app is closing
export async function unloadSounds() {
  try {
    const sounds = Object.values(soundCache);
    await Promise.all(
      sounds.map(async (sound) => {
        if (sound) {
          await sound.unloadAsync();
        }
      })
    );
  } catch {
    // Ignore cleanup errors
  }
}
