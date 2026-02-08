import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import NutritionDashboardScreen from '../screens/NutritionDashboardScreen';
import WorkoutHistoryScreen from '../screens/WorkoutHistoryScreen';

const Tab = createBottomTabNavigator();

// Custom tab bar icon component
const TabIcon = ({ focused, emoji }: { focused: boolean; emoji: string }) => {
  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      <Text style={[styles.iconEmoji, focused && styles.iconEmojiActive]}>
        {emoji}
      </Text>
    </View>
  );
};

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} emoji="🏠" />
          ),
        }}
      />
      <Tab.Screen
        name="NutritionTab"
        component={NutritionDashboardScreen}
        options={{
          tabBarLabel: 'Nutrition',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} emoji="🍎" />
          ),
        }}
      />
      <Tab.Screen
        name="WorkoutsTab"
        component={WorkoutHistoryScreen}
        options={{
          tabBarLabel: 'Workouts',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} emoji="💪" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#1a1a2e',
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
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
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  iconContainerActive: {
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
  },
  iconEmoji: {
    fontSize: 24,
    opacity: 0.6,
  },
  iconEmojiActive: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
});