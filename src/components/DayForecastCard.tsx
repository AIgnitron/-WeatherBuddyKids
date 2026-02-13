import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { DailyForecast, WeatherThemeKey, TemperatureUnit } from '../types';
import type { AppTheme } from '../theme/theme';
import { BubbleCard } from './BubbleCard';
import { ExpandableBubble } from './ExpandableBubble';
import { formatDayLong, formatKph, formatPct, formatSnowfall, formatTemp, formatTime } from '../utils/format';
import { themeKeyFrom, weatherEmojiForTheme } from '../utils/weatherMap';

type Props = {
  theme: AppTheme;
  day: DailyForecast;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  temperatureUnit: TemperatureUnit;
};

export const DayForecastCard = memo(({ theme, day, index, expanded, onToggle, temperatureUnit }: Props) => {
  const dayLabel = useMemo(() => {
    if (index === 0) return 'Today';
    return formatDayLong(day.dateISO);
  }, [day.dateISO, index]);

  const dayThemeKey: WeatherThemeKey = useMemo(
    () => themeKeyFrom(day.weatherCode, true, day.windMaxKph),
    [day.weatherCode, day.windMaxKph]
  );

  const emoji = useMemo(() => weatherEmojiForTheme(dayThemeKey), [dayThemeKey]);

  const lines = useMemo(() => {
    const sunrise = day.sunriseISO ? formatTime(day.sunriseISO) : '--';
    const sunset = day.sunsetISO ? formatTime(day.sunsetISO) : '--';
    const items: string[] = [];

    if (dayThemeKey !== 'snow' && typeof day.rainChancePct === 'number' && day.rainChancePct > 0) {
      items.push(`Rain ${formatPct(day.rainChancePct)}`);
    }

    if (dayThemeKey === 'snow' || (typeof day.snowfallCmSum === 'number' && day.snowfallCmSum > 0)) {
      items.push(`Snow ${formatSnowfall(day.snowfallCmSum)}`);
    }

    items.push(`Wind ${formatKph(day.windMaxKph)}`);
    items.push(`Sun ${sunrise} / ${sunset}`);

    return items;
  }, [day.rainChancePct, day.snowfallCmSum, day.windMaxKph, day.sunriseISO, day.sunsetISO]);

  return (
    <BubbleCard
      theme={theme}
      onPress={onToggle}
      accessibilityLabel={`${dayLabel} forecast card`}
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.outline }]}
    >
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: theme.cardAlt, borderColor: theme.outline }]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.day, { color: theme.text }]} numberOfLines={1}>
            {dayLabel}
          </Text>
          <Text style={[styles.hilo, { color: theme.textSoft }]} numberOfLines={1}>
            High {formatTemp(day.tempMaxC, temperatureUnit)}  •  Low {formatTemp(day.tempMinC, temperatureUnit)}
          </Text>
        </View>
        <Text style={[styles.chev, { color: theme.text }]}>{expanded ? '▲' : '▼'}</Text>
      </View>

      <ExpandableBubble theme={theme} expanded={expanded} lines={lines} />
    </BubbleCard>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 32,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  emoji: {
    fontSize: 24
  },
  day: {
    fontSize: 22,
    fontWeight: '900'
  },
  hilo: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: '800'
  },
  chev: {
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 8
  }
});
