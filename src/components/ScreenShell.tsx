import React, { memo } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedBackground } from './AnimatedBackground';
import type { WeatherThemeKey } from '../types';
import type { AppTheme } from '../theme/theme';

type Props = {
  themeKey: WeatherThemeKey;
  theme: AppTheme;
  header?: React.ReactNode;
  children: React.ReactNode;
  scroll?: boolean;
  contentPadding?: number;
};

export const ScreenShell = memo(({ themeKey, theme, header, children, scroll = true, contentPadding = 16 }: Props) => {
  return (
    <View style={[styles.root, { backgroundColor: theme.bgBottom }]}> 
      <AnimatedBackground themeKey={themeKey} theme={theme} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        {header}
      </SafeAreaView>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, { padding: contentPadding }]}
          showsVerticalScrollIndicator={false}
          bounces
          // @ts-expect-error web ScrollView props
          keyboardShouldPersistTaps={Platform.OS === 'web' ? 'always' : 'handled'}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, { padding: contentPadding }]}>{children}</View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  safe: {
    paddingHorizontal: 16,
    paddingTop: 6
  },
  content: {
    paddingBottom: 120
  }
});
