import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { AppTheme } from '../theme/theme';
import { useWeatherStore } from '../store/useWeatherStore';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { BubbleCard } from './BubbleCard';
import { cityEmoji } from '../utils/emoji';
import type { City } from '../types';

type Props = {
  visible: boolean;
  theme: AppTheme;
  onClose: () => void;
  onPick?: (city: City) => void;
};

// Tab bar height for bottom padding calculation
const TAB_BAR_HEIGHT = 64;

export const CitySearch = memo(({ visible, theme, onClose, onPick }: Props) => {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const setStoreQuery = useWeatherStore((s) => s.setSearchQuery);
  const run = useWeatherStore((s) => s.runCitySearch);
  const results = useWeatherStore((s) => s.searchResults);
  const status = useWeatherStore((s) => s.searchStatus);

  const dq = useDebouncedValue(query, 260);

  // Clear query and results when modal opens
  useEffect(() => {
    if (visible) {
      setQuery('');
      setStoreQuery('');
    }
  }, [visible, setStoreQuery]);

  // Sync local query to store for search
  useEffect(() => {
    setStoreQuery(dq);
  }, [dq, setStoreQuery]);

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

  const handlePick = useCallback(
    (city: City) => {
      onPick?.(city);
      onClose();
    },
    [onPick, onClose]
  );

  const renderItem = useCallback(
    ({ item: c }: { item: City }) => (
      <BubbleCard
        key={c.id}
        theme={theme}
        onPress={() => handlePick(c)}
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
    ),
    [theme, handlePick]
  );

  const keyExtractor = useCallback((item: City) => item.id, []);

  // Bottom padding: safe area + tab bar height to ensure last item is visible
  const bottomPadding = insets.bottom + TAB_BAR_HEIGHT + 20;

  const ListHeader = useMemo(() => {
    if (status === 'loading') {
      return <Text style={[styles.helper, { color: theme.textSoft }]}>Looking for cities…</Text>;
    }
    if (showEmpty) {
      return <Text style={[styles.helper, { color: theme.textSoft }]}>I can't find that city. Try another!</Text>;
    }
    return null;
  }, [status, showEmpty, theme.textSoft]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}>
      <View style={[styles.root, { backgroundColor: theme.bgBottom }]}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Header - stays fixed at top with safe area padding */}
          <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <View style={styles.topRow}>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                style={[styles.backButton, { backgroundColor: theme.cardAlt, borderColor: theme.outline }]}
              >
                <Ionicons name="chevron-back" size={26} color={theme.text} />
              </Pressable>
              <Text style={[styles.title, { color: theme.text }]}>Search city</Text>
              <View style={styles.spacer} />
            </View>

            <View style={[styles.inputWrap, { borderColor: theme.outline, backgroundColor: theme.cardAlt }]}>
              <Text style={styles.searchIcon}>🔎</Text>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Type a city…"
                placeholderTextColor={theme.textSoft}
                style={[styles.input, { color: theme.text }]}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="search"
                accessibilityLabel="City search input"
              />
            </View>
          </View>

          {/* Scrollable results list */}
          <FlatList
            data={results}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            style={styles.list}
            contentContainerStyle={[styles.listContent, { paddingBottom: bottomPadding }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={ListHeader}
          />
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  keyboardView: {
    flex: 1
  },
  header: {
    paddingHorizontal: 16
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  spacer: {
    width: 48,
    height: 48
  },
  title: {
    fontSize: 28,
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
    flex: 1,
    marginTop: 14
  },
  listContent: {
    paddingHorizontal: 16
  },
  helper: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10
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
  }
});
