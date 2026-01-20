import React, { memo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

type Props = {
  title?: string;
  message?: string;
};

export const LoadingState = memo(({ title = 'Loading...', message = 'Getting the sky ready...' }: Props) => {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <ActivityIndicator size="large" />
      <Text style={styles.msg}>{message}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFF'
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 14
  },
  msg: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 14,
    textAlign: 'center'
  }
});
