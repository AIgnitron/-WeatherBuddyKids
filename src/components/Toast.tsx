import React, { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import type { AppTheme } from '../theme/theme';
import { useWeatherStore, type ToastMessage } from '../store/useWeatherStore';

type ToastItemProps = {
  toast: ToastMessage;
  theme: AppTheme;
};

const ToastItem = memo(({ toast, theme }: ToastItemProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();

    // Animate out before removal
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(translateY, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
    }, 1200); // Start fade out 300ms before TOAST_DURATION

    return () => clearTimeout(timer);
  }, [opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: theme.card,
          borderColor: theme.outline,
          opacity,
          transform: [{ translateY }]
        }
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      {toast.emoji && <Text style={styles.emoji}>{toast.emoji}</Text>}
      <Text style={[styles.text, { color: theme.text }]}>{toast.text}</Text>
    </Animated.View>
  );
});

type ToastContainerProps = {
  theme: AppTheme;
};

export const ToastContainer = memo(({ theme }: ToastContainerProps) => {
  const toasts = useWeatherStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} theme={theme} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    pointerEvents: 'none'
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 2,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4
  },
  emoji: {
    fontSize: 18,
    marginRight: 8
  },
  text: {
    fontSize: 16,
    fontWeight: '800'
  }
});
