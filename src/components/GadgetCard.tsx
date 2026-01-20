import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AppTheme } from '../theme/theme';
import { BubbleCard } from './BubbleCard';

type Props = {
  theme: AppTheme;
  emoji: string;
  label: string;
  value: string;
  sub?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export const GadgetCard = memo(({ theme, emoji, label, value, sub, onPress, accessibilityLabel }: Props) => {
  return (
    <BubbleCard
      theme={theme}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel ?? label}
      style={styles.card}
    >
      <View style={styles.rowTop}>
        <View style={[styles.icon, { backgroundColor: theme.cardAlt, borderColor: theme.outline }]}> 
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <Text style={[styles.label, { color: theme.text }]} numberOfLines={1}>{label}</Text>
      </View>
      <Text style={[styles.value, { color: theme.text }]} numberOfLines={1}>{value}</Text>
      {sub ? <Text style={[styles.sub, { color: theme.textSoft }]} numberOfLines={1}>{sub}</Text> : null}
    </BubbleCard>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 14,
    minHeight: 118
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  emoji: {
    fontSize: 18
  },
  label: {
    fontSize: 16,
    fontWeight: '900',
    flexShrink: 1
  },
  value: {
    fontSize: 34,
    fontWeight: '900'
  },
  sub: {
    fontSize: 14,
    fontWeight: '800'
  }
});
