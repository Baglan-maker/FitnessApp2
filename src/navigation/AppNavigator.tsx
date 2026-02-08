import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import WorkoutLogScreen from '../screens/WorkoutLogScreen';
import WorkoutHistoryScreen from '../screens/WorkoutHistoryScreen';

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
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Fitness RPG',
            headerLeft: () => null,
            headerStyle: {
              backgroundColor: '#667eea',
            },
          }}
        />
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
        <Stack.Screen
          name="WorkoutHistory"
          component={WorkoutHistoryScreen}
          options={{
            title: 'History',
            headerStyle: {
              backgroundColor: '#667eea',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}