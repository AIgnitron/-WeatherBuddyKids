import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import type { AppTheme } from '../theme/theme';
import { tapHaptic } from '../utils/haptics';

type Props = {
  theme: AppTheme;
  labelOn: string;
  labelOff: string;
  value: boolean;
  onChange: (next: boolean) => void;
  accessibilityLabel?: string;
};

export const TogglePill = memo(({ theme, labelOn, labelOff, value, onChange, accessibilityLabel }: Props) => {
  const t = useSharedValue(value ? 1 : 0);

  React.useEffect(() => {
    t.value = withSpring(value ? 1 : 0, { damping: 14, stiffness: 200 });
  }, [value, t]);

  const trackStyle = useAnimatedStyle(() => {
    const bg = interpolateColor(t.value, [0, 1], [theme.cardAlt, theme.accent]);
    return {
      backgroundColor: bg,
      borderColor: theme.outline
    };
  });

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: 44 * t.value }]
  }));

  return (
    <Pressable
      onPress={async () => {
        await tapHaptic();
        onChange(!value);
      }}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel ?? 'Kid mode toggle'}
      hitSlop={12}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.knob, knobStyle, { backgroundColor: theme.card }]} />
        <View style={styles.labels}>
          <Text style={[styles.label, { color: value ? '#fff' : theme.text }]}>{value ? labelOn : labelOff}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  track: {
    height: 44,
    width: 110,
    borderRadius: 999,
    borderWidth: 2,
    justifyContent: 'center',
    paddingHorizontal: 6
  },
  knob: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    left: 5
  },
  labels: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  label: {
    fontSize: 14,
    fontWeight: '900'
  }
});
