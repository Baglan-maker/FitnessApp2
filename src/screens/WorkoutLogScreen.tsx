import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Exercise, Set, Workout } from '../types/workout.types';
import DatabaseService from '../services/database.service';

export default function WorkoutLogScreen({ navigation }: any) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [currentExerciseName, setCurrentExerciseName] = useState('');
  const [workoutStartTime] = useState(new Date().toISOString());
  const [xpEarned, setXpEarned] = useState(0);

  // Popular exercises for quick selection
  const popularExercises = [
    { name: 'Bench Press', type: 'strength' as const, icon: '💪' },
    { name: 'Squat', type: 'strength' as const, icon: '🦵' },
    { name: 'Deadlift', type: 'strength' as const, icon: '🏋️' },
    { name: 'Pull-ups', type: 'strength' as const, icon: '🔥' },
    { name: 'Running', type: 'cardio' as const, icon: '🏃' },
    { name: 'Push-ups', type: 'strength' as const, icon: '⚡' },
  ];

  const addExercise = (name: string, type: 'strength' | 'cardio' | 'flexibility') => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name,
      sets: [],
      exerciseType: type,
    };
    setExercises([...exercises, newExercise]);
    setShowAddExercise(false);
    setCurrentExerciseName('');
  };

  const addSet = (exerciseId: string) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: [
                ...ex.sets,
                {
                  id: Date.now().toString(),
                  reps: 0,
                  weight: 0,
                  completed: false,
                },
              ],
            }
          : ex
      )
    );
  };

  const updateSet = (
    exerciseId: string,
    setId: string,
    field: 'reps' | 'weight',
    value: string
  ) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((set) =>
                set.id === setId
                  ? { ...set, [field]: parseInt(value) || 0 }
                  : set
              ),
            }
          : ex
      )
    );
  };

  const toggleSetComplete = (exerciseId: string, setId: string) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((set) =>
                set.id === setId
                  ? { ...set, completed: !set.completed }
                  : set
              ),
            }
          : ex
      )
    );
    
    // Add XP for completing a set
    setXpEarned((prev) => prev + 10);
  };

  const deleteExercise = (exerciseId: string) => {
    setExercises(exercises.filter((ex) => ex.id !== exerciseId));
  };

  const saveWorkout = async () => {
    if (exercises.length === 0) {
      Alert.alert('No Exercises', 'Add at least one exercise to save workout');
      return;
    }
  
    const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const completedSets = exercises.reduce(
      (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
      0
    );
  
    try {
      // Create workout object
      const workout: Workout = {
        id: Date.now().toString(),
        userId: 'demo-user', // TODO: Replace with actual user ID from auth
        exercises: exercises,
        startTime: workoutStartTime,
        endTime: new Date().toISOString(),
        xpEarned: xpEarned,
      };
  
      // Save to database
      await DatabaseService.saveWorkout(workout);
  
      Alert.alert(
        '🎉 Workout Saved!',
        `You earned ${xpEarned} XP!\n\nCompleted ${completedSets}/${totalSets} sets\n${exercises.length} exercises`,
        [
          {
            text: 'Awesome!',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save workout. Please try again.');
      console.error('Save workout error:', error);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Header with XP Counter */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Active Workout</Text>
            <Text style={styles.headerSubtitle}>
              {exercises.length} exercises
            </Text>
          </View>
          <View style={styles.xpBadge}>
            <Text style={styles.xpText}>⚡ {xpEarned} XP</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Exercise List */}
        {exercises.map((exercise, index) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <View>
                <Text style={styles.exerciseNumber}>Exercise #{index + 1}</Text>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
              </View>
              <TouchableOpacity
                onPress={() => deleteExercise(exercise.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </TouchableOpacity>
            </View>

            {/* Sets */}
            {exercise.sets.map((set, setIndex) => (
              <View key={set.id} style={styles.setRow}>
                <Text style={styles.setNumber}>Set {setIndex + 1}</Text>
                
                <TextInput
                  style={styles.setInput}
                  placeholder="Reps"
                  keyboardType="number-pad"
                  value={set.reps?.toString() || ''}
                  onChangeText={(val) =>
                    updateSet(exercise.id, set.id, 'reps', val)
                  }
                  placeholderTextColor="#999"
                />

                <TextInput
                  style={styles.setInput}
                  placeholder="Weight"
                  keyboardType="decimal-pad"
                  value={set.weight?.toString() || ''}
                  onChangeText={(val) =>
                    updateSet(exercise.id, set.id, 'weight', val)
                  }
                  placeholderTextColor="#999"
                />

                <TouchableOpacity
                  style={[
                    styles.checkButton,
                    set.completed && styles.checkButtonComplete,
                  ]}
                  onPress={() => toggleSetComplete(exercise.id, set.id)}
                >
                  <Text style={styles.checkButtonText}>
                    {set.completed ? '✓' : '○'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Add Set Button */}
            <TouchableOpacity
              style={styles.addSetButton}
              onPress={() => addSet(exercise.id)}
            >
              <Text style={styles.addSetButtonText}>+ Add Set</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Quick Add Exercise Buttons */}
        <View style={styles.quickAddSection}>
          <Text style={styles.sectionTitle}>Quick Add Exercise</Text>
          <View style={styles.quickAddGrid}>
            {popularExercises.map((ex) => (
              <TouchableOpacity
                key={ex.name}
                style={styles.quickAddCard}
                onPress={() => addExercise(ex.name, ex.type)}
              >
                <Text style={styles.quickAddIcon}>{ex.icon}</Text>
                <Text style={styles.quickAddText}>{ex.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Exercise Button */}
        <TouchableOpacity
          style={styles.customExerciseButton}
          onPress={() => setShowAddExercise(true)}
        >
          <Text style={styles.customExerciseText}>➕ Add Custom Exercise</Text>
        </TouchableOpacity>

        {/* Save Workout Button */}
        {exercises.length > 0 && (
          <TouchableOpacity style={styles.saveButton} onPress={saveWorkout}>
            <LinearGradient
              colors={['#f093fb', '#f5576c']}
              style={styles.saveButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.saveButtonText}>🏆 Complete Workout</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Custom Exercise Modal */}
      <Modal
        visible={showAddExercise}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddExercise(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Custom Exercise</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Exercise name (e.g., Bicep Curls)"
              value={currentExerciseName}
              onChangeText={setCurrentExerciseName}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowAddExercise(false);
                  setCurrentExerciseName('');
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonAdd]}
                onPress={() => {
                  if (currentExerciseName.trim()) {
                    addExercise(currentExerciseName.trim(), 'strength');
                  }
                }}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                  Add
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e0ff',
    marginTop: 4,
  },
  xpBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  xpText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  exerciseCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseNumber: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  deleteButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 20,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  setNumber: {
    color: '#999',
    fontSize: 14,
    width: 50,
  },
  setInput: {
    flex: 1,
    backgroundColor: '#0f0f1e',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  checkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a3e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3a3a4e',
  },
  checkButtonComplete: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addSetButton: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#667eea',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addSetButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  quickAddSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  quickAddGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAddCard: {
    width: '31%',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  quickAddIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  quickAddText: {
    color: '#fff',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
  },
  customExerciseButton: {
    marginTop: 16,
    paddingVertical: 16,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  customExerciseText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#0f0f1e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2a2a3e',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#2a2a3e',
  },
  modalButtonAdd: {
    backgroundColor: '#667eea',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});