import React, { memo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { City } from '../types';
import type { AppTheme } from '../theme/theme';
import { BubbleCard } from './BubbleCard';
import { cityEmoji } from '../utils/emoji';

type Props = {
  theme: AppTheme;
  cities: City[];
  selectedCityId: string;
  onSelect: (city: City) => void;
  onRemove: (cityId: string) => void;
};

export const FavoritesRow = memo(({ theme, cities, selectedCityId, onSelect, onRemove }: Props) => {
  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.inner}>
        {cities.map((c) => {
          const selected = c.id === selectedCityId;
          return (
            <BubbleCard
              key={c.id}
              theme={theme}
              onPress={() => onSelect(c)}
              onLongPress={() => {
                if (cities.length <= 1) return;
                onRemove(c.id);
              }}
              accessibilityLabel={`Favorite city ${c.name}`}
              style={[
                styles.chip,
                { backgroundColor: selected ? theme.accent : theme.cardAlt, borderColor: theme.outline }
              ]}
            >
              <View style={styles.chipRow}>
                <Text style={styles.emoji}>{cityEmoji(c.name)}</Text>
                <Text style={[styles.name, { color: selected ? '#fff' : theme.text }]} numberOfLines={1}>
                  {c.name}
                </Text>
                {selected ? <Text style={styles.star}>⭐</Text> : null}
              </View>
            </BubbleCard>
          );
        })}
      </ScrollView>
      {/* Only show helper text when 2+ cities exist (removal requires at least 2) */}
      {cities.length >= 2 && (
        <Text style={[styles.hint, { color: theme.textSoft }]}>Hold a city to remove</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8
  },
  inner: {
    paddingVertical: 6,
    paddingRight: 12
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    marginRight: 10,
    minWidth: 120
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  emoji: {
    fontSize: 18,
    marginRight: 8
  },
  name: {
    fontSize: 16,
    fontWeight: '900',
    flexShrink: 1
  },
  star: {
    marginLeft: 6,
    fontSize: 14
  },
  hint: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
    marginLeft: 6
  }
});
