import * as SQLite from 'expo-sqlite';
import { Exercise, Workout } from '../types/workout.types';

// Open/create the database
const db = SQLite.openDatabaseSync('fitnessrpg.db');

class DatabaseService {
  // Initialize database - creates tables if they don't exist
  async initDatabase() {
    try {
      // Create workouts table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS workouts (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          startTime TEXT NOT NULL,
          endTime TEXT,
          notes TEXT,
          xpEarned INTEGER DEFAULT 0,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create exercises table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS exercises (
          id TEXT PRIMARY KEY,
          workoutId TEXT NOT NULL,
          name TEXT NOT NULL,
          exerciseType TEXT NOT NULL,
          orderIndex INTEGER,
          FOREIGN KEY (workoutId) REFERENCES workouts (id) ON DELETE CASCADE
        );
      `);

      // Create sets table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS sets (
          id TEXT PRIMARY KEY,
          exerciseId TEXT NOT NULL,
          reps INTEGER,
          weight REAL,
          duration INTEGER,
          completed INTEGER DEFAULT 0,
          orderIndex INTEGER,
          FOREIGN KEY (exerciseId) REFERENCES exercises (id) ON DELETE CASCADE
        );
      `);

      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing database:', error);
      throw error;
    }
  }

  // Save a complete workout with all exercises and sets
  async saveWorkout(workout: Workout): Promise<void> {
    try {
      // 1. Insert the workout
      await db.runAsync(
        `INSERT INTO workouts (id, userId, startTime, endTime, notes, xpEarned)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          workout.id,
          workout.userId,
          workout.startTime,
          workout.endTime || null,
          workout.notes || null,
          workout.xpEarned || 0,
        ]
      );

      // 2. Insert all exercises
      for (let i = 0; i < workout.exercises.length; i++) {
        const exercise = workout.exercises[i];
        
        await db.runAsync(
          `INSERT INTO exercises (id, workoutId, name, exerciseType, orderIndex)
           VALUES (?, ?, ?, ?, ?)`,
          [exercise.id, workout.id, exercise.name, exercise.exerciseType, i]
        );

        // 3. Insert all sets for this exercise
        for (let j = 0; j < exercise.sets.length; j++) {
          const set = exercise.sets[j];
          
          await db.runAsync(
            `INSERT INTO sets (id, exerciseId, reps, weight, duration, completed, orderIndex)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              set.id,
              exercise.id,
              set.reps || null,
              set.weight || null,
              set.duration || null,
              set.completed ? 1 : 0,
              j,
            ]
          );
        }
      }

      console.log('✅ Workout saved successfully:', workout.id);
    } catch (error) {
      console.error('❌ Error saving workout:', error);
      throw error;
    }
  }

  // Get all workouts for a user
  async getWorkouts(userId: string): Promise<Workout[]> {
    try {
      // Get all workouts
      const workouts = await db.getAllAsync<any>(
        'SELECT * FROM workouts WHERE userId = ? ORDER BY startTime DESC',
        [userId]
      );

      // For each workout, get its exercises and sets
      const workoutsWithDetails: Workout[] = [];

      for (const workout of workouts) {
        // Get exercises for this workout
        const exercises = await db.getAllAsync<any>(
          'SELECT * FROM exercises WHERE workoutId = ? ORDER BY orderIndex',
          [workout.id]
        );

        // For each exercise, get its sets
        const exercisesWithSets: Exercise[] = [];

        for (const exercise of exercises) {
          const sets = await db.getAllAsync<any>(
            'SELECT * FROM sets WHERE exerciseId = ? ORDER BY orderIndex',
            [exercise.id]
          );

          exercisesWithSets.push({
            id: exercise.id,
            name: exercise.name,
            exerciseType: exercise.exerciseType,
            sets: sets.map((set) => ({
              id: set.id,
              reps: set.reps,
              weight: set.weight,
              duration: set.duration,
              completed: set.completed === 1,
            })),
          });
        }

        workoutsWithDetails.push({
          id: workout.id,
          userId: workout.userId,
          startTime: workout.startTime,
          endTime: workout.endTime,
          notes: workout.notes,
          xpEarned: workout.xpEarned,
          exercises: exercisesWithSets,
        });
      }

      console.log(`✅ Retrieved ${workoutsWithDetails.length} workouts`);
      return workoutsWithDetails;
    } catch (error) {
      console.error('❌ Error getting workouts:', error);
      throw error;
    }
  }

  // Get total workout count for a user
  async getWorkoutCount(userId: string): Promise<number> {
    try {
      const result = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM workouts WHERE userId = ?',
        [userId]
      );
      return result?.count || 0;
    } catch (error) {
      console.error('❌ Error getting workout count:', error);
      return 0;
    }
  }

  // Get workouts from the last 7 days
  async getWeeklyWorkoutCount(userId: string): Promise<number> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const result = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM workouts 
         WHERE userId = ? AND startTime >= ?`,
        [userId, sevenDaysAgo.toISOString()]
      );
      return result?.count || 0;
    } catch (error) {
      console.error('❌ Error getting weekly workout count:', error);
      return 0;
    }
  }

  // Delete a workout
  async deleteWorkout(workoutId: string): Promise<void> {
    try {
      await db.runAsync('DELETE FROM workouts WHERE id = ?', [workoutId]);
      console.log('✅ Workout deleted:', workoutId);
    } catch (error) {
      console.error('❌ Error deleting workout:', error);
      throw error;
    }
  }

  // Clear all data (useful for testing)
  async clearAllData(): Promise<void> {
    try {
      await db.execAsync('DELETE FROM sets');
      await db.execAsync('DELETE FROM exercises');
      await db.execAsync('DELETE FROM workouts');
      console.log('✅ All data cleared');
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      throw error;
    }
  }
}

// Export a single instance (singleton pattern)
export default new DatabaseService();