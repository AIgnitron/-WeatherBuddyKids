import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import type { AppTheme } from '../theme/theme';
import { tapHaptic } from '../utils/haptics';

type Props = {
  theme: AppTheme;
  emoji: string;
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
};

export const BigCartoonButton = memo(({ theme, emoji, label, onPress, accessibilityLabel }: Props) => {
  const s = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));

  return (
    <Pressable
      onPress={async () => {
        await tapHaptic();
        s.value = withSpring(0.94, { damping: 12, stiffness: 220 });
        requestAnimationFrame(() => {
          s.value = withSpring(1, { damping: 12, stiffness: 220 });
        });
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      hitSlop={12}
    >
      <Animated.View style={[styles.wrap, { borderColor: theme.outline, backgroundColor: theme.cardAlt }, aStyle]}>
        <View style={[styles.icon, { backgroundColor: theme.card, borderColor: theme.outline }]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <Text style={[styles.label, { color: theme.text }]} numberOfLines={1}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  wrap: {
    height: 62,
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 14,
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  emoji: {
    fontSize: 22
  },
  label: {
    fontSize: 18,
    fontWeight: '900'
  }
});
