import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useWeatherStore } from '../store/useWeatherStore';
import { useAppTheme } from '../theme/useAppTheme';
import { ScreenShell } from '../components/ScreenShell';
import { FavoritesRow } from '../components/FavoritesRow';
import { CitySearch } from '../components/CitySearch';
import { BubbleCard } from '../components/BubbleCard';
import { TogglePill } from '../components/TogglePill';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { GadgetsGrid } from '../components/GadgetsGrid';
import { DressTipCard } from '../components/DressTipCard';
import { formatKph, formatPct, formatTemp, formatTime } from '../utils/format';
import { getDressTip } from '../utils/dressTip';

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

export function TodayScreen() {
  const forecast = useWeatherStore((s) => s.forecast);
  const status = useWeatherStore((s) => s.status);
  const lastError = useWeatherStore((s) => s.lastError);

  const selectedCity = useWeatherStore((s) => s.selectedCity);
  const favorites = useWeatherStore((s) => s.favorites);
  const kidMode = useWeatherStore((s) => s.kidMode);

  const selectCity = useWeatherStore((s) => s.selectCity);
  const addFavorite = useWeatherStore((s) => s.addFavorite);
  const removeFavorite = useWeatherStore((s) => s.removeFavorite);
  const refresh = useWeatherStore((s) => s.refresh);
  const useMyLocation = useWeatherStore((s) => s.useMyLocation);
  const setKidMode = useWeatherStore((s) => s.setKidMode);

  const { themeKey, theme } = useAppTheme(forecast);

  const [searchOpen, setSearchOpen] = useState(false);

  const today = forecast?.daily?.[0];

  const gadgets = useMemo(() => {
    if (!forecast || !today) return [];

    const rainNow = typeof forecast.current.rainChancePctNow === 'number'
      ? forecast.current.rainChancePctNow
      : today.rainChancePct;

    const uvNow = typeof forecast.current.uvNow === 'number' ? forecast.current.uvNow : today.uvMax;

    const sunrise = today.sunriseISO ? formatTime(today.sunriseISO) : '--';
    const sunset = today.sunsetISO ? formatTime(today.sunsetISO) : '--';

    const all = [
      { key: 'temp', emoji: '🌡️', label: 'Temp', value: formatTemp(forecast.current.temperatureC) },
      { key: 'feels', emoji: '🙂', label: 'Feels', value: formatTemp(forecast.current.feelsLikeC) },
      { key: 'wind', emoji: '💨', label: 'Wind', value: formatKph(forecast.current.windKph) },
      { key: 'rain', emoji: '🌧️', label: 'Rain', value: formatPct(rainNow) },
      { key: 'uv', emoji: '🧴', label: 'UV', value: typeof uvNow === 'number' ? String(Math.round(uvNow)) : '--' },
      { key: 'hum', emoji: '💧', label: 'Humid', value: formatPct(forecast.current.humidityPct) },
      { key: 'sun', emoji: '🌞', label: 'Sun', value: `${sunrise}`, sub: `down ${sunset}` },
      { key: 'hi', emoji: '📈', label: 'High', value: formatTemp(today.tempMaxC), sub: `low ${formatTemp(today.tempMinC)}` }
    ];

    if (kidMode) {
      return all.filter((g) => ['temp', 'rain', 'wind'].includes(g.key));
    }

    return all;
  }, [forecast, today, kidMode]);

  const dressTip = useMemo(() => {
    if (!forecast) return 'Bring a smile 😊';
    return getDressTip(forecast.current, today).text;
  }, [forecast, today]);

  const header = (
    <View>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.city, { color: theme.text }]} numberOfLines={1} accessibilityLabel={`City ${selectedCity.name}`}>
            {selectedCity.name}
          </Text>
          <Text style={[styles.sub, { color: theme.textSoft }]} numberOfLines={1}>
            {selectedCity.admin1 ? `${selectedCity.admin1}, ` : ''}{selectedCity.country}
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

      <View style={styles.kidRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.kidTitle, { color: theme.text }]}>{kidMode ? 'Kid Mode' : 'All Gadgets'}</Text>
          <Text style={[styles.kidSub, { color: theme.textSoft }]}>{kidMode ? 'Only the big stuff' : 'Show everything'}</Text>
        </View>
        <TogglePill
          theme={theme}
          value={kidMode}
          onChange={(v) => setKidMode(v).catch(() => {})}
          labelOn="ON"
          labelOff="OFF"
          accessibilityLabel="Kid mode toggle"
        />
      </View>

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
        <LoadingState title="Weather Buddy" message="Looking outside…" />
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

  const currentTemp = forecast ? formatTemp(forecast.current.temperatureC) : '--';

  return (
    <ScreenShell themeKey={themeKey} theme={theme} header={header}>
      <BubbleCard
        theme={theme}
        style={[styles.hero, { backgroundColor: theme.card, borderColor: theme.outline }]}
        accessibilityLabel={`Current temperature ${currentTemp}`}
      >
        <Text style={styles.heroEmoji}>🌈</Text>
        <Text style={[styles.heroTemp, { color: theme.text }]}>{currentTemp}</Text>
        <Text style={[styles.heroLabel, { color: theme.textSoft }]}>{kidMode ? 'Right now' : 'Right now outside'}</Text>
      </BubbleCard>

      <Text style={[styles.sectionTitle, { color: theme.text }]} accessibilityLabel="Today's gadgets">
        Today
      </Text>

      <GadgetsGrid theme={theme} gadgets={gadgets} />

      <View style={{ height: 12 }} />
      <DressTipCard theme={theme} tip={dressTip} />

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
  city: {
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
  kidRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  kidTitle: {
    fontSize: 16,
    fontWeight: '900'
  },
  kidSub: {
    fontSize: 12,
    fontWeight: '800'
  },
  banner: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '900'
  },
  hero: {
    borderRadius: 36,
    paddingVertical: 22,
    alignItems: 'center'
  },
  heroEmoji: {
    fontSize: 32
  },
  heroTemp: {
    marginTop: 6,
    fontSize: 64,
    fontWeight: '900'
  },
  heroLabel: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '800'
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 10,
    fontSize: 24,
    fontWeight: '900'
  }
});
