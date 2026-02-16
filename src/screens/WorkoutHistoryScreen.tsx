import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import DatabaseService from '../services/database.service';
import GlassCard from '../components/GlassCard';
import { TrophyIcon, FireIcon, DumbbellIcon } from '../components/Icons';
import { Workout } from '../types/workout.types';
import { format } from 'date-fns';
import { colors, borderRadius, spacing, shadows } from '../styles/theme';

export default function WorkoutHistoryScreen({ navigation }: any) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadWorkouts();
    }, [])
  );

  const loadWorkouts = async () => {
    try {
      setIsLoading(true);
      const userId = 'demo-user';
      const data = await DatabaseService.getWorkouts(userId);
      setWorkouts(data);
    } catch (error) {
      console.error('Error loading workouts:', error);
      Alert.alert('Error', 'Failed to load workout history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWorkout = (workoutId: string) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.deleteWorkout(workoutId);
              loadWorkouts();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete workout');
            }
          },
        },
      ]
    );
  };

  const renderWorkoutCard = ({ item, index }: { item: Workout; index: number }) => {
    const totalSets = item.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const completedSets = item.exercises.reduce(
      (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
      0
    );

    const workoutDate = new Date(item.startTime);
    const dateStr = format(workoutDate, 'MMM dd, yyyy');
    const timeStr = format(workoutDate, 'h:mm a');
    
    const completionRate = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
    const isExcellent = completionRate === 100;

    // Геймификация: ранги по XP
    const getRankBadge = () => {
      const xp = item.xpEarned || 0;
      if (xp >= 200) return { emoji: '👑', label: 'Legend', color: colors.accent.warning };
      if (xp >= 150) return { emoji: '💎', label: 'Elite', color: colors.accent.primary };
      if (xp >= 100) return { emoji: '⭐', label: 'Pro', color: colors.accent.tertiary };
      return { emoji: '🔥', label: 'Good', color: colors.accent.success };
    };

    const rank = getRankBadge();

    return (
      <GlassCard gradient style={styles.workoutCard}>
        <View style={styles.cardContent}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View>
              <View style={styles.dateRow}>
                <Text style={styles.cardDate}>{dateStr}</Text>
                {isExcellent && (
                  <View style={styles.perfectBadge}>
                    <TrophyIcon size={12} color={colors.accent.warning} />
                    <Text style={styles.perfectText}>Perfect!</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardTime}>{timeStr}</Text>
            </View>
            
            <View style={[styles.rankBadge, { backgroundColor: rank.color + '20' }]}>
              <Text style={styles.rankEmoji}>{rank.emoji}</Text>
              <Text style={[styles.rankLabel, { color: rank.color }]}>{rank.label}</Text>
            </View>
          </View>

          {/* XP Bar */}
          <View style={styles.xpContainer}>
            <View style={styles.xpBar}>
              <LinearGradient
                colors={[colors.accent.primary, colors.accent.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.xpBarFill}
              />
            </View>
            <Text style={styles.xpText}>+{item.xpEarned || 0} XP</Text>
          </View>

          {/* Exercise List */}
          <View style={styles.exerciseList}>
            {item.exercises.slice(0, 3).map((exercise) => (
              <View key={exercise.id} style={styles.exerciseItem}>
                <View style={styles.exerciseBullet} />
                <Text style={styles.exerciseText}>
                  {exercise.name}
                </Text>
                <View style={styles.setsChip}>
                  <Text style={styles.setsChipText}>{exercise.sets.length} sets</Text>
                </View>
              </View>
            ))}
            {item.exercises.length > 3 && (
              <Text style={styles.moreText}>
                +{item.exercises.length - 3} more
              </Text>
            )}
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <DumbbellIcon size={16} color={colors.accent.primary} />
              <Text style={styles.statValue}>{item.exercises.length}</Text>
              <Text style={styles.statLabel}>exercises</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <FireIcon size={16} color={colors.accent.warning} />
              <Text style={styles.statValue}>{completedSets}/{totalSets}</Text>
              <Text style={styles.statLabel}>sets</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={[styles.completionDot, { 
                backgroundColor: completionRate === 100 
                  ? colors.accent.success 
                  : completionRate >= 75 
                  ? colors.accent.warning 
                  : colors.accent.danger 
              }]} />
              <Text style={styles.statValue}>{Math.round(completionRate)}%</Text>
              <Text style={styles.statLabel}>done</Text>
            </View>
          </View>

          {/* Delete Button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteWorkout(item.id)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <DumbbellIcon size={64} color={colors.accent.primary} />
      </View>
      <Text style={styles.emptyTitle}>No Workouts Yet</Text>
      <Text style={styles.emptyText}>
        Start your first workout to see it here and earn XP!
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.getParent()?.navigate('WorkoutLog')}
      >
        <LinearGradient
          colors={[colors.accent.primary, colors.accent.secondary]}
          style={styles.emptyButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.emptyButtonText}>Start Workout</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>History</Text>
            <Text style={styles.headerSubtitle}>
              {workouts.length} workout{workouts.length !== 1 ? 's' : ''} completed
            </Text>
          </View>
          {workouts.length > 0 && (
            <View style={styles.totalXpBadge}>
              <TrophyIcon size={18} color={colors.accent.warning} />
              <Text style={styles.totalXpText}>
                {workouts.reduce((sum, w) => sum + (w.xpEarned || 0), 0)} XP
              </Text>
            </View>
          )}
        </View>

        {/* Workout List */}
        <FlatList
          data={workouts}
          renderItem={renderWorkoutCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={!isLoading ? renderEmptyState : null}
          refreshing={isLoading}
          onRefresh={loadWorkouts}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  gradient: {
    flex: 1,
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
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 4,
  },
  totalXpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.glass.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  totalXpText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  workoutCard: {
    marginBottom: spacing.md,
  },
  cardContent: {
    padding: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  perfectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent.warning + '20',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  perfectText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.accent.warning,
  },
  cardTime: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  rankEmoji: {
    fontSize: 14,
  },
  rankLabel: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  xpBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.glass.dark,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  xpBarFill: {
    width: '100%',
    height: '100%',
  },
  xpText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.accent.primary,
  },
  exerciseList: {
    marginBottom: spacing.md,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  exerciseBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent.primary,
  },
  exerciseText: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 13,
  },
  setsChip: {
    backgroundColor: colors.glass.white,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  setsChipText: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  moreText: {
    color: colors.text.tertiary,
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
    marginLeft: 16,
  },
  statsRow: {
    flexDirection: 'row',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.glass.border,
  },
  statValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: 10,
    color: colors.text.tertiary,
  },
  completionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  deleteButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.glass.dark,
    borderRadius: borderRadius.sm,
  },
  deleteButtonText: {
    color: colors.accent.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 120,
    paddingHorizontal: spacing.xxxl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: colors.glass.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    lineHeight: 20,
  },
  emptyButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    width: '100%',
  },
  emptyButtonGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});