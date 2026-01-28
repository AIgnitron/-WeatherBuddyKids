import React, { memo, useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type Props = {
  emoji: string;
  focused: boolean;
};

export const TabIconBubble = memo(({ emoji, focused }: Props) => {
  const s = useSharedValue(1);

  useEffect(() => {
    s.value = withSpring(focused ? 1.12 : 1, { damping: 12, stiffness: 220 });
  }, [focused, s]);

  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));

  return (
    <Animated.View style={[styles.bubble, aStyle, focused && styles.bubbleFocused]} accessibilityRole="image">
      <Text style={styles.emoji}>{emoji}</Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  bubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  bubbleFocused: {
    backgroundColor: 'rgba(255,255,255,0.95)'
  },
  emoji: {
    fontSize: 22
  }
});
