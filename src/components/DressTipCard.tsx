import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AppTheme } from '../theme/theme';
import { BubbleCard } from './BubbleCard';
import type { DressTipResult } from '../utils/dressTip';

type Props = {
  theme: AppTheme;
  tip: DressTipResult;
};

export const DressTipCard = memo(({ theme, tip }: Props) => {
  return (
    <BubbleCard theme={theme} style={[styles.card, { backgroundColor: theme.accent, borderColor: theme.outline }]} accessibilityLabel={`Dress tip ${tip.text}`}> 
      <View style={styles.row}>
        <Text style={styles.icon}>🧸</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>What to Wear</Text>
          <Text style={styles.outfit}>{tip.outfit}</Text>
          <Text style={styles.tip} numberOfLines={1}>{tip.text}</Text>
        </View>
      </View>
      {tip.details.length > 0 && (
        <View style={styles.detailsContainer}>
          {tip.details.slice(0, 3).map((detail, i) => (
            <Text key={i} style={styles.detail}>• {detail}</Text>
          ))}
        </View>
      )}
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
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    opacity: 0.9
  },
  outfit: {
    fontSize: 32,
    marginVertical: 4
  },
  tip: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff'
  },
  detailsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)'
  },
  detail: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    opacity: 0.95,
    marginBottom: 4
  }
});
