import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TodayScreen } from '../screens/TodayScreen';
import { WeekScreen } from '../screens/WeekScreen';
import { BuddyScreen } from '../screens/BuddyScreen';
import { AlertsScreen } from '../screens/AlertsScreen';
import { TabIconBubble } from '../components/TabIconBubble';

export type TabsParamList = { Today: undefined; Week: undefined; Buddy: undefined; Settings: undefined };

const Tab = createBottomTabNavigator<TabsParamList>();

export function Tabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Today"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: 64 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom,
          borderTopWidth: 0,
          backgroundColor: 'rgba(255,255,255,0.55)'
        },
        tabBarLabelStyle: { fontSize: 13, fontWeight: '800' },
        tabBarActiveTintColor: '#111827',
        tabBarInactiveTintColor: '#374151',
        tabBarIcon: ({ focused }) => {
          const emoji =
            route.name === 'Today'
              ? '🏠'
              : route.name === 'Week'
                ? '📅'
                : route.name === 'Buddy'
                  ? '🧸'
                  : '⚙️';
          return <TabIconBubble emoji={emoji} focused={focused} />;
        }
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} options={{ tabBarLabel: 'Today' }} />
      <Tab.Screen name="Week" component={WeekScreen} options={{ tabBarLabel: 'Week' }} />
      <Tab.Screen name="Buddy" component={BuddyScreen} options={{ tabBarLabel: 'Buddy' }} />
      <Tab.Screen name="Settings" component={AlertsScreen} options={{ tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  );
}
