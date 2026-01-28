import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../components/ScreenShell';
import { BubbleCard } from '../components/BubbleCard';
import { TogglePill } from '../components/TogglePill';
import { useWeatherStore } from '../store/useWeatherStore';
import { useAppTheme } from '../theme/useAppTheme';
import { AboutScreen } from './AboutScreen';
import type { WeatherThemeKey } from '../types';

export function AlertsScreen() {
  const forecast = useWeatherStore((s) => s.forecast);
  const themeChoice = useWeatherStore((s) => s.themeChoice);
  const { themeKey, theme } = useAppTheme(forecast, themeChoice);

  const [aboutOpen, setAboutOpen] = useState(false);

  const notificationsEnabled = useWeatherStore((s) => s.notificationsEnabled);
  const notificationSound = useWeatherStore((s) => s.notificationSound);
  const temperatureUnit = useWeatherStore((s) => s.temperatureUnit);
  const setNotificationsEnabled = useWeatherStore((s) => s.setNotificationsEnabled);
  const setNotificationSound = useWeatherStore((s) => s.setNotificationSound);
  const setThemeChoice = useWeatherStore((s) => s.setThemeChoice);
  const setTemperatureUnit = useWeatherStore((s) => s.setTemperatureUnit);

  const rules = useWeatherStore((s) => s.alertRules);
  const setAlertRule = useWeatherStore((s) => s.setAlertRule);

  // Daily reminder state from store
  const dailyReminderEnabled = useWeatherStore((s) => s.dailyReminderEnabled);
  const dailyReminderHour = useWeatherStore((s) => s.dailyReminderHour);
  const dailyReminderMinute = useWeatherStore((s) => s.dailyReminderMinute);
  const setDailyReminder = useWeatherStore((s) => s.setDailyReminder);

  const ruleById = useMemo(() => {
    const m = new Map(rules.map((r) => [r.id, r]));
    return {
      rain: m.get('rain')!,
      wind: m.get('wind')!,
      cold: m.get('cold')!,
      heat: m.get('heat')!,
      uv: m.get('uv')!
    };
  }, [rules]);

  const header = (
    <View>
      <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
      <Text style={[styles.sub, { color: theme.textSoft }]}>Customize your weather buddy!</Text>
    </View>
  );

  const themeOptions: Array<{ key: 'auto' | WeatherThemeKey; label: string; emoji: string }> = [
    { key: 'auto', label: 'Auto', emoji: '🎨' },
    { key: 'sunny', label: 'Sun', emoji: '☀️' },
    { key: 'rain', label: 'Rain', emoji: '🌧️' },
    { key: 'snow', label: 'Snow', emoji: '❄️' },
    { key: 'wind', label: 'Wind', emoji: '💨' },
    { key: 'night', label: 'Night', emoji: '🌙' },
    { key: 'cloud', label: 'Cloud', emoji: '☁️' }
  ];

  return (
    <ScreenShell themeKey={themeKey} theme={theme} header={header}>
      <BubbleCard theme={theme} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.outline }]}>
        <View style={styles.row}>
          <Text style={styles.bigEmoji}>🔔</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Notifications</Text>
            <Text style={[styles.cardSub, { color: theme.textSoft }]}>Pop! A little message appears.</Text>
          </View>
          <TogglePill
            theme={theme}
            value={notificationsEnabled}
            onChange={(v) => setNotificationsEnabled(v).catch(() => {})}
            labelOn="ON"
            labelOff="OFF"
            accessibilityLabel="Notifications toggle"
          />
        </View>

        <View style={{ height: 12 }} />

        <View style={styles.row}>
          <Text style={styles.bigEmoji}>🔊</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Sound</Text>
            <Text style={[styles.cardSub, { color: theme.textSoft }]}>Ding! (or quiet mode)</Text>
          </View>
          <TogglePill
            theme={theme}
            value={notificationSound}
            onChange={(v) => setNotificationSound(v).catch(() => {})}
            labelOn="ON"
            labelOff="OFF"
            accessibilityLabel="Sound toggle"
          />
        </View>

        <View style={{ height: 12 }} />

        <View style={styles.row}>
          <Text style={styles.bigEmoji}>⏰</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Daily reminder</Text>
            <Text style={[styles.cardSub, { color: theme.textSoft }]}>
              One gentle ping every day.
            </Text>
            <Text style={[styles.cardSubSmall, { color: theme.textSoft }]}>
              Time: {`${dailyReminderHour.toString().padStart(2, '0')}:${dailyReminderMinute.toString().padStart(2, '0')}`}
            </Text>
          </View>
          <TogglePill
            theme={theme}
            value={dailyReminderEnabled}
            onChange={(v) => setDailyReminder(v).catch(() => {})}
            labelOn="ON"
            labelOff="OFF"
            accessibilityLabel="Daily reminder toggle"
          />
        </View>
      </BubbleCard>

      <View style={{ height: 12 }} />

      <BubbleCard theme={theme} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.outline }]}>
        <View style={styles.row}>
          <Text style={styles.bigEmoji}>🧩</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Theme</Text>
            <Text style={[styles.cardSub, { color: theme.textSoft }]}>Pick your favorite colors!</Text>
          </View>
        </View>

        <View style={{ height: 10 }} />

        <View style={styles.themeGrid}>
          {themeOptions.map((opt) => {
            const selected = themeChoice === opt.key;
            return (
              <BubbleCard
                key={opt.key}
                theme={theme}
                onPress={() => setThemeChoice(opt.key).catch(() => {})}
                accessibilityLabel={`Theme ${opt.label}`}
                style={[
                  styles.themeChip,
                  {
                    backgroundColor: selected ? theme.accent : theme.cardAlt,
                    borderColor: theme.outline
                  }
                ]}
              >
                <Text style={styles.themeEmoji}>{opt.emoji}</Text>
                <Text style={[styles.themeLabel, { color: selected ? '#fff' : theme.text }]}>{opt.label}</Text>
              </BubbleCard>
            );
          })}
        </View>
      </BubbleCard>

      <View style={{ height: 12 }} />

      <BubbleCard theme={theme} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.outline }]}>
        <View style={styles.row}>
          <Text style={styles.bigEmoji}>🌡️</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Temperature Unit</Text>
            <Text style={[styles.cardSub, { color: theme.textSoft }]}>{temperatureUnit === 'C' ? 'Celsius (°C)' : 'Fahrenheit (°F)'}</Text>
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
      </BubbleCard>

      <View style={{ height: 12 }} />

      <BubbleCard theme={theme} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.outline }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Weather alerts</Text>
        <Text style={[styles.sectionSub, { color: theme.textSoft }]}>Get a heads-up when weather changes!</Text>

        <View style={{ height: 14 }} />

        <View style={styles.ruleRow}>
          <Text style={styles.ruleEmoji}>🌧️</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Rain alert</Text>
            <Text style={[styles.cardSub, { color: theme.textSoft }]}>Heads up when rain is coming!</Text>
          </View>
          <TogglePill
            theme={theme}
            value={ruleById.rain.enabled}
            onChange={(v) => setAlertRule('rain', { enabled: v }).catch(() => {})}
            labelOn="ON"
            labelOff="OFF"
            accessibilityLabel="Rain alert toggle"
          />
        </View>

        <View style={{ height: 14 }} />

        <View style={styles.ruleRow}>
          <Text style={styles.ruleEmoji}>💨</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Wind alert</Text>
            <Text style={[styles.cardSub, { color: theme.textSoft }]}>Know when it's super windy!</Text>
          </View>
          <TogglePill
            theme={theme}
            value={ruleById.wind.enabled}
            onChange={(v) => setAlertRule('wind', { enabled: v }).catch(() => {})}
            labelOn="ON"
            labelOff="OFF"
            accessibilityLabel="Wind alert toggle"
          />
        </View>

        <View style={{ height: 14 }} />

        <View style={styles.ruleRow}>
          <Text style={styles.ruleEmoji}>❄️</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Cold alert</Text>
            <Text style={[styles.cardSub, { color: theme.textSoft }]}>Bundle up when it's freezing!</Text>
          </View>
          <TogglePill
            theme={theme}
            value={ruleById.cold.enabled}
            onChange={(v) => setAlertRule('cold', { enabled: v }).catch(() => {})}
            labelOn="ON"
            labelOff="OFF"
            accessibilityLabel="Cold alert toggle"
          />
        </View>

        <View style={{ height: 14 }} />

        <View style={styles.ruleRow}>
          <Text style={styles.ruleEmoji}>🥵</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Heat alert</Text>
            <Text style={[styles.cardSub, { color: theme.textSoft }]}>Stay cool on hot days!</Text>
          </View>
          <TogglePill
            theme={theme}
            value={ruleById.heat.enabled}
            onChange={(v) => setAlertRule('heat', { enabled: v }).catch(() => {})}
            labelOn="ON"
            labelOff="OFF"
            accessibilityLabel="Heat alert toggle"
          />
        </View>

        <View style={{ height: 14 }} />

        <View style={styles.ruleRow}>
          <Text style={styles.ruleEmoji}>☀️</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>UV alert</Text>
            <Text style={[styles.cardSub, { color: theme.textSoft }]}>Don't forget sunscreen!</Text>
          </View>
          <TogglePill
            theme={theme}
            value={ruleById.uv.enabled}
            onChange={(v) => setAlertRule('uv', { enabled: v }).catch(() => {})}
            labelOn="ON"
            labelOff="OFF"
            accessibilityLabel="UV alert toggle"
          />
        </View>
      </BubbleCard>

      <View style={{ height: 12 }} />

      {/* About Section */}
      <BubbleCard
        theme={theme}
        onPress={() => setAboutOpen(true)}
        accessibilityLabel="About Weather Buddy Kids"
        style={[styles.card, { backgroundColor: theme.card, borderColor: theme.outline }]}
      >
        <View style={styles.row}>
          <Text style={styles.bigEmoji}>ℹ️</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>About</Text>
            <Text style={[styles.cardSub, { color: theme.textSoft }]}>App info, support & privacy</Text>
          </View>
          <Text style={[styles.chevron, { color: theme.textSoft }]}>›</Text>
        </View>
      </BubbleCard>

      <AboutScreen visible={aboutOpen} theme={theme} onClose={() => setAboutOpen(false)} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: '900'
  },
  sub: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '800'
  },
  card: {
    borderRadius: 30,
    borderWidth: 2,
    padding: 14
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  bigEmoji: {
    fontSize: 28
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900'
  },
  cardSub: {
    marginTop: 1,
    fontSize: 12,
    fontWeight: '800'
  },
  cardSubSmall: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '700'
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  themeChip: {
    width: 98,
    borderWidth: 2,
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  themeEmoji: {
    fontSize: 22
  },
  themeLabel: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '900'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900'
  },
  sectionSub: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '800'
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  ruleEmoji: {
    fontSize: 26
  },
  chevron: {
    fontSize: 32,
    fontWeight: '600'
  }
});

