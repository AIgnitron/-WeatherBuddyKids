import React, { memo, useEffect, useMemo } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { AppTheme } from '../theme/theme';
import { useWeatherStore } from '../store/useWeatherStore';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { BubbleCard } from './BubbleCard';
import { BigCartoonButton } from './BigCartoonButton';
import { cityEmoji } from '../utils/emoji';
import type { City } from '../types';

type Props = {
  visible: boolean;
  theme: AppTheme;
  onClose: () => void;
  onPick?: (city: City) => void;
};

export const CitySearch = memo(({ visible, theme, onClose, onPick }: Props) => {
  const q = useWeatherStore((s) => s.searchQuery);
  const setQ = useWeatherStore((s) => s.setSearchQuery);
  const run = useWeatherStore((s) => s.runCitySearch);
  const results = useWeatherStore((s) => s.searchResults);
  const status = useWeatherStore((s) => s.searchStatus);

  const dq = useDebouncedValue(q, 260);

  useEffect(() => {
    if (!visible) return;
    run().catch(() => {
      // store sets status
    });
  }, [dq, visible, run]);

  const showEmpty = useMemo(() => {
    if (!visible) return false;
    if (!dq.trim()) return false;
    return status === 'ready' && results.length === 0;
  }, [visible, dq, status, results.length]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}>
      <View style={[styles.root, { backgroundColor: theme.bgBottom }]}>
        <View style={styles.topRow}>
          <Text style={[styles.title, { color: theme.text }]}>Search city</Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close search" hitSlop={12}>
            <Text style={[styles.close, { color: theme.text }]}>✖️</Text>
          </Pressable>
        </View>

        <View style={[styles.inputWrap, { borderColor: theme.outline, backgroundColor: theme.cardAlt }]}> 
          <Text style={styles.searchIcon}>🔎</Text>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Ottawa..."
            placeholderTextColor={theme.textSoft}
            style={[styles.input, { color: theme.text }]}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="City search input"
          />
        </View>

        <View style={styles.list}>
          {status === 'loading' && (
            <Text style={[styles.helper, { color: theme.textSoft }]}>Looking for cities…</Text>
          )}

          {showEmpty && (
            <Text style={[styles.helper, { color: theme.textSoft }]}>I can’t find that city. Try another!</Text>
          )}

          {results.map((c) => (
            <BubbleCard
              key={c.id}
              theme={theme}
              onPress={() => {
                onPick?.(c);
                onClose();
              }}
              style={[styles.result, { backgroundColor: theme.card, borderColor: theme.outline }]}
              accessibilityLabel={`Pick city ${c.name}`}
            >
              <View style={styles.resultRow}>
                <Text style={styles.resultEmoji}>{cityEmoji(c.name)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.resultName, { color: theme.text }]} numberOfLines={1}>
                    {c.name}
                  </Text>
                  <Text style={[styles.resultSub, { color: theme.textSoft }]} numberOfLines={1}>
                    {(c.admin1 ? `${c.admin1}, ` : '') + c.country}
                  </Text>
                </View>
                <Text style={styles.go}>👉</Text>
              </View>
            </BubbleCard>
          ))}
        </View>

        <View style={styles.bottom}>
          <BigCartoonButton
            theme={theme}
            emoji="🏠"
            label="Ottawa"
            onPress={() => {
              const store = useWeatherStore.getState();
              const fav = store.favorites.find((x) => x.name.toLowerCase() === 'ottawa');
              if (fav) onPick?.(fav);
              onClose();
            }}
            accessibilityLabel="Pick Ottawa"
          />
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 14,
    paddingHorizontal: 16
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: 28,
    fontWeight: '900'
  },
  close: {
    fontSize: 24,
    fontWeight: '900'
  },
  inputWrap: {
    marginTop: 12,
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 14,
    height: 62,
    flexDirection: 'row',
    alignItems: 'center'
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800'
  },
  list: {
    marginTop: 14,
    flex: 1
  },
  helper: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 20
  },
  result: {
    marginBottom: 12,
    paddingVertical: 14
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  resultEmoji: {
    fontSize: 22,
    marginRight: 10
  },
  resultName: {
    fontSize: 20,
    fontWeight: '900'
  },
  resultSub: {
    fontSize: 14,
    fontWeight: '800'
  },
  go: {
    fontSize: 20,
    marginLeft: 8
  },
  bottom: {
    paddingVertical: 14
  }
});
