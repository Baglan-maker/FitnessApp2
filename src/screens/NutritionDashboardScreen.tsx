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
import GlassCard from '../components/GlassCard';
import { AppleIcon, WaterIcon, PlusIcon, CloseIcon, TrophyIcon } from '../components/Icons';
import { colors, borderRadius, spacing, shadows } from '../styles/theme';

export default function NutritionDashboardScreen({ navigation }: any) {
  const [summary, setSummary] = useState<any>(null);
  const [mealLogs, setMealLogs] = useState<any>(null);
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
      const meals = await DatabaseService.getMealLogs(userId, today);
      
      setSummary(data);
      setMealLogs(meals);
    } catch (error) {
      console.error('Error loading nutrition data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFood = (logId: string, foodName: string) => {
    Alert.alert(
      'Delete Food',
      `Remove ${foodName}?`,
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

  const getMealIcon = (mealType: string) => {
    const icons: any = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍪',
    };
    return icons[mealType] || '🍽️';
  };

  const getMealColor = (mealType: string) => {
    const colorMap: any = {
      breakfast: colors.accent.warning,
      lunch: colors.accent.tertiary,
      dinner: colors.accent.secondary,
      snack: colors.accent.success,
    };
    return colorMap[mealType] || colors.accent.primary;
  };

  const renderMealCard = (
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    title: string
  ) => {
    const logs = mealLogs?.[mealType] || [];
    const totalCalories = calculateMealTotal(mealType);
    const mealColor = getMealColor(mealType);
    const isEmpty = logs.length === 0;

    return (
      <GlassCard gradient style={styles.mealCard}>
        {/* Meal Header */}
        <View style={styles.mealHeader}>
          <View style={styles.mealTitleContainer}>
            <View style={[styles.mealIconBadge, { backgroundColor: mealColor + '20' }]}>
              <Text style={styles.mealIconText}>{getMealIcon(mealType)}</Text>
            </View>
            <View>
              <Text style={styles.mealTitle}>{title}</Text>
              <View style={styles.mealCaloriesContainer}>
                {totalCalories > 0 && (
                  <View style={[styles.caloriesBadge, { backgroundColor: mealColor + '20' }]}>
                    <Text style={[styles.mealCalories, { color: mealColor }]}>
                      {totalCalories} kcal
                    </Text>
                  </View>
                )}
                {isEmpty && (
                  <Text style={styles.emptyText}>Empty</Text>
                )}
              </View>
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: mealColor }]}
            onPress={() =>
              navigation.getParent()?.navigate('FoodSearch', { mealType })
            }
          >
            <PlusIcon size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Logged Foods */}
        {logs.length > 0 && (
          <View style={styles.foodsList}>
            {logs.map((log: any, index: number) => (
              <View key={log.id}>
                {index > 0 && <View style={styles.foodDivider} />}
                <View style={styles.foodLogItem}>
                  <View style={styles.foodLogInfo}>
                    <Text style={styles.foodLogName}>{log.food_name}</Text>
                    <View style={styles.foodMacrosRow}>
                      <Text style={styles.foodLogServings}>
                        {log.servings}x serving
                      </Text>
                      <View style={styles.macrosDot} />
                      <Text style={styles.foodLogCalories}>
                        {Math.round(log.calories)} kcal
                      </Text>
                    </View>
                    <View style={styles.macrosChips}>
                      <View style={[styles.macroChip, { backgroundColor: colors.accent.primary + '15' }]}>
                        <Text style={[styles.macroChipText, { color: colors.accent.primary }]}>
                          P {Math.round(log.protein)}g
                        </Text>
                      </View>
                      <View style={[styles.macroChip, { backgroundColor: colors.accent.warning + '15' }]}>
                        <Text style={[styles.macroChipText, { color: colors.accent.warning }]}>
                          C {Math.round(log.carbs)}g
                        </Text>
                      </View>
                      <View style={[styles.macroChip, { backgroundColor: colors.accent.secondary + '15' }]}>
                        <Text style={[styles.macroChipText, { color: colors.accent.secondary }]}>
                          F {Math.round(log.fats)}g
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    onPress={() => handleDeleteFood(log.id, log.food_name)}
                    style={styles.deleteButton}
                  >
                    <CloseIcon size={14} color={colors.text.tertiary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </GlassCard>
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

  // Геймификация: проверка на "отличное" выполнение
  const isExcellentProgress = calorieProgress >= 0.9 && calorieProgress <= 1.1;
  const allMacrosGood = proteinProgress >= 0.8 && carbsProgress >= 0.8 && fatsProgress >= 0.8;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.accent.success, colors.accent.tertiary]}
        style={styles.topGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Nutrition</Text>
            <Text style={styles.headerDate}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.headerIconBadge}>
            <AppleIcon size={28} color="#FFFFFF" />
          </View>
        </View>

        {/* Circular Progress */}
        <View style={styles.circularProgressContainer}>
          <CircularProgress
            size={190}
            strokeWidth={14}
            progress={calorieProgress}
            color="#FFFFFF"
            backgroundColor="rgba(255,255,255,0.2)"
          >
            <View style={styles.calorieInfo}>
              <Text style={styles.calorieNumber}>
                {caloriesRemaining >= 0 ? caloriesRemaining : 0}
              </Text>
              <Text style={styles.calorieLabel}>
                {caloriesRemaining >= 0 ? 'left' : 'over'}
              </Text>
              <View style={styles.calorieDivider} />
              <Text style={styles.calorieConsumed}>
                {summary.total_calories} / {summary.goal_calories}
              </Text>
              <Text style={styles.calorieUnit}>kcal today</Text>
            </View>
          </CircularProgress>
          
          {/* Геймификация: Achievement Badge */}
          {isExcellentProgress && allMacrosGood && (
            <View style={styles.achievementBadge}>
              <TrophyIcon size={16} color={colors.accent.warning} />
              <Text style={styles.achievementText}>Perfect Balance!</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Macros Card with Progress Rings */}
        <GlassCard gradient style={styles.macrosCard}>
          <Text style={styles.sectionTitle}>Macronutrients</Text>

          <View style={styles.macrosGrid}>
            {/* Protein */}
            <View style={styles.macroItem}>
              <View style={styles.macroCircle}>
                <Text style={styles.macroPercentage}>
                  {Math.round(proteinProgress * 100)}%
                </Text>
              </View>
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={styles.macroValue}>
                {summary.total_protein}g / {summary.goal_protein}g
              </Text>
            </View>

            {/* Carbs */}
            <View style={styles.macroItem}>
              <View style={styles.macroCircle}>
                <Text style={styles.macroPercentage}>
                  {Math.round(carbsProgress * 100)}%
                </Text>
              </View>
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={styles.macroValue}>
                {summary.total_carbs}g / {summary.goal_carbs}g
              </Text>
            </View>

            {/* Fats */}
            <View style={styles.macroItem}>
              <View style={styles.macroCircle}>
                <Text style={styles.macroPercentage}>
                  {Math.round(fatsProgress * 100)}%
                </Text>
              </View>
              <Text style={styles.macroLabel}>Fats</Text>
              <Text style={styles.macroValue}>
                {summary.total_fats}g / {summary.goal_fats}g
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Water Card - Геймификация с уровнями */}
        <GlassCard gradient style={styles.waterCard}>
          <View style={styles.waterHeader}>
            <View style={styles.waterTitleRow}>
              <View style={styles.waterIconBadge}>
                <WaterIcon size={18} color={colors.accent.tertiary} />
              </View>
              <Text style={styles.sectionTitle}>Hydration</Text>
            </View>
            <Text style={styles.waterAmount}>
              {summary.total_water}ml
            </Text>
          </View>

          {/* Water Progress Bar */}
          <View style={styles.waterProgressContainer}>
            <LinearGradient
              colors={[colors.accent.tertiary, colors.accent.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.waterProgressFill, { width: `${waterProgress * 100}%` }]}
            />
            {/* Milestones */}
            <View style={styles.waterMilestones}>
              {[0, 25, 50, 75, 100].map((milestone) => (
                <View
                  key={milestone}
                  style={[
                    styles.waterMilestone,
                    waterProgress * 100 >= milestone && styles.waterMilestoneActive,
                  ]}
                />
              ))}
            </View>
          </View>

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
        </GlassCard>

        {/* Meals Section */}
        <View style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          {renderMealCard('breakfast', 'Breakfast')}
          {renderMealCard('lunch', 'Lunch')}
          {renderMealCard('dinner', 'Dinner')}
          {renderMealCard('snack', 'Snacks')}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingText: {
    color: colors.text.primary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  topGradient: {
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerDate: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  headerIconBadge: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularProgressContainer: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  calorieInfo: {
    alignItems: 'center',
  },
  calorieNumber: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  calorieLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  calorieDivider: {
    width: 24,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginVertical: spacing.xs,
  },
  calorieConsumed: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  calorieUnit: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
  },
  achievementText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  macrosCard: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  macrosGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroCircle: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    backgroundColor: colors.glass.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.accent.primary,
  },
  macroPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  macroLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 2,
  },
  macroValue: {
    fontSize: 11,
    color: colors.text.tertiary,
  },
  waterCard: {
    marginBottom: spacing.md,
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  waterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  waterIconBadge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.accent.tertiary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.accent.tertiary,
  },
  waterProgressContainer: {
    height: 10,
    backgroundColor: colors.glass.dark,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.md,
    position: 'relative',
  },
  waterProgressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  waterMilestones: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  waterMilestone: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  waterMilestoneActive: {
    backgroundColor: '#FFFFFF',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  waterButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  waterButton: {
    flex: 1,
    backgroundColor: colors.glass.white,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent.tertiary + '40',
  },
  waterButtonText: {
    color: colors.accent.tertiary,
    fontSize: 12,
    fontWeight: '600',
  },
  mealsSection: {
    marginTop: spacing.sm,
  },
  mealCard: {
    marginBottom: spacing.md,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  mealTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  mealIconBadge: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealIconText: {
    fontSize: 20,
  },
  mealTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  mealCaloriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  caloriesBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  mealCalories: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  foodsList: {
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
    paddingTop: spacing.sm,
  },
  foodLogItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  foodLogInfo: {
    flex: 1,
  },
  foodLogName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  foodMacrosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  foodLogServings: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  macrosDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.text.tertiary,
    marginHorizontal: spacing.xs,
  },
  foodLogCalories: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  macrosChips: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  macroChip: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  macroChipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  deleteButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  foodDivider: {
    height: 1,
    backgroundColor: colors.glass.border,
    marginVertical: spacing.xs,
  },
});