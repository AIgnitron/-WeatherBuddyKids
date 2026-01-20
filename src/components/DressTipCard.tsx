import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AppTheme } from '../theme/theme';
import { BubbleCard } from './BubbleCard';

type Props = {
  theme: AppTheme;
  tip: string;
};

export const DressTipCard = memo(({ theme, tip }: Props) => {
  return (
    <BubbleCard theme={theme} style={[styles.card, { backgroundColor: theme.accent, borderColor: theme.outline }]} accessibilityLabel={`Dress tip ${tip}`}> 
      <View style={styles.row}>
        <Text style={styles.icon}>🧸</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Dress Tip</Text>
          <Text style={styles.tip} numberOfLines={2}>{tip}</Text>
        </View>
      </View>
    </BubbleCard>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 32,
    paddingVertical: 18,
    paddingHorizontal: 18
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  icon: {
    fontSize: 34,
    marginRight: 14
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff'
  },
  tip: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: '900',
    color: '#fff'
  }
});
