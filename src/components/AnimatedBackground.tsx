import React, { memo, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';
import type { WeatherThemeKey } from '../types';
import type { AppTheme } from '../theme/theme';

const { width, height } = Dimensions.get('window');

type Props = {
  themeKey: WeatherThemeKey;
  theme: AppTheme;
};

export const AnimatedBackground = memo(({ themeKey, theme }: Props) => {
  const p = useSharedValue(0);
  const s = useSharedValue(0);

  // precompute positions (stable) - must be before styles that use them
  const drops = useMemo(() => Array.from({ length: 14 }).map((_, i) => ({
    offset: i * 0.07,
    x: (i % 7) * (width / 7) + 16
  })), []);

  const flakes = useMemo(() => Array.from({ length: 16 }).map((_, i) => ({
    offset: i * 0.06,
    x: (i % 8) * (width / 8) + 10
  })), []);

  const stars = useMemo(() => Array.from({ length: 16 }).map((_, i) => ({
    offset: i * 0.09,
    x: (i % 8) * (width / 8) + 10,
    y: 30 + Math.floor(i / 8) * 60
  })), []);

  React.useEffect(() => {
    p.value = withRepeat(withTiming(1, { duration: 9000, easing: Easing.linear }), -1, false);
    s.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [p, s]);

  const sunStyle = useAnimatedStyle(() => {
    const scale = 1 + 0.06 * s.value;
    return { transform: [{ scale }] };
  });

  // Create all animated styles unconditionally to avoid hook order issues
  const cloudStyle1 = useAnimatedStyle(() => {
    const x = ((p.value + 0.1) % 1) * (width + 180) - 90;
    const y = 80 + 30 * Math.sin((p.value + 0.1) * Math.PI * 2);
    return { transform: [{ translateX: x }, { translateY: y }] };
  });
  
  const cloudStyle2 = useAnimatedStyle(() => {
    const x = ((p.value + 0.55) % 1) * (width + 180) - 90;
    const y = 80 + 30 * Math.sin((p.value + 0.55) * Math.PI * 2);
    return { transform: [{ translateX: x }, { translateY: y }] };
  });
  
  const cloudStyle3 = useAnimatedStyle(() => {
    const x = ((p.value + 0.12) % 1) * (width + 180) - 90;
    const y = 80 + 30 * Math.sin((p.value + 0.12) * Math.PI * 2);
    return { transform: [{ translateX: x }, { translateY: y }] };
  });
  
  const cloudStyle4 = useAnimatedStyle(() => {
    const x = ((p.value + 0.45) % 1) * (width + 180) - 90;
    const y = 80 + 30 * Math.sin((p.value + 0.45) * Math.PI * 2);
    return { transform: [{ translateX: x }, { translateY: y }] };
  });
  
  const cloudStyle5 = useAnimatedStyle(() => {
    const x = ((p.value + 0.72) % 1) * (width + 180) - 90;
    const y = 80 + 30 * Math.sin((p.value + 0.72) * Math.PI * 2);
    return { transform: [{ translateX: x }, { translateY: y }] };
  });
  
  const cloudDarkStyle1 = useAnimatedStyle(() => {
    const x = ((p.value + 0.2) % 1) * (width + 180) - 90;
    const y = 80 + 30 * Math.sin((p.value + 0.2) * Math.PI * 2);
    return { transform: [{ translateX: x }, { translateY: y }] };
  });
  
  const cloudDarkStyle2 = useAnimatedStyle(() => {
    const x = ((p.value + 0.6) % 1) * (width + 180) - 90;
    const y = 80 + 30 * Math.sin((p.value + 0.6) * Math.PI * 2);
    return { transform: [{ translateX: x }, { translateY: y }] };
  });
  
  const cloudSmallStyle1 = useAnimatedStyle(() => {
    const x = ((p.value + 0.15) % 1) * (width + 180) - 90;
    const y = 80 + 30 * Math.sin((p.value + 0.15) * Math.PI * 2);
    return { transform: [{ translateX: x }, { translateY: y }] };
  });
  
  const cloudSmallStyle2 = useAnimatedStyle(() => {
    const x = ((p.value + 0.58) % 1) * (width + 180) - 90;
    const y = 80 + 30 * Math.sin((p.value + 0.58) * Math.PI * 2);
    return { transform: [{ translateX: x }, { translateY: y }] };
  });

  // Rain styles - create all 14 unconditionally
  const rainStyle0 = useAnimatedStyle(() => {
    const t = (p.value + drops[0].offset) % 1;
    const y = t * (height * 0.7) + 120;
    const o = interpolate(t, [0, 0.1, 0.9, 1], [0, 0.9, 0.9, 0]);
    return { opacity: o, transform: [{ translateX: drops[0].x }, { translateY: y }] };
  });
  const rainStyle1 = useAnimatedStyle(() => {
    const t = (p.value + drops[1].offset) % 1;
    const y = t * (height * 0.7) + 120;
    const o = interpolate(t, [0, 0.1, 0.9, 1], [0, 0.9, 0.9, 0]);
    return { opacity: o, transform: [{ translateX: drops[1].x }, { translateY: y }] };
  });
  const rainStyle2 = useAnimatedStyle(() => {
    const t = (p.value + drops[2].offset) % 1;
    const y = t * (height * 0.7) + 120;
    const o = interpolate(t, [0, 0.1, 0.9, 1], [0, 0.9, 0.9, 0]);
    return { opacity: o, transform: [{ translateX: drops[2].x }, { translateY: y }] };
  });
  const rainStyle3 = useAnimatedStyle(() => {
    const t = (p.value + drops[3].offset) % 1;
    const y = t * (height * 0.7) + 120;
    const o = interpolate(t, [0, 0.1, 0.9, 1], [0, 0.9, 0.9, 0]);
    return { opacity: o, transform: [{ translateX: drops[3].x }, { translateY: y }] };
  });
  const rainStyle4 = useAnimatedStyle(() => {
    const t = (p.value + drops[4].offset) % 1;
    const y = t * (height * 0.7) + 120;
    const o = interpolate(t, [0, 0.1, 0.9, 1], [0, 0.9, 0.9, 0]);
    return { opacity: o, transform: [{ translateX: drops[4].x }, { translateY: y }] };
  });
  const rainStyle5 = useAnimatedStyle(() => {
    const t = (p.value + drops[5].offset) % 1;
    const y = t * (height * 0.7) + 120;
    const o = interpolate(t, [0, 0.1, 0.9, 1], [0, 0.9, 0.9, 0]);
    return { opacity: o, transform: [{ translateX: drops[5].x }, { translateY: y }] };
  });
  const rainStyle6 = useAnimatedStyle(() => {
    const t = (p.value + drops[6].offset) % 1;
    const y = t * (height * 0.7) + 120;
    const o = interpolate(t, [0, 0.1, 0.9, 1], [0, 0.9, 0.9, 0]);
    return { opacity: o, transform: [{ translateX: drops[6].x }, { translateY: y }] };
  });
  const rainStyle7 = useAnimatedStyle(() => {
    const t = (p.value + drops[7].offset) % 1;
    const y = t * (height * 0.7) + 120;
    const o = interpolate(t, [0, 0.1, 0.9, 1], [0, 0.9, 0.9, 0]);
    return { opacity: o, transform: [{ translateX: drops[7].x }, { translateY: y }] };
  });
  const rainStyle8 = useAnimatedStyle(() => {
    const t = (p.value + drops[8].offset) % 1;
    const y = t * (height * 0.7) + 120;
    const o = interpolate(t, [0, 0.1, 0.9, 1], [0, 0.9, 0.9, 0]);
    return { opacity: o, transform: [{ translateX: drops[8].x }, { translateY: y }] };
  });
  const rainStyle9 = useAnimatedStyle(() => {
    const t = (p.value + drops[9].offset) % 1;
    const y = t * (height * 0.7) + 120;
    const o = interpolate(t, [0, 0.1, 0.9, 1], [0, 0.9, 0.9, 0]);
    return { opacity: o, transform: [{ translateX: drops[9].x }, { translateY: y }] };
  });
  const rainStyle10 = useAnimatedStyle(() => {
    const t = (p.value + drops[10].offset) % 1;
    const y = t * (height * 0.7) + 120;
    const o = interpolate(t, [0, 0.1, 0.9, 1], [0, 0.9, 0.9, 0]);
    return { opacity: o, transform: [{ translateX: drops[10].x }, { translateY: y }] };
  });
  const rainStyle11 = useAnimatedStyle(() => {
    const t = (p.value + drops[11].offset) % 1;
    const y = t * (height * 0.7) + 120;
    const o = interpolate(t, [0, 0.1, 0.9, 1], [0, 0.9, 0.9, 0]);
    return { opacity: o, transform: [{ translateX: drops[11].x }, { translateY: y }] };
  });
  const rainStyle12 = useAnimatedStyle(() => {
    const t = (p.value + drops[12].offset) % 1;
    const y = t * (height * 0.7) + 120;
    const o = interpolate(t, [0, 0.1, 0.9, 1], [0, 0.9, 0.9, 0]);
    return { opacity: o, transform: [{ translateX: drops[12].x }, { translateY: y }] };
  });
  const rainStyle13 = useAnimatedStyle(() => {
    const t = (p.value + drops[13].offset) % 1;
    const y = t * (height * 0.7) + 120;
    const o = interpolate(t, [0, 0.1, 0.9, 1], [0, 0.9, 0.9, 0]);
    return { opacity: o, transform: [{ translateX: drops[13].x }, { translateY: y }] };
  });
  const rainStyles = [rainStyle0, rainStyle1, rainStyle2, rainStyle3, rainStyle4, rainStyle5, rainStyle6, rainStyle7, rainStyle8, rainStyle9, rainStyle10, rainStyle11, rainStyle12, rainStyle13];

  // Snow styles - create all 16 unconditionally
  const snowStyle0 = useAnimatedStyle(() => {
    const t = (p.value + flakes[0].offset) % 1;
    const y = t * (height * 0.65) + 120;
    const sway = 12 * Math.sin((t + flakes[0].offset) * Math.PI * 2);
    const o = interpolate(t, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
    return { opacity: o, transform: [{ translateX: flakes[0].x + sway }, { translateY: y }] };
  });
  const snowStyle1 = useAnimatedStyle(() => {
    const t = (p.value + flakes[1].offset) % 1;
    const y = t * (height * 0.65) + 120;
    const sway = 12 * Math.sin((t + flakes[1].offset) * Math.PI * 2);
    const o = interpolate(t, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
    return { opacity: o, transform: [{ translateX: flakes[1].x + sway }, { translateY: y }] };
  });
  const snowStyle2 = useAnimatedStyle(() => {
    const t = (p.value + flakes[2].offset) % 1;
    const y = t * (height * 0.65) + 120;
    const sway = 12 * Math.sin((t + flakes[2].offset) * Math.PI * 2);
    const o = interpolate(t, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
    return { opacity: o, transform: [{ translateX: flakes[2].x + sway }, { translateY: y }] };
  });
  const snowStyle3 = useAnimatedStyle(() => {
    const t = (p.value + flakes[3].offset) % 1;
    const y = t * (height * 0.65) + 120;
    const sway = 12 * Math.sin((t + flakes[3].offset) * Math.PI * 2);
    const o = interpolate(t, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
    return { opacity: o, transform: [{ translateX: flakes[3].x + sway }, { translateY: y }] };
  });
  const snowStyle4 = useAnimatedStyle(() => {
    const t = (p.value + flakes[4].offset) % 1;
    const y = t * (height * 0.65) + 120;
    const sway = 12 * Math.sin((t + flakes[4].offset) * Math.PI * 2);
    const o = interpolate(t, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
    return { opacity: o, transform: [{ translateX: flakes[4].x + sway }, { translateY: y }] };
  });
  const snowStyle5 = useAnimatedStyle(() => {
    const t = (p.value + flakes[5].offset) % 1;
    const y = t * (height * 0.65) + 120;
    const sway = 12 * Math.sin((t + flakes[5].offset) * Math.PI * 2);
    const o = interpolate(t, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
    return { opacity: o, transform: [{ translateX: flakes[5].x + sway }, { translateY: y }] };
  });
  const snowStyle6 = useAnimatedStyle(() => {
    const t = (p.value + flakes[6].offset) % 1;
    const y = t * (height * 0.65) + 120;
    const sway = 12 * Math.sin((t + flakes[6].offset) * Math.PI * 2);
    const o = interpolate(t, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
    return { opacity: o, transform: [{ translateX: flakes[6].x + sway }, { translateY: y }] };
  });
  const snowStyle7 = useAnimatedStyle(() => {
    const t = (p.value + flakes[7].offset) % 1;
    const y = t * (height * 0.65) + 120;
    const sway = 12 * Math.sin((t + flakes[7].offset) * Math.PI * 2);
    const o = interpolate(t, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
    return { opacity: o, transform: [{ translateX: flakes[7].x + sway }, { translateY: y }] };
  });
  const snowStyle8 = useAnimatedStyle(() => {
    const t = (p.value + flakes[8].offset) % 1;
    const y = t * (height * 0.65) + 120;
    const sway = 12 * Math.sin((t + flakes[8].offset) * Math.PI * 2);
    const o = interpolate(t, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
    return { opacity: o, transform: [{ translateX: flakes[8].x + sway }, { translateY: y }] };
  });
  const snowStyle9 = useAnimatedStyle(() => {
    const t = (p.value + flakes[9].offset) % 1;
    const y = t * (height * 0.65) + 120;
    const sway = 12 * Math.sin((t + flakes[9].offset) * Math.PI * 2);
    const o = interpolate(t, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
    return { opacity: o, transform: [{ translateX: flakes[9].x + sway }, { translateY: y }] };
  });
  const snowStyle10 = useAnimatedStyle(() => {
    const t = (p.value + flakes[10].offset) % 1;
    const y = t * (height * 0.65) + 120;
    const sway = 12 * Math.sin((t + flakes[10].offset) * Math.PI * 2);
    const o = interpolate(t, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
    return { opacity: o, transform: [{ translateX: flakes[10].x + sway }, { translateY: y }] };
  });
  const snowStyle11 = useAnimatedStyle(() => {
    const t = (p.value + flakes[11].offset) % 1;
    const y = t * (height * 0.65) + 120;
    const sway = 12 * Math.sin((t + flakes[11].offset) * Math.PI * 2);
    const o = interpolate(t, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
    return { opacity: o, transform: [{ translateX: flakes[11].x + sway }, { translateY: y }] };
  });
  const snowStyle12 = useAnimatedStyle(() => {
    const t = (p.value + flakes[12].offset) % 1;
    const y = t * (height * 0.65) + 120;
    const sway = 12 * Math.sin((t + flakes[12].offset) * Math.PI * 2);
    const o = interpolate(t, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
    return { opacity: o, transform: [{ translateX: flakes[12].x + sway }, { translateY: y }] };
  });
  const snowStyle13 = useAnimatedStyle(() => {
    const t = (p.value + flakes[13].offset) % 1;
    const y = t * (height * 0.65) + 120;
    const sway = 12 * Math.sin((t + flakes[13].offset) * Math.PI * 2);
    const o = interpolate(t, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
    return { opacity: o, transform: [{ translateX: flakes[13].x + sway }, { translateY: y }] };
  });
  const snowStyle14 = useAnimatedStyle(() => {
    const t = (p.value + flakes[14].offset) % 1;
    const y = t * (height * 0.65) + 120;
    const sway = 12 * Math.sin((t + flakes[14].offset) * Math.PI * 2);
    const o = interpolate(t, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
    return { opacity: o, transform: [{ translateX: flakes[14].x + sway }, { translateY: y }] };
  });
  const snowStyle15 = useAnimatedStyle(() => {
    const t = (p.value + flakes[15].offset) % 1;
    const y = t * (height * 0.65) + 120;
    const sway = 12 * Math.sin((t + flakes[15].offset) * Math.PI * 2);
    const o = interpolate(t, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
    return { opacity: o, transform: [{ translateX: flakes[15].x + sway }, { translateY: y }] };
  });
  const snowStyles = [snowStyle0, snowStyle1, snowStyle2, snowStyle3, snowStyle4, snowStyle5, snowStyle6, snowStyle7, snowStyle8, snowStyle9, snowStyle10, snowStyle11, snowStyle12, snowStyle13, snowStyle14, snowStyle15];

  // Wind line styles
  const windLineStyle1 = useAnimatedStyle(() => {
    const t = (p.value + 0.05) % 1;
    const x = t * (width + 240) - 120;
    const o = interpolate(t, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    return { opacity: o, transform: [{ translateX: x }, { translateY: 120 }] };
  });
  
  const windLineStyle2 = useAnimatedStyle(() => {
    const t = (p.value + 0.35) % 1;
    const x = t * (width + 240) - 120;
    const o = interpolate(t, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    return { opacity: o, transform: [{ translateX: x }, { translateY: 180 }] };
  });
  
  const windLineStyle3 = useAnimatedStyle(() => {
    const t = (p.value + 0.65) % 1;
    const x = t * (width + 240) - 120;
    const o = interpolate(t, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    return { opacity: o, transform: [{ translateX: x }, { translateY: 240 }] };
  });

  // Leaf styles
  const leafStyle1 = useAnimatedStyle(() => {
    const t = (p.value + 0.08) % 1;
    const x = 0 + t * (width + 260) - 130;
    const y = 210 + 18 * Math.sin((t + 0.08) * Math.PI * 2);
    const r = `${(t * 360) % 360}deg`;
    const o = interpolate(t, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);
    return { opacity: o, transform: [{ translateX: x }, { translateY: y }, { rotate: r }] };
  });
  
  const leafStyle2 = useAnimatedStyle(() => {
    const t = (p.value + 0.42) % 1;
    const x = 40 + t * (width + 260) - 130;
    const y = 150 + 18 * Math.sin((t + 0.42) * Math.PI * 2);
    const r = `${(t * 360) % 360}deg`;
    const o = interpolate(t, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);
    return { opacity: o, transform: [{ translateX: x }, { translateY: y }, { rotate: r }] };
  });
  
  const leafStyle3 = useAnimatedStyle(() => {
    const t = (p.value + 0.72) % 1;
    const x = 80 + t * (width + 260) - 130;
    const y = 270 + 18 * Math.sin((t + 0.72) * Math.PI * 2);
    const r = `${(t * 360) % 360}deg`;
    const o = interpolate(t, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);
    return { opacity: o, transform: [{ translateX: x }, { translateY: y }, { rotate: r }] };
  });

  // Star styles - create all 16 unconditionally
  const starStyle0 = useAnimatedStyle(() => {
    const tw = 0.4 + 0.6 * Math.abs(Math.sin((p.value + stars[0].offset) * Math.PI * 2));
    return { opacity: tw, transform: [{ translateX: stars[0].x }, { translateY: stars[0].y }] };
  });
  const starStyle1 = useAnimatedStyle(() => {
    const tw = 0.4 + 0.6 * Math.abs(Math.sin((p.value + stars[1].offset) * Math.PI * 2));
    return { opacity: tw, transform: [{ translateX: stars[1].x }, { translateY: stars[1].y }] };
  });
  const starStyle2 = useAnimatedStyle(() => {
    const tw = 0.4 + 0.6 * Math.abs(Math.sin((p.value + stars[2].offset) * Math.PI * 2));
    return { opacity: tw, transform: [{ translateX: stars[2].x }, { translateY: stars[2].y }] };
  });
  const starStyle3 = useAnimatedStyle(() => {
    const tw = 0.4 + 0.6 * Math.abs(Math.sin((p.value + stars[3].offset) * Math.PI * 2));
    return { opacity: tw, transform: [{ translateX: stars[3].x }, { translateY: stars[3].y }] };
  });
  const starStyle4 = useAnimatedStyle(() => {
    const tw = 0.4 + 0.6 * Math.abs(Math.sin((p.value + stars[4].offset) * Math.PI * 2));
    return { opacity: tw, transform: [{ translateX: stars[4].x }, { translateY: stars[4].y }] };
  });
  const starStyle5 = useAnimatedStyle(() => {
    const tw = 0.4 + 0.6 * Math.abs(Math.sin((p.value + stars[5].offset) * Math.PI * 2));
    return { opacity: tw, transform: [{ translateX: stars[5].x }, { translateY: stars[5].y }] };
  });
  const starStyle6 = useAnimatedStyle(() => {
    const tw = 0.4 + 0.6 * Math.abs(Math.sin((p.value + stars[6].offset) * Math.PI * 2));
    return { opacity: tw, transform: [{ translateX: stars[6].x }, { translateY: stars[6].y }] };
  });
  const starStyle7 = useAnimatedStyle(() => {
    const tw = 0.4 + 0.6 * Math.abs(Math.sin((p.value + stars[7].offset) * Math.PI * 2));
    return { opacity: tw, transform: [{ translateX: stars[7].x }, { translateY: stars[7].y }] };
  });
  const starStyle8 = useAnimatedStyle(() => {
    const tw = 0.4 + 0.6 * Math.abs(Math.sin((p.value + stars[8].offset) * Math.PI * 2));
    return { opacity: tw, transform: [{ translateX: stars[8].x }, { translateY: stars[8].y }] };
  });
  const starStyle9 = useAnimatedStyle(() => {
    const tw = 0.4 + 0.6 * Math.abs(Math.sin((p.value + stars[9].offset) * Math.PI * 2));
    return { opacity: tw, transform: [{ translateX: stars[9].x }, { translateY: stars[9].y }] };
  });
  const starStyle10 = useAnimatedStyle(() => {
    const tw = 0.4 + 0.6 * Math.abs(Math.sin((p.value + stars[10].offset) * Math.PI * 2));
    return { opacity: tw, transform: [{ translateX: stars[10].x }, { translateY: stars[10].y }] };
  });
  const starStyle11 = useAnimatedStyle(() => {
    const tw = 0.4 + 0.6 * Math.abs(Math.sin((p.value + stars[11].offset) * Math.PI * 2));
    return { opacity: tw, transform: [{ translateX: stars[11].x }, { translateY: stars[11].y }] };
  });
  const starStyle12 = useAnimatedStyle(() => {
    const tw = 0.4 + 0.6 * Math.abs(Math.sin((p.value + stars[12].offset) * Math.PI * 2));
    return { opacity: tw, transform: [{ translateX: stars[12].x }, { translateY: stars[12].y }] };
  });
  const starStyle13 = useAnimatedStyle(() => {
    const tw = 0.4 + 0.6 * Math.abs(Math.sin((p.value + stars[13].offset) * Math.PI * 2));
    return { opacity: tw, transform: [{ translateX: stars[13].x }, { translateY: stars[13].y }] };
  });
  const starStyle14 = useAnimatedStyle(() => {
    const tw = 0.4 + 0.6 * Math.abs(Math.sin((p.value + stars[14].offset) * Math.PI * 2));
    return { opacity: tw, transform: [{ translateX: stars[14].x }, { translateY: stars[14].y }] };
  });
  const starStyle15 = useAnimatedStyle(() => {
    const tw = 0.4 + 0.6 * Math.abs(Math.sin((p.value + stars[15].offset) * Math.PI * 2));
    return { opacity: tw, transform: [{ translateX: stars[15].x }, { translateY: stars[15].y }] };
  });
  const starStyles = [starStyle0, starStyle1, starStyle2, starStyle3, starStyle4, starStyle5, starStyle6, starStyle7, starStyle8, starStyle9, starStyle10, starStyle11, starStyle12, starStyle13, starStyle14, starStyle15];

  const moonStyle = useAnimatedStyle(() => {
    const x = width * 0.68 + 16 * Math.sin(p.value * Math.PI * 2);
    const y = 90 + 12 * Math.cos(p.value * Math.PI * 2);
    return { transform: [{ translateX: x }, { translateY: y }] };
  });

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.85 + 0.25 * s.value }],
    opacity: 0.4 + 0.4 * (1 - s.value)
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient colors={[theme.bgTop, theme.bgBottom]} style={StyleSheet.absoluteFill} />

      {themeKey === 'sunny' && (
        <>
          <Animated.View style={[styles.sun, sunStyle]} />
          <Animated.View style={[styles.rays, sunStyle]} />
          <Animated.View style={[styles.cloud, cloudStyle1]} />
          <Animated.View style={[styles.cloudSmall, cloudStyle2]} />
        </>
      )}

      {themeKey === 'cloud' && (
        <>
          <Animated.View style={[styles.cloud, cloudStyle3]} />
          <Animated.View style={[styles.cloud, cloudStyle4]} />
          <Animated.View style={[styles.cloudSmall, cloudStyle5]} />
        </>
      )}

      {themeKey === 'rain' && (
        <>
          <Animated.View style={[styles.cloudDark, cloudDarkStyle1]} />
          <Animated.View style={[styles.cloudDark, cloudDarkStyle2]} />
          {drops.map((d, i) => (
            <Animated.View key={`d${d.offset}`} style={[styles.drop, rainStyles[i]]} />
          ))}
          <Animated.View style={[styles.puddle]} />
          <Animated.View style={[styles.ripple, rippleStyle]} />
        </>
      )}

      {themeKey === 'snow' && (
        <>
          <Animated.View style={[styles.cloud, cloudSmallStyle1]} />
          <Animated.View style={[styles.cloudSmall, cloudSmallStyle2]} />
          {flakes.map((f, i) => (
            <Animated.View key={`f${f.offset}`} style={[styles.flake, snowStyles[i]]} />
          ))}
        </>
      )}

      {themeKey === 'wind' && (
        <>
          <Animated.View style={[styles.windLine, windLineStyle1]} />
          <Animated.View style={[styles.windLine, windLineStyle2]} />
          <Animated.View style={[styles.windLine, windLineStyle3]} />
          <Animated.View style={[styles.leaf, leafStyle1]} />
          <Animated.View style={[styles.leaf, leafStyle2]} />
          <Animated.View style={[styles.leaf, leafStyle3]} />
        </>
      )}

      {themeKey === 'night' && (
        <>
          {stars.map((st, i) => (
            <Animated.View key={`s${st.offset}`} style={[styles.star, starStyles[i]]} />
          ))}
          <Animated.View style={[styles.moon, moonStyle]} />
        </>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  sun: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.85)',
    top: 40,
    left: 26
  },
  rays: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 10,
    borderColor: 'rgba(255,255,255,0.35)',
    top: 5,
    left: -5
  },
  cloud: {
    position: 'absolute',
    width: 220,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.85)'
  },
  cloudSmall: {
    position: 'absolute',
    width: 160,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.82)'
  },
  cloudDark: {
    position: 'absolute',
    width: 240,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.55)'
  },
  drop: {
    position: 'absolute',
    width: 10,
    height: 18,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.8)'
  },
  puddle: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 86,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.08)'
  },
  ripple: {
    position: 'absolute',
    width: 160,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.35)',
    bottom: 110,
    left: width * 0.5 - 80
  },
  flake: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.92)'
  },
  windLine: {
    position: 'absolute',
    width: 220,
    height: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.35)'
  },
  leaf: {
    position: 'absolute',
    width: 18,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.7)'
  },
  star: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.9)'
  },
  moon: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(255,255,255,0.9)'
  }
});
