import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import type { AppTheme } from '../theme/theme';
import { toggleHaptic } from '../utils/haptics';
import { playToggleSound } from '../utils/sounds';

const TRACK_WIDTH = 56;
const TRACK_HEIGHT = 32;
const KNOB_SIZE = 24;
const KNOB_MARGIN = 4;
const KNOB_TRAVEL = TRACK_WIDTH - KNOB_SIZE - KNOB_MARGIN * 2;

type Props = {
  theme: AppTheme;
  labelOn?: string;
  labelOff?: string;
  value: boolean;
  onChange: (next: boolean) => void;
  accessibilityLabel?: string;
  showLabels?: boolean;
};

export const TogglePill = memo(({
  theme,
  labelOn = 'ON',
  labelOff = 'OFF',
  value,
  onChange,
  accessibilityLabel,
  showLabels = true
}: Props) => {
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
    transform: [{ translateX: KNOB_TRAVEL * t.value }]
  }));

  const handlePress = async () => {
    await toggleHaptic();
    playToggleSound();
    onChange(!value);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel ?? 'Toggle'}
      hitSlop={8}
    >
      <View style={styles.row}>
        {showLabels && (
          <Text
            style={[
              styles.label,
              { color: !value ? theme.text : theme.textSoft },
              !value && styles.labelActive
            ]}
          >
            {labelOff}
          </Text>
        )}

        <Animated.View style={[styles.track, trackStyle]}>
          <Animated.View style={[styles.knob, knobStyle, { backgroundColor: theme.card }]} />
        </Animated.View>

        {showLabels && (
          <Text
            style={[
              styles.label,
              { color: value ? theme.text : theme.textSoft },
              value && styles.labelActive
            ]}
          >
            {labelOn}
          </Text>
        )}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  track: {
    position: 'relative',
    height: TRACK_HEIGHT,
    width: TRACK_WIDTH,
    borderRadius: 999,
    borderWidth: 2,
    justifyContent: 'center'
  },
  knob: {
    position: 'absolute',
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    left: KNOB_MARGIN,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 24
  },
  labelActive: {
    fontWeight: '900'
  }
});
