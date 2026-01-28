import { Audio } from 'expo-av';
import { Platform } from 'react-native';

// Sound URLs - using free sound effects
const SOUNDS = {
  tap: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // soft pop
  success: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', // success chime
  refresh: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // whoosh
  toggle: 'https://assets.mixkit.co/active_storage/sfx/2205/2205-preview.mp3', // click
  error: 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3', // soft error
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
      { uri: SOUNDS[key] },
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
