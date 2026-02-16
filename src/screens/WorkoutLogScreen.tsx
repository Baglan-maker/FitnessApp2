import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DatabaseService from '../services/database.service';
import GlassCard from '../components/GlassCard';
import { 
  PlusIcon, 
  CloseIcon, 
  CheckIcon, 
  FireIcon,
  TrophyIcon,
  LightningIcon,
  DumbbellIcon,
} from '../components/Icons';
import { Exercise, Set, Workout } from '../types/workout.types';
import { colors, borderRadius, spacing, shadows } from '../styles/theme';

export default function WorkoutLogScreen({ navigation }: any) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [currentExerciseName, setCurrentExerciseName] = useState('');
  const [workoutStartTime] = useState(new Date().toISOString());
  const [xpEarned, setXpEarned] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState({ oldLevel: 0, newLevel: 0 });

  // Animation values
  const xpPulse = useRef(new Animated.Value(1)).current;
  const levelUpScale = useRef(new Animated.Value(0)).current;
  const levelUpOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (xpEarned > 0) {
      Animated.sequence([
        Animated.timing(xpPulse, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(xpPulse, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [xpEarned]);

  const popularExercises = [
    { name: 'Bench Press', type: 'strength' as const },
    { name: 'Squat', type: 'strength' as const },
    { name: 'Deadlift', type: 'strength' as const },
    { name: 'Pull-ups', type: 'strength' as const },
    { name: 'Running', type: 'cardio' as const },
    { name: 'Push-ups', type: 'strength' as const },
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
    
    setXpEarned((prev) => prev + 10);
  };

  const deleteExercise = (exerciseId: string) => {
    setExercises(exercises.filter((ex) => ex.id !== exerciseId));
  };

  const getLevel = (workouts: number) => {
    if (workouts < 5) return 0;
    if (workouts < 15) return 1;
    if (workouts < 30) return 2;
    if (workouts < 50) return 3;
    if (workouts < 75) return 4;
    return 5;
  };

  const checkLevelUp = async () => {
    const userId = 'demo-user';
    const totalWorkouts = await DatabaseService.getWorkoutCount(userId);
    
    const oldLevel = getLevel(totalWorkouts);
    const newLevel = getLevel(totalWorkouts + 1);

    if (newLevel > oldLevel) {
      setLevelUpData({ oldLevel, newLevel });
      setShowLevelUp(true);
      
      // Animate level up
      Animated.parallel([
        Animated.spring(levelUpScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(levelUpOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }

    return newLevel > oldLevel;
  };

  const saveWorkout = async () => {
    if (exercises.length === 0) {
      Alert.alert('No Exercises', 'Add at least one exercise');
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
        userId: 'demo-user',
        exercises: exercises,
        startTime: workoutStartTime,
        endTime: new Date().toISOString(),
        xpEarned: xpEarned,
      };

      // Save to database
      await DatabaseService.saveWorkout(workout);

      // Check for level up
      const didLevelUp = await checkLevelUp();

      if (!didLevelUp) {
        Alert.alert(
          '🎉 Workout Complete!',
          `You earned ${xpEarned} XP!\n\n${completedSets}/${totalSets} sets completed\n${exercises.length} exercises`,
          [
            {
              text: 'Awesome!',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save workout');
      console.error('Save workout error:', error);
    }
  };

  const closeLevelUpModal = () => {
    Animated.parallel([
      Animated.timing(levelUpScale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(levelUpOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowLevelUp(false);
      levelUpScale.setValue(0);
      levelUpOpacity.setValue(0);
      navigation.navigate('Main', { screen: 'HomeTab' });
    });
  };

  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSets = exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  );
  const completionRate = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.accent.primary, colors.accent.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Active Workout</Text>
            <Text style={styles.headerSubtitle}>
              {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
            </Text>
          </View>
          
          <Animated.View 
            style={[
              styles.xpBadge,
              { transform: [{ scale: xpPulse }] }
            ]}
          >
            <LightningIcon size={16} color="#FFFFFF" />
            <Text style={styles.xpText}>{xpEarned} XP</Text>
          </Animated.View>
        </View>

        {/* Progress Bar */}
        {totalSets > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={['#FFFFFF', 'rgba(255,255,255,0.7)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${completionRate}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              {completedSets}/{totalSets} sets • {Math.round(completionRate)}%
            </Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Exercise Cards */}
        {exercises.map((exercise, index) => (
          <GlassCard key={exercise.id} gradient style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseTitleRow}>
                <View style={styles.exerciseNumber}>
                  <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                </View>
                <View>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseType}>{exercise.exerciseType}</Text>
                </View>
              </View>
              
              <TouchableOpacity
                onPress={() => deleteExercise(exercise.id)}
                style={styles.deleteIconButton}
              >
                <CloseIcon size={18} color={colors.text.tertiary} />
              </TouchableOpacity>
            </View>

            {/* Sets */}
            {exercise.sets.map((set, setIndex) => (
              <View key={set.id} style={styles.setRow}>
                <View style={styles.setNumberBadge}>
                  <Text style={styles.setNumberText}>{setIndex + 1}</Text>
                </View>
                
                <TextInput
                  style={styles.setInput}
                  placeholder="Reps"
                  keyboardType="number-pad"
                  value={set.reps?.toString() || ''}
                  onChangeText={(val) =>
                    updateSet(exercise.id, set.id, 'reps', val)
                  }
                  placeholderTextColor={colors.text.tertiary}
                />

                <TextInput
                  style={styles.setInput}
                  placeholder="Weight"
                  keyboardType="decimal-pad"
                  value={set.weight?.toString() || ''}
                  onChangeText={(val) =>
                    updateSet(exercise.id, set.id, 'weight', val)
                  }
                  placeholderTextColor={colors.text.tertiary}
                />

                <TouchableOpacity
                  style={[
                    styles.checkButton,
                    set.completed && styles.checkButtonComplete,
                  ]}
                  onPress={() => toggleSetComplete(exercise.id, set.id)}
                >
                  {set.completed && <CheckIcon size={16} color="#FFFFFF" />}
                </TouchableOpacity>
              </View>
            ))}

            {/* Add Set Button */}
            <TouchableOpacity
              style={styles.addSetButton}
              onPress={() => addSet(exercise.id)}
            >
              <PlusIcon size={16} color={colors.accent.primary} />
              <Text style={styles.addSetButtonText}>Add Set</Text>
            </TouchableOpacity>
          </GlassCard>
        ))}

        {/* Quick Add Section */}
        <View style={styles.quickAddSection}>
          <Text style={styles.sectionTitle}>Quick Add</Text>
          <View style={styles.quickAddGrid}>
            {popularExercises.map((ex) => (
              <TouchableOpacity
                key={ex.name}
                style={styles.quickAddCard}
                onPress={() => addExercise(ex.name, ex.type)}
              >
                <View style={styles.quickAddIcon}>
                  <DumbbellIcon size={24} color={colors.accent.primary} />
                </View>
                <Text style={styles.quickAddText}>{ex.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Exercise Button */}
        <TouchableOpacity
          style={styles.customButton}
          onPress={() => setShowAddExercise(true)}
        >
          <GlassCard gradient style={styles.customButtonCard}>
            <PlusIcon size={20} color={colors.accent.primary} />
            <Text style={styles.customButtonText}>Custom Exercise</Text>
          </GlassCard>
        </TouchableOpacity>

        {/* Save Button */}
        {exercises.length > 0 && (
          <TouchableOpacity style={styles.saveButton} onPress={saveWorkout}>
            <LinearGradient
              colors={[colors.accent.success, colors.accent.tertiary]}
              style={styles.saveButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <TrophyIcon size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Complete Workout</Text>
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
          <GlassCard gradient style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Custom Exercise</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Exercise name"
              placeholderTextColor={colors.text.tertiary}
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
                <LinearGradient
                  colors={[colors.accent.primary, colors.accent.secondary]}
                  style={styles.modalButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                    Add
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>

      {/* Level Up Modal */}
      <Modal
        visible={showLevelUp}
        transparent
        animationType="none"
      >
        <Animated.View 
          style={[
            styles.levelUpOverlay,
            { opacity: levelUpOpacity }
          ]}
        >
          <Animated.View
            style={[
              styles.levelUpContent,
              { 
                transform: [
                  { scale: levelUpScale },
                  { 
                    rotate: levelUpScale.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['180deg', '0deg'],
                    })
                  }
                ]
              }
            ]}
          >
            <LinearGradient
              colors={[colors.accent.warning, colors.accent.primary]}
              style={styles.levelUpGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <TrophyIcon size={64} color="#FFFFFF" />
              <Text style={styles.levelUpTitle}>LEVEL UP!</Text>
              <Text style={styles.levelUpSubtitle}>
                Level {levelUpData.oldLevel} → Level {levelUpData.newLevel}
              </Text>
              <Text style={styles.levelUpDescription}>
                Your character is getting stronger! 💪
              </Text>
              
              <View style={styles.xpEarnedBadge}>
                <LightningIcon size={24} color={colors.accent.warning} />
                <Text style={styles.xpEarnedText}>+{xpEarned} XP</Text>
              </View>

              <TouchableOpacity
                style={styles.levelUpButton}
                onPress={closeLevelUpModal}
              >
                <Text style={styles.levelUpButtonText}>Continue</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingTop: 60,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  xpText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  progressContainer: {
    gap: spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  exerciseCard: {
    marginTop: spacing.lg,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  exerciseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.accent.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.accent.primary,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  exerciseType: {
    fontSize: 11,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  deleteIconButton: {
    padding: spacing.xs,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  setNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.glass.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  setInput: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  checkButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.glass.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.glass.border,
  },
  checkButtonComplete: {
    backgroundColor: colors.accent.success,
    borderColor: colors.accent.success,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.accent.primary,
    borderStyle: 'dashed',
    marginTop: spacing.xs,
  },
  addSetButtonText: {
    color: colors.accent.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  quickAddSection: {
    marginTop: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  quickAddGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickAddCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: colors.glass.white,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  quickAddIcon: {
    marginBottom: spacing.xs,
  },
  quickAddText: {
    color: colors.text.primary,
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
  },
  customButton: {
    marginTop: spacing.lg,
  },
  customButtonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  customButtonText: {
    color: colors.accent.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: spacing.xxl,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  modalContent: {
    width: '100%',
    padding: spacing.xxl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.glass.border,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  modalButtonCancel: {
    backgroundColor: colors.glass.white,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  modalButtonAdd: {
    overflow: 'hidden',
  },
  modalButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  levelUpOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelUpContent: {
    width: '85%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  levelUpGradient: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  levelUpTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: spacing.lg,
    letterSpacing: 2,
  },
  levelUpSubtitle: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.9)',
    marginTop: spacing.sm,
    fontWeight: '600',
  },
  levelUpDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  xpEarnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    marginTop: spacing.xxl,
  },
  xpEarnedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  levelUpButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.full,
    marginTop: spacing.xxl,
  },
  levelUpButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.accent.primary,
    letterSpacing: 1,
  },
});