import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useWeatherStore } from '../store/useWeatherStore';
import { useAppTheme } from '../theme/useAppTheme';
import { ScreenShell } from '../components/ScreenShell';
import { FavoritesRow } from '../components/FavoritesRow';
import { CitySearch } from '../components/CitySearch';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { DayForecastCard } from '../components/DayForecastCard';

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
  const themeChoice = useWeatherStore((s) => s.themeChoice);
  const temperatureUnit = useWeatherStore((s) => s.temperatureUnit);

  const { themeKey, theme } = useAppTheme(forecast, themeChoice);

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
          onPick={(c) => { addFavorite(c).catch(() => {}); }}
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
          onPick={(c) => { addFavorite(c).catch(() => {}); }}
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
          temperatureUnit={temperatureUnit}
        />
      ))}

      <CitySearch
        visible={searchOpen}
        theme={theme}
        onClose={() => setSearchOpen(false)}
        onPick={(c) => { addFavorite(c).catch(() => {}); }}
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
  banner: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '900'
  }
});
