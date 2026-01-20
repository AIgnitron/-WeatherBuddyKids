import React, { memo } from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { tapHaptic } from '../utils/haptics';
import type { AppTheme } from '../theme/theme';

type Props = {
  theme: AppTheme;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
  accessibilityLabel?: string;
};

export const BubbleCard = memo(({
  theme,
  children,
  style,
  onPress,
  onLongPress,
  accessibilityLabel
}: Props) => {
  const s = useSharedValue(1);

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: s.value }]
  }));

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : 'summary'}
      accessibilityLabel={accessibilityLabel}
      onPress={async () => {
        if (!onPress) return;
        await tapHaptic();
        s.value = withSpring(0.96, { damping: 14, stiffness: 240 });
        requestAnimationFrame(() => {
          s.value = withSpring(1, { damping: 14, stiffness: 240 });
        });
        onPress();
      }}
      onLongPress={onLongPress}
    >
      <Animated.View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.outline }, aStyle, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderRadius: 28,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4
  }
});
