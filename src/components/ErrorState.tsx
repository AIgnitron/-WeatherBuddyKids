import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BigCartoonButton } from './BigCartoonButton';
import type { AppTheme } from '../theme/theme';

type Props = {
  theme: AppTheme;
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export const ErrorState = memo(({ theme, title = 'Oops!', message = 'Clouds got in the way. Try again!', onRetry }: Props) => {
  return (
    <View style={[styles.wrap, { backgroundColor: theme.bgBottom }]}>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.outline }]}> 
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.msg, { color: theme.textSoft }]}>{message}</Text>
        {onRetry ? (
          <View style={{ marginTop: 14 }}>
            <BigCartoonButton theme={theme} emoji="🔄" label="Try" onPress={onRetry} accessibilityLabel="Try again" />
          </View>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  card: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 32,
    borderWidth: 2,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center'
  },
  msg: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 8
  }
});
