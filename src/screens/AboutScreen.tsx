import React, { memo, useCallback } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { BubbleCard } from '../components/BubbleCard';
import { tapHaptic } from '../utils/haptics';
import type { AppTheme } from '../theme/theme';

const APP_NAME = 'Weather Buddy Kids';
const COMPANY = 'Aignitron Inc.';
const VERSION = '1.0';
const BUILD_NUMBER = '1.0.1993';
const DATA_SOURCE = 'Weather data by Open-Meteo';
const SUPPORT_EMAIL = 'WeatherBuddyKids@aignitron.com';
const PRIVACY_URL = 'https://www.aignitron.com/AIApps/WeatherBuddy/Privacy';

type Props = {
  visible: boolean;
  theme: AppTheme;
  onClose: () => void;
};

const LinkButton = memo(({
  theme,
  emoji,
  title,
  subtitle,
  onPress,
  accessibilityLabel
}: {
  theme: AppTheme;
  emoji: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  accessibilityLabel: string;
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePress = useCallback(async () => {
    await tapHaptic();
    scale.value = withSpring(0.95, { damping: 14, stiffness: 240 });
    requestAnimationFrame(() => {
      scale.value = withSpring(1, { damping: 14, stiffness: 240 });
    });
    onPress();
  }, [onPress, scale]);

  return (
    <Pressable onPress={handlePress} accessibilityRole="link" accessibilityLabel={accessibilityLabel}>
      <Animated.View
        style={[
          styles.linkButton,
          { backgroundColor: theme.accent, borderColor: theme.outline },
          animatedStyle
        ]}
      >
        <Text style={styles.linkEmoji}>{emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.linkTitle}>{title}</Text>
          <Text style={[styles.linkSub, { color: 'rgba(255,255,255,0.85)' }]}>{subtitle}</Text>
        </View>
        <Text style={styles.linkArrow}>→</Text>
      </Animated.View>
    </Pressable>
  );
});

export const AboutScreen = memo(({ visible, theme, onClose }: Props) => {
  const insets = useSafeAreaInsets();

  const openPrivacy = useCallback(async () => {
    try {
      const supported = await Linking.canOpenURL(PRIVACY_URL);
      if (supported) {
        await Linking.openURL(PRIVACY_URL);
      } else {
        Alert.alert('Oops!', `Can't open link. Visit:\n${PRIVACY_URL}`);
      }
    } catch {
      Alert.alert('Oops!', `Can't open link. Visit:\n${PRIVACY_URL}`);
    }
  }, []);

  const openEmail = useCallback(async () => {
    const mailUrl = `mailto:${SUPPORT_EMAIL}`;
    try {
      const supported = await Linking.canOpenURL(mailUrl);
      if (supported) {
        await Linking.openURL(mailUrl);
      } else {
        Alert.alert('Contact Us', `Email us at:\n${SUPPORT_EMAIL}`);
      }
    } catch {
      Alert.alert('Contact Us', `Email us at:\n${SUPPORT_EMAIL}`);
    }
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
    >
      <View style={[styles.root, { backgroundColor: theme.bgBottom }]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <View style={styles.topRow}>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={[styles.backButton, { backgroundColor: theme.cardAlt, borderColor: theme.outline }]}
            >
              <Ionicons name="chevron-back" size={26} color={theme.text} />
            </Pressable>
            <Text style={[styles.title, { color: theme.text }]}>About</Text>
            <View style={styles.spacer} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* App Info Card */}
          <BubbleCard
            theme={theme}
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.outline }]}
          >
            <View style={styles.appHeader}>
              <Text style={styles.appEmoji}>🌤️</Text>
              <Text style={[styles.appName, { color: theme.text }]}>{APP_NAME}</Text>
              <Text style={[styles.company, { color: theme.textSoft }]}>{COMPANY}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSoft }]}>Version</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{VERSION}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSoft }]}>Build</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{BUILD_NUMBER}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.dataSource}>
              <Text style={styles.dataEmoji}>📊</Text>
              <Text style={[styles.dataText, { color: theme.textSoft }]}>{DATA_SOURCE}</Text>
            </View>
          </BubbleCard>

          <View style={{ height: 16 }} />

          {/* Links */}
          <LinkButton
            theme={theme}
            emoji="📧"
            title="Contact Support"
            subtitle={SUPPORT_EMAIL}
            onPress={openEmail}
            accessibilityLabel={`Send email to ${SUPPORT_EMAIL}`}
          />

          <View style={{ height: 12 }} />

          <LinkButton
            theme={theme}
            emoji="🔒"
            title="Privacy Policy"
            subtitle="How we protect your data"
            onPress={openPrivacy}
            accessibilityLabel="Open privacy policy"
          />

          <View style={{ height: 24 }} />

          {/* Footer */}
          <Text style={[styles.footer, { color: theme.textSoft }]}>
            Made with 💜 for kids everywhere
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  header: {
    paddingHorizontal: 16
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  spacer: {
    width: 48,
    height: 48
  },
  title: {
    fontSize: 28,
    fontWeight: '900'
  },
  content: {
    padding: 16
  },
  card: {
    borderRadius: 30,
    borderWidth: 2,
    padding: 20
  },
  appHeader: {
    alignItems: 'center',
    paddingVertical: 8
  },
  appEmoji: {
    fontSize: 56,
    marginBottom: 8
  },
  appName: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center'
  },
  company: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginVertical: 16
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '800'
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '900'
  },
  dataSource: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  dataEmoji: {
    fontSize: 18
  },
  dataText: {
    fontSize: 13,
    fontWeight: '800'
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 2,
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 12
  },
  linkEmoji: {
    fontSize: 26
  },
  linkTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#fff'
  },
  linkSub: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2
  },
  linkArrow: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff'
  },
  footer: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center'
  }
});
