import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import NutritionDashboardScreen from '../screens/NutritionDashboardScreen';
import WorkoutHistoryScreen from '../screens/WorkoutHistoryScreen';
import { DumbbellIcon, AppleIcon, StatsIcon } from '../components/Icons';
import { colors, borderRadius } from '../styles/theme';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.accent.primary,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <DumbbellIcon size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="NutritionTab"
        component={NutritionDashboardScreen}
        options={{
          tabBarLabel: 'Nutrition',
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <AppleIcon size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="WorkoutsTab"
        component={WorkoutHistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <StatsIcon size={22} color={color} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
    height: 65,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  tabBarItem: {
    paddingVertical: 4,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  iconContainerActive: {
    backgroundColor: colors.glass.white,
  },
});