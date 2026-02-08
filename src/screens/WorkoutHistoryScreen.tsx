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
import { Workout } from '../types/workout.types';
import { format } from 'date-fns';

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
      const userId = 'demo-user'; // TODO: Get from auth context
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
      'Are you sure you want to delete this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.deleteWorkout(workoutId);
              loadWorkouts(); // Refresh list
              Alert.alert('Success', 'Workout deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete workout');
            }
          },
        },
      ]
    );
  };

  const renderWorkoutCard = ({ item }: { item: Workout }) => {
    const totalSets = item.exercises.reduce(
      (sum, ex) => sum + ex.sets.length,
      0
    );
    const completedSets = item.exercises.reduce(
      (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
      0
    );

    const workoutDate = new Date(item.startTime);
    const dateStr = format(workoutDate, 'MMM dd, yyyy');
    const timeStr = format(workoutDate, 'h:mm a');

    return (
      <View style={styles.workoutCard}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e']}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Header */}
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardDate}>{dateStr}</Text>
              <Text style={styles.cardTime}>{timeStr}</Text>
            </View>
            <View style={styles.xpBadge}>
              <Text style={styles.xpText}>⚡ {item.xpEarned || 0} XP</Text>
            </View>
          </View>

          {/* Exercise List */}
          <View style={styles.exerciseList}>
            {item.exercises.slice(0, 3).map((exercise, index) => (
              <View key={exercise.id} style={styles.exerciseItem}>
                <Text style={styles.exerciseBullet}>•</Text>
                <Text style={styles.exerciseText}>
                  {exercise.name} - {exercise.sets.length} sets
                </Text>
              </View>
            ))}
            {item.exercises.length > 3 && (
              <Text style={styles.moreText}>
                +{item.exercises.length - 3} more exercises
              </Text>
            )}
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{item.exercises.length}</Text>
              <Text style={styles.statLabel}>Exercises</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{completedSets}/{totalSets}</Text>
              <Text style={styles.statLabel}>Sets</Text>
            </View>
          </View>

          {/* Delete Button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteWorkout(item.id)}
          >
            <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>💪</Text>
      <Text style={styles.emptyTitle}>No Workouts Yet</Text>
      <Text style={styles.emptyText}>
        Start your first workout to see it here!
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('WorkoutLog')}
      >
        <LinearGradient
          colors={['#f093fb', '#f5576c']}
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
        colors={['#0f0f1e', '#1a1a2e']}
        style={styles.gradient}
      >
        {/* Header Stats */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Workout History</Text>
          <Text style={styles.headerSubtitle}>
            {workouts.length} total workout{workouts.length !== 1 ? 's' : ''}
          </Text>
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
    backgroundColor: '#0f0f1e',
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  workoutCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardTime: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  xpBadge: {
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#667eea',
  },
  xpText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: 'bold',
  },
  exerciseList: {
    marginBottom: 16,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  exerciseBullet: {
    color: '#667eea',
    fontSize: 20,
    marginRight: 8,
    lineHeight: 20,
  },
  exerciseText: {
    color: '#fff',
    fontSize: 14,
  },
  moreText: {
    color: '#999',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
    marginLeft: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.2)',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  deleteButton: {
    backgroundColor: 'rgba(245, 87, 108, 0.1)',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 87, 108, 0.3)',
  },
  deleteButtonText: {
    color: '#f5576c',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  emptyButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});