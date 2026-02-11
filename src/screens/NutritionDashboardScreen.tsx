import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import DatabaseService from '../services/database.service';
import CircularProgress from '../components/CircularProgress';

export default function NutritionDashboardScreen({ navigation }: any) {
  const [summary, setSummary] = useState<any>(null);
  const [mealLogs, setMealLogs] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Helper to format date for display
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    
    // Check if it's today
    if (dateString === getTodayDateString()) {
      return 'Today';
    }
    
    // Check if it's yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateString === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    }
    
    // Otherwise show the date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      loadDailyData();
    }, [])
  );

  const loadDailyData = async () => {
    try {
      setIsLoading(true);
      const userId = 'demo-user';
      const today = getTodayDateString();
      
      const data = await DatabaseService.getDailyNutritionSummary(userId, today);
      const meals = await DatabaseService.getMealLogs(userId, today);
      
      setSummary(data);
      setMealLogs(meals);

      console.log(`📅 Loaded nutrition data for: ${today}`);
  } catch (error) {
    console.error('Error loading nutrition data:', error);
  } finally {
    setIsLoading(false);
  }
};

  const handleDeleteFood = (logId: string, foodName: string) => {
    Alert.alert(
      'Delete Food',
      `Remove ${foodName} from your log?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.deleteFoodLog(logId);
              loadDailyData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete food');
            }
          },
        },
      ]
    );
  };

  const calculateMealTotal = (mealType: string) => {
    if (!mealLogs) return 0;
    const logs = mealLogs[mealType] || [];
    return logs.reduce((sum: number, log: any) => sum + log.calories, 0);
  };

  const renderMealCard = (
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    icon: string,
    title: string
  ) => {
    const logs = mealLogs?.[mealType] || [];
    const totalCalories = calculateMealTotal(mealType);

    return (
      <View style={styles.mealCard}>
        <View style={styles.mealHeader}>
          <View>
            <Text style={styles.mealTitle}>
              {icon} {title}
            </Text>
            <Text style={styles.mealCalories}>{totalCalories} kcal</Text>
          </View>
          <TouchableOpacity
            style={styles.addMealButton}
            onPress={() =>
              navigation.getParent()?.navigate('FoodSearch', { mealType })
            }
          >
            <Text style={styles.addMealButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Logged Foods */}
        {logs.length > 0 && (
          <View style={styles.foodsList}>
            {logs.map((log: any) => (
              <View key={log.id} style={styles.foodLogItem}>
                <View style={styles.foodLogInfo}>
                  <Text style={styles.foodLogName}>{log.food_name}</Text>
                  <Text style={styles.foodLogDetails}>
                    {log.servings}x serving • {Math.round(log.calories)} kcal
                  </Text>
                  <Text style={styles.foodLogMacros}>
                    P: {Math.round(log.protein)}g • C: {Math.round(log.carbs)}g • F:{' '}
                    {Math.round(log.fats)}g
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteFood(log.id, log.food_name)}
                  style={styles.deleteIcon}
                >
                  <Text style={styles.deleteIconText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {logs.length === 0 && (
          <View style={styles.emptyMeal}>
            <Text style={styles.emptyMealText}>No foods logged yet</Text>
          </View>
        )}
      </View>
    );
  };

  if (isLoading || !summary) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const calorieProgress = Math.min(summary.total_calories / summary.goal_calories, 1);
  const proteinProgress = Math.min(summary.total_protein / summary.goal_protein, 1);
  const carbsProgress = Math.min(summary.total_carbs / summary.goal_carbs, 1);
  const fatsProgress = Math.min(summary.total_fats / summary.goal_fats, 1);
  const waterProgress = Math.min(summary.total_water / summary.goal_water, 1);

  const caloriesRemaining = summary.goal_calories - summary.total_calories;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#27ae60', '#2ecc71']}
        style={styles.topGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nutrition</Text>
          <Text style={styles.headerDate}>
              {formatDisplayDate(getTodayDateString())} • {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                  })}
          </Text>
        </View>

        {/* Circular Calorie Progress */}
        <View style={styles.circularProgressContainer}>
          <CircularProgress
            size={220}
            strokeWidth={18}
            progress={calorieProgress}
            color="#fff"
            backgroundColor="rgba(255,255,255,0.2)"
          >
            <View style={styles.calorieInfo}>
              <Text style={styles.calorieNumber}>
                {caloriesRemaining >= 0 ? caloriesRemaining : 0}
              </Text>
              <Text style={styles.calorieLabel}>
                {caloriesRemaining >= 0 ? 'remaining' : 'over limit'}
              </Text>
              <View style={styles.calorieDivider} />
              <Text style={styles.calorieConsumed}>
                {summary.total_calories} / {summary.goal_calories}
              </Text>
              <Text style={styles.calorieUnit}>kcal</Text>
            </View>
          </CircularProgress>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Macros Card */}
        <View style={styles.macrosCard}>
          <Text style={styles.sectionTitle}>Macronutrients</Text>

          {/* Protein */}
          <View style={styles.macroRow}>
            <View style={styles.macroHeader}>
              <Text style={styles.macroName}>💪 Protein</Text>
              <Text style={styles.macroValues}>
                {summary.total_protein}g / {summary.goal_protein}g
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${proteinProgress * 100}%`, backgroundColor: '#3498db' },
                ]}
              />
            </View>
          </View>

          {/* Carbs */}
          <View style={styles.macroRow}>
            <View style={styles.macroHeader}>
              <Text style={styles.macroName}>🌾 Carbs</Text>
              <Text style={styles.macroValues}>
                {summary.total_carbs}g / {summary.goal_carbs}g
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${carbsProgress * 100}%`, backgroundColor: '#f39c12' },
                ]}
              />
            </View>
          </View>

          {/* Fats */}
          <View style={styles.macroRow}>
            <View style={styles.macroHeader}>
              <Text style={styles.macroName}>🥑 Fats</Text>
              <Text style={styles.macroValues}>
                {summary.total_fats}g / {summary.goal_fats}g
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${fatsProgress * 100}%`, backgroundColor: '#9b59b6' },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Water Tracker Card */}
        <View style={styles.waterCard}>
          <View style={styles.waterHeader}>
            <Text style={styles.sectionTitle}>💧 Water Intake</Text>
            <Text style={styles.waterAmount}>
              {summary.total_water}ml / {summary.goal_water}ml
            </Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${waterProgress * 100}%`, backgroundColor: '#3498db' },
              ]}
            />
          </View>

          {/* Info Card about Daily Reset */}
<View style={styles.infoCard}>
  <Text style={styles.infoIcon}>ℹ️</Text>
  <Text style={styles.infoText}>
    Your nutrition log resets automatically at midnight each day.
  </Text>
</View>

          {/* Quick add water buttons */}
          <View style={styles.waterButtons}>
            <TouchableOpacity
              style={styles.waterButton}
              onPress={async () => {
                await DatabaseService.logWater('demo-user', 250);
                loadDailyData();
              }}
            >
              <Text style={styles.waterButtonText}>+250ml</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.waterButton}
              onPress={async () => {
                await DatabaseService.logWater('demo-user', 500);
                loadDailyData();
              }}
            >
              <Text style={styles.waterButtonText}>+500ml</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.waterButton}
              onPress={async () => {
                await DatabaseService.logWater('demo-user', 750);
                loadDailyData();
              }}
            >
              <Text style={styles.waterButtonText}>+750ml</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Meals Section */}
        <View style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          {renderMealCard('breakfast', '🌅', 'Breakfast')}
          {renderMealCard('lunch', '🌞', 'Lunch')}
          {renderMealCard('dinner', '🌙', 'Dinner')}
          {renderMealCard('snack', '🍪', 'Snacks')}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  topGradient: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerDate: {
    fontSize: 16,
    color: '#e0ffe0',
    marginTop: 4,
  },
  circularProgressContainer: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  calorieInfo: {
    alignItems: 'center',
  },
  calorieNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  calorieLabel: {
    fontSize: 14,
    color: '#e0ffe0',
    marginTop: 4,
  },
  calorieDivider: {
    width: 40,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 8,
  },
  calorieConsumed: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  calorieUnit: {
    fontSize: 12,
    color: '#e0ffe0',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  macrosCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  macroRow: {
    marginBottom: 20,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  macroName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  macroValues: {
    fontSize: 14,
    color: '#999',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  waterCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  waterAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3498db',
  },
  waterButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  waterButton: {
    flex: 1,
    backgroundColor: 'rgba(52, 152, 219, 0.2)',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3498db',
  },
  waterButtonText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
  },
  mealsSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  mealCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  mealCalories: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '600',
  },
  addMealButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#27ae60',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMealButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  foodsList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
    paddingTop: 12,
  },
  foodLogItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  foodLogInfo: {
    flex: 1,
  },
  foodLogName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  foodLogDetails: {
    fontSize: 13,
    color: '#999',
    marginBottom: 2,
  },
  foodLogMacros: {
    fontSize: 12,
    color: '#666',
  },
  deleteIcon: {
    padding: 8,
    marginLeft: 8,
  },
  deleteIconText: {
    fontSize: 20,
  },
  emptyMeal: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyMealText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  infoCard: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52, 152, 219, 0.3)',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#3498db',
    lineHeight: 20,
  },
});