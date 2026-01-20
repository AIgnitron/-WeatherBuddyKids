import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { AppTheme } from '../theme/theme';
import { GadgetCard } from './GadgetCard';

type Gadget = {
  key: string;
  emoji: string;
  label: string;
  value: string;
  sub?: string;
};

type Props = {
  theme: AppTheme;
  gadgets: Gadget[];
};

export const GadgetsGrid = memo(({ theme, gadgets }: Props) => {
  return (
    <View style={styles.grid}>
      {gadgets.map((g) => (
        <View key={g.key} style={styles.cell}>
          <GadgetCard theme={theme} emoji={g.emoji} label={g.label} value={g.value} sub={g.sub} />
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8
  },
  cell: {
    width: '50%',
    padding: 8
  }
});
