import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import DatabaseService from '../services/database.service';
import CircularProgress from '../components/CircularProgress';
import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabaseSync('fitnessrpg.db');

const { width } = Dimensions.get('window');

export default function NutritionDashboardScreen({ navigation }: any) {
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadDailyData();
    }, [])
  );

  const loadDailyData = async () => {
    try {
      setIsLoading(true);
      const userId = 'demo-user';
      const today = new Date().toISOString().split('T')[0];
      
      const data = await DatabaseService.getDailyNutritionSummary(userId, today);
      setSummary(data);
    } catch (error) {
      console.error('Error loading nutrition data:', error);
    } finally {
      setIsLoading(false);
    }
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
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
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
            
        {/* Temporary test button - remove later */}
<TouchableOpacity
  style={{
    backgroundColor: '#f093fb',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  }}
  onPress={async () => {
    // Add sample food log
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    
    await db.runAsync(
      `INSERT INTO nutrition_logs (id, user_id, food_id, food_name, meal_type, servings, calories, protein, carbs, fats, logged_at, date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Date.now().toString(),
        'demo-user',
        'p1',
        'Chicken Breast',
        'lunch',
        1,
        165,
        31,
        0,
        3.6,
        now.toISOString(),
        date,
      ]
    );
    
    loadDailyData();
  }}
>
  <Text style={{ color: '#fff', fontWeight: 'bold' }}>
    🧪 Add Test Food (Chicken 165 cal)
  </Text>
</TouchableOpacity>
        {/* Placeholder for Meals - Coming in Part 4 */}
        <View style={styles.mealsPlaceholder}>
          <Text style={styles.placeholderText}>🍽️ Meals Timeline</Text>
          <Text style={styles.placeholderSubtext}>Coming in Part 4!</Text>
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
  mealsPlaceholder: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 32,
    marginTop: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#2a2a3e',
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#999',
  },
});