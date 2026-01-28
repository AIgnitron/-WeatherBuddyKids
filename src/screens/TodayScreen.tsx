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
import { formatKph, formatPct, formatTemp, formatTime, formatSnowfall } from '../utils/format';
import { getDressTip } from '../utils/dressTip';

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
  const setKidMode = useWeatherStore((s) => s.setKidMode);
  const themeChoice = useWeatherStore((s) => s.themeChoice);
  const temperatureUnit = useWeatherStore((s) => s.temperatureUnit);
  const setTemperatureUnit = useWeatherStore((s) => s.setTemperatureUnit);

  const { themeKey, theme } = useAppTheme(forecast, themeChoice);

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

    // Snow: use current snowfall or daily sum
    const snowNow = typeof forecast.current.snowfallCm === 'number' && forecast.current.snowfallCm > 0
      ? forecast.current.snowfallCm
      : today.snowfallCmSum;

    const all = [
      { key: 'temp', emoji: '🌡️', label: 'Temp', value: formatTemp(forecast.current.temperatureC, temperatureUnit) },
      { key: 'feels', emoji: '🙂', label: 'Feels', value: formatTemp(forecast.current.feelsLikeC, temperatureUnit) },
      { key: 'wind', emoji: '💨', label: 'Wind', value: formatKph(forecast.current.windKph) },
      { key: 'rain', emoji: '🌧️', label: 'Rain', value: formatPct(rainNow) },
      { key: 'uv', emoji: '🧴', label: 'UV', value: typeof uvNow === 'number' ? String(Math.round(uvNow)) : '--' },
      { key: 'hum', emoji: '💧', label: 'Humid', value: formatPct(forecast.current.humidityPct) },
      { key: 'snow', emoji: '❄️', label: 'Snow', value: formatSnowfall(snowNow), sub: snowNow > 0 ? 'today' : undefined },
      // Sun and High both have 'sub' text, placing them together ensures same row height
      { key: 'sun', emoji: '🌞', label: 'Sunrise', value: `${sunrise}`, sub: `sunset ${sunset}` },
      { key: 'hi', emoji: '📈', label: 'High', value: formatTemp(today.tempMaxC, temperatureUnit), sub: `low ${formatTemp(today.tempMinC, temperatureUnit)}` }
    ];

    if (kidMode) {
      // Show snow gadget in kid mode if there's snow, otherwise skip it
      const kidKeys = snowNow > 0 ? ['temp', 'rain', 'wind', 'snow'] : ['temp', 'rain', 'wind'];
      return all.filter((g) => kidKeys.includes(g.key));
    }

    return all;
  }, [forecast, today, kidMode, temperatureUnit]);

  const dressTip = useMemo(() => {
    if (!forecast) return { short: 'Smile', text: 'Bring a smile 😊', emoji: '😊', extras: [], details: [], outfit: '😊' };
    return getDressTip(forecast.current, today);
  }, [forecast, today]);

  const header = (
    <View>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={[styles.city, { color: theme.text }]} numberOfLines={1} accessibilityLabel={`City ${selectedCity.name}`}>
            {selectedCity.name}
          </Text>
          <Text style={[styles.sub, { color: theme.textSoft }]} numberOfLines={1} ellipsizeMode="tail">
            {selectedCity.admin1 ? `${selectedCity.admin1}, ` : ''}{selectedCity.country}
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

      <View style={styles.kidRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.kidTitle, { color: theme.text }]}>Temperature</Text>
          <Text style={[styles.kidSub, { color: theme.textSoft }]}>{temperatureUnit === 'C' ? 'Celsius' : 'Fahrenheit'}</Text>
        </View>
        <TogglePill
          theme={theme}
          value={temperatureUnit === 'F'}
          onChange={(v) => setTemperatureUnit(v ? 'F' : 'C').catch(() => {})}
          labelOn="°F"
          labelOff="°C"
          accessibilityLabel="Temperature unit toggle"
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

  const currentTemp = forecast ? formatTemp(forecast.current.temperatureC, temperatureUnit) : '--';
  const feelsLikeTemp = forecast?.current.feelsLikeC != null
    ? formatTemp(forecast.current.feelsLikeC, temperatureUnit)
    : null;

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
        {feelsLikeTemp && (
          <Text style={[styles.feelsLike, { color: theme.textSoft }]}>
            Feels {feelsLikeTemp}
          </Text>
        )}
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
        onPick={(c) => { addFavorite(c).catch(() => {}); }}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  titleContainer: {
    alignItems: 'center'
  },
  city: {
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center'
  },
  sub: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center'
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
  feelsLike: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: '700'
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 10,
    fontSize: 24,
    fontWeight: '900'
  }
});
