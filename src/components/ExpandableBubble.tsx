import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import type { AppTheme } from '../theme/theme';

type Props = {
  theme: AppTheme;
  expanded: boolean;
  lines: string[];
};

export const ExpandableBubble = memo(({ theme, expanded, lines }: Props) => {
  const t = useSharedValue(expanded ? 1 : 0);

  React.useEffect(() => {
    t.value = withSpring(expanded ? 1 : 0, { damping: 16, stiffness: 220 });
  }, [expanded, t]);

  const aStyle = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [{ scale: 0.96 + 0.04 * t.value }],
    maxHeight: 140 * t.value + 1
  }));

  if (!expanded) {
    return <Animated.View style={[styles.wrap, aStyle]} />;
  }

  return (
    <Animated.View style={[styles.wrap, aStyle, { backgroundColor: theme.cardAlt, borderColor: theme.outline }]}>
      {lines.map((l, i) => (
        <View key={`${l}${i}`} style={styles.lineRow}>
          <Text style={[styles.dot, { color: theme.accent }]}>•</Text>
          <Text style={[styles.line, { color: theme.text }]}>{l}</Text>
        </View>
      ))}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginTop: 10,
    borderWidth: 2,
    borderRadius: 26,
    paddingVertical: 12,
    paddingHorizontal: 14,
    overflow: 'hidden'
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  dot: {
    fontSize: 18,
    fontWeight: '900',
    width: 16
  },
  line: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1
  }
});
