import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TodayScreen } from '../screens/TodayScreen';
import { WeekScreen } from '../screens/WeekScreen';
import { BuddyScreen } from '../screens/BuddyScreen';
import { TabIconBubble } from '../components/TabIconBubble';

export type TabsParamList = { Today: undefined; Week: undefined; Buddy: undefined };

const Tab = createBottomTabNavigator<TabsParamList>();

export function Tabs() {
  return (
    <Tab.Navigator
      initialRouteName="Today"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: 86,
          paddingTop: 10,
          paddingBottom: 18,
          borderTopWidth: 0,
          backgroundColor: 'rgba(255,255,255,0.55)'
        },
        tabBarLabelStyle: { fontSize: 13, fontWeight: '800' },
        tabBarActiveTintColor: '#111827',
        tabBarInactiveTintColor: '#374151',
        tabBarIcon: ({ focused }) => {
          const emoji = route.name === 'Today' ? '🏠' : route.name === 'Week' ? '📅' : '🧸';
          return <TabIconBubble emoji={emoji} focused={focused} />;
        }
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} options={{ tabBarLabel: 'Today' }} />
      <Tab.Screen name="Week" component={WeekScreen} options={{ tabBarLabel: 'Week' }} />
      <Tab.Screen name="Buddy" component={BuddyScreen} options={{ tabBarLabel: 'Buddy' }} />
    </Tab.Navigator>
  );
}
