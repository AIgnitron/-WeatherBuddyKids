import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useWeatherStore } from '../store/useWeatherStore';
import { useAppTheme } from '../theme/useAppTheme';
import { ScreenShell } from '../components/ScreenShell';
import { FavoritesRow } from '../components/FavoritesRow';
import { CitySearch } from '../components/CitySearch';
import { BubbleCard } from '../components/BubbleCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { DayForecastCard } from '../components/DayForecastCard';

function HeaderActionButton({ theme, emoji, onPress, label }: { theme: any; emoji: string; onPress: () => void; label: string }) {
  return (
    <BubbleCard
      theme={theme}
      onPress={onPress}
      accessibilityLabel={label}
      style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.outline }]}
    >
      <Text style={styles.actionEmoji}>{emoji}</Text>
    </BubbleCard>
  );
}

export function WeekScreen() {
  const forecast = useWeatherStore((s) => s.forecast);
  const status = useWeatherStore((s) => s.status);
  const lastError = useWeatherStore((s) => s.lastError);

  const selectedCity = useWeatherStore((s) => s.selectedCity);
  const favorites = useWeatherStore((s) => s.favorites);

  const selectCity = useWeatherStore((s) => s.selectCity);
  const addFavorite = useWeatherStore((s) => s.addFavorite);
  const removeFavorite = useWeatherStore((s) => s.removeFavorite);
  const refresh = useWeatherStore((s) => s.refresh);
  const useMyLocation = useWeatherStore((s) => s.useMyLocation);

  const { themeKey, theme } = useAppTheme(forecast);

  const [searchOpen, setSearchOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const days = useMemo(() => forecast?.daily ?? [], [forecast?.daily]);

  const header = (
    <View>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            Week
          </Text>
          <Text style={[styles.sub, { color: theme.textSoft }]} numberOfLines={1}>
            {selectedCity.name}{selectedCity.admin1 ? `, ${selectedCity.admin1}` : ''}
            {status === 'cached' ? '  •  saved' : status === 'ready' ? '  •  live' : ''}
          </Text>
        </View>

        <HeaderActionButton theme={theme} emoji="🔄" label="Refresh" onPress={() => refresh().catch(() => {})} />
        <HeaderActionButton theme={theme} emoji="📍" label="Use my location" onPress={() => useMyLocation().catch(() => {})} />
        <HeaderActionButton theme={theme} emoji="🔎" label="Search city" onPress={() => setSearchOpen(true)} />
      </View>

      <FavoritesRow
        theme={theme}
        cities={favorites}
        selectedCityId={selectedCity.id}
        onSelect={(c) => selectCity(c).catch(() => {})}
        onRemove={(id) => removeFavorite(id).catch(() => {})}
      />

      {lastError?.message ? (
        <Text style={[styles.banner, { color: theme.text }]} accessibilityLabel={lastError.message}>
          ⚠️ {lastError.message}
        </Text>
      ) : null}
    </View>
  );

  if (!forecast && status === 'loading') {
    return (
      <ScreenShell themeKey={themeKey} theme={theme} header={header} scroll={false}>
        <LoadingState title="Week" message="Checking the sky…" />
        <CitySearch
          visible={searchOpen}
          theme={theme}
          onClose={() => setSearchOpen(false)}
          onPick={async (c) => {
            await addFavorite(c);
            await selectCity(c);
          }}
        />
      </ScreenShell>
    );
  }

  if (!forecast && status === 'error') {
    return (
      <ScreenShell themeKey={themeKey} theme={theme} header={header} scroll={false}>
        <ErrorState
          title={lastError?.title ?? 'Oops!'}
          message={lastError?.message ?? 'Clouds got in the way. Try again!'}
          onRetry={() => refresh().catch(() => {})}
          theme={theme}
        />
        <CitySearch
          visible={searchOpen}
          theme={theme}
          onClose={() => setSearchOpen(false)}
          onPick={async (c) => {
            await addFavorite(c);
            await selectCity(c);
          }}
        />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell themeKey={themeKey} theme={theme} header={header}>
      {days.map((d, i) => (
        <DayForecastCard
          key={d.dateISO}
          theme={theme}
          day={d}
          index={i}
          expanded={expandedIndex === i}
          onToggle={() => setExpandedIndex((cur) => (cur === i ? null : i))}
        />
      ))}

      <CitySearch
        visible={searchOpen}
        theme={theme}
        onClose={() => setSearchOpen(false)}
        onPick={async (c) => {
          await addFavorite(c);
          await selectCity(c);
        }}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  title: {
    fontSize: 30,
    fontWeight: '900'
  },
  sub: {
    fontSize: 13,
    fontWeight: '800'
  },
  actionBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0
  },
  actionEmoji: {
    fontSize: 22
  },
  banner: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '900'
  }
});
