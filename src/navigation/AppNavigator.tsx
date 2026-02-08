import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import WorkoutLogScreen from '../screens/WorkoutLogScreen';
import BottomTabNavigator from './BottomTabNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0f0f1e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            title: 'Create Account',
            headerBackTitle: 'Back',
            headerStyle: {
              backgroundColor: '#0f0f1e',
            },
          }}
        />
        {/* Main app with bottom tabs */}
        <Stack.Screen
          name="Main"
          component={BottomTabNavigator}
          options={{
            headerShown: false,
          }}
        />
        {/* Workout log is a modal-style screen */}
        <Stack.Screen
          name="WorkoutLog"
          component={WorkoutLogScreen}
          options={{
            title: 'Log Workout',
            headerStyle: {
              backgroundColor: '#667eea',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}