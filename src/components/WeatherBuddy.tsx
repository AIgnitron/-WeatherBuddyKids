import React, { memo, useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import type { AppTheme } from '../theme/theme';
import type { WeatherThemeKey } from '../types';
import { tapHaptic } from '../utils/haptics';

type Props = {
  theme: AppTheme;
  themeKey: WeatherThemeKey;
  onTap?: () => void;
};

export const WeatherBuddy = memo(({ theme, themeKey, onTap }: Props) => {
  const idle = useSharedValue(0);
  const blink = useSharedValue(0);
  const react = useSharedValue(0);

  useEffect(() => {
    idle.value = 0;
    blink.value = 0;

    if (themeKey === 'sunny') {
      idle.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }), -1, true);
    } else if (themeKey === 'rain') {
      idle.value = withRepeat(withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) }), -1, true);
    } else if (themeKey === 'snow') {
      idle.value = withRepeat(withTiming(1, { duration: 260, easing: Easing.linear }), -1, true);
    } else if (themeKey === 'wind') {
      idle.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) }), -1, true);
    } else if (themeKey === 'night') {
      // slow drift + blinking
      idle.value = withRepeat(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.quad) }), -1, true);
      blink.value = withRepeat(withDelay(900, withTiming(1, { duration: 140, easing: Easing.linear })), -1, true);
    } else {
      idle.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.quad) }), -1, true);
    }
  }, [themeKey, idle, blink]);

  const buddyStyle = useAnimatedStyle(() => {
    const bounce = interpolate(idle.value, [0, 1], [0, -10]);
    const wobble = interpolate(idle.value, [0, 1], [-6, 6]);
    const shiver = interpolate(idle.value, [0, 1], [-4, 4]);
    const sway = interpolate(idle.value, [0, 1], [-8, 8]);

    const base = (() => {
      switch (themeKey) {
        case 'sunny':
          return { y: bounce, r: 0, x: 0 };
        case 'rain':
          return { y: 0, r: wobble, x: 0 };
        case 'snow':
          return { y: 0, r: 0, x: shiver };
        case 'wind':
          return { y: 0, r: sway, x: 0 };
        case 'night':
          return { y: interpolate(idle.value, [0, 1], [0, 6]), r: 0, x: 0 };
        default:
          return { y: interpolate(idle.value, [0, 1], [0, -4]), r: 0, x: 0 };
      }
    })();

    const pop = interpolate(react.value, [0, 1], [1, 1.08]);

    return {
      transform: [
        { translateX: base.x },
        { translateY: base.y },
        { rotate: `${base.r}deg` },
        { scale: pop }
      ]
    };
  });

  const eyeStyle = useAnimatedStyle(() => {
    const closed = themeKey === 'night' ? blink.value : 0;
    const h = interpolate(closed, [0, 1], [10, 2]);
    return { height: h };
  });

  const accessory = useMemo(() => {
    switch (themeKey) {
      case 'sunny':
        return { top: '🕶️', side: '✨' };
      case 'rain':
        return { top: '☂️', side: '💧' };
      case 'snow':
        return { top: '🧣', side: '❄️' };
      case 'wind':
        return { top: '🧢', side: '🍃' };
      case 'night':
        return { top: '🧙‍♂️', side: '💤' };
      default:
        return { top: '😊', side: '☁️' };
    }
  }, [themeKey]);

  return (
    <Pressable
      onPress={async () => {
        await tapHaptic();
        react.value = withSequence(
          withTiming(1, { duration: 120, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 220, easing: Easing.inOut(Easing.quad) })
        );
        onTap?.();
      }}
      accessibilityRole="button"
      accessibilityLabel="Tap Buddy"
      hitSlop={14}
    >
      <Animated.View style={[styles.wrap, buddyStyle]}>
        <View style={[styles.glow, { backgroundColor: theme.accent }]} />

        <View style={[styles.body, { backgroundColor: theme.card, borderColor: theme.outline }]}
        >
          {/* face */}
          <View style={styles.faceRow}>
            <Animated.View style={[styles.eye, eyeStyle, { backgroundColor: theme.text }]} />
            <Animated.View style={[styles.eye, eyeStyle, { backgroundColor: theme.text }]} />
          </View>
          <View style={[styles.mouth, { borderColor: theme.text }]} />

          {/* accessories */}
          <Text style={styles.topAcc}>{accessory.top}</Text>
          <Text style={styles.sideAcc}>{accessory.side}</Text>

          {themeKey === 'sunny' && <View style={styles.sunglasses} />}
          {themeKey === 'wind' && (
            <View style={styles.hairLines}>
              <View style={[styles.hairLine, { backgroundColor: theme.text }]} />
              <View style={[styles.hairLine, { backgroundColor: theme.text, width: 28 }]} />
            </View>
          )}
        </View>

        <View style={[styles.feetRow]}>
          <View style={[styles.foot, { backgroundColor: theme.cardAlt, borderColor: theme.outline }]} />
          <View style={[styles.foot, { backgroundColor: theme.cardAlt, borderColor: theme.outline }]} />
        </View>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  glow: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    opacity: 0.18
  },
  body: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center'
  },
  faceRow: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 10
  },
  eye: {
    width: 14,
    borderRadius: 7
  },
  mouth: {
    width: 34,
    height: 18,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: 14
  },
  topAcc: {
    position: 'absolute',
    top: -14,
    fontSize: 34
  },
  sideAcc: {
    position: 'absolute',
    right: -12,
    top: 38,
    fontSize: 22
  },
  sunglasses: {
    position: 'absolute',
    top: 74,
    width: 78,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(17,24,39,0.85)'
  },
  hairLines: {
    position: 'absolute',
    top: 44,
    left: 30
  },
  hairLine: {
    height: 4,
    width: 22,
    borderRadius: 4,
    opacity: 0.5,
    marginBottom: 6
  },
  feetRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10
  },
  foot: {
    width: 38,
    height: 18,
    borderRadius: 12,
    borderWidth: 2
  }
});
