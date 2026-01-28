import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useWeatherStore } from '../store/useWeatherStore';
import { useAppTheme } from '../theme/useAppTheme';
import { ScreenShell } from '../components/ScreenShell';
import { FavoritesRow } from '../components/FavoritesRow';
import { CitySearch } from '../components/CitySearch';
import { BubbleCard } from '../components/BubbleCard';
import { BigCartoonButton } from '../components/BigCartoonButton';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { WeatherBuddy } from '../components/WeatherBuddy';

const PHRASES: Record<string, string[]> = {
  sunny: ['Sun hugs! ☀️', 'Let’s bounce!', 'Shiny day!', 'Sunglasses time!'],
  rain: ['Splash! 🌧️', 'Umbrella up!', 'Puddle party!', 'Drip drop!'],
  snow: ['Brrr! ❄️', 'Snow wiggles!', 'Cozy scarf!', 'Fluffy flakes!'],
  wind: ['Whoooosh! 💨', 'Windy dance!', 'Hold your hat!', 'Leaf chase!'],
  night: ['Shhh… 🌙', 'Sleepy blink…', 'Star twinkle!', 'Night night!'],
  cloud: ['Hello clouds! ☁️', 'Peek-a-boo sky!', 'Soft puffy!', 'Cloud hug!']
};

function pickPhrase(themeKey: string) {
  const arr = PHRASES[themeKey] ?? PHRASES.cloud;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function BuddyScreen() {
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

  const themeChoice = useWeatherStore((s) => s.themeChoice);
  const { themeKey, theme } = useAppTheme(forecast, themeChoice);

  const [searchOpen, setSearchOpen] = useState(false);
  const [phrase, setPhrase] = useState<string>(() => pickPhrase(themeKey));

  // update default phrase when theme changes
  React.useEffect(() => {
    setPhrase(pickPhrase(themeKey));
  }, [themeKey]);

  const header = (
    <View>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            Buddy
          </Text>
          <Text style={[styles.sub, { color: theme.textSoft }]} numberOfLines={1}>
            {selectedCity.name}{selectedCity.admin1 ? `, ${selectedCity.admin1}` : ''}
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
        <LoadingState title="Buddy" message="Finding a mood…" />
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
      <Text style={[styles.tapTitle, { color: theme.text }]}>Tap Buddy!</Text>

      <View style={styles.center}>
        <BubbleCard
          theme={theme}
          style={[styles.phrase, { backgroundColor: theme.cardAlt, borderColor: theme.outline }]}
          accessibilityLabel={`Buddy says ${phrase}`}
        >
          <Text style={[styles.phraseText, { color: theme.text }]}>{phrase}</Text>
        </BubbleCard>

        <WeatherBuddy
          theme={theme}
          themeKey={themeKey}
          onTap={() => setPhrase(pickPhrase(themeKey))}
        />
      </View>

      <View style={{ height: 16 }} />

      <BigCartoonButton
        theme={theme}
        emoji="📍"
        label="Use my location"
        onPress={() => useMyLocation().catch(() => {})}
        accessibilityLabel="Use my location"
      />

      <View style={{ height: 10 }} />

      <BigCartoonButton
        theme={theme}
        emoji="🔎"
        label="Search city"
        onPress={() => setSearchOpen(true)}
        accessibilityLabel="Search city"
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
  },
  tapTitle: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 12
  },
  center: {
    alignItems: 'center'
  },
  phrase: {
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14
  },
  phraseText: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center'
  }
});
