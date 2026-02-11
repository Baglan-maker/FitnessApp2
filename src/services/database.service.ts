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

// Initialize nutrition tables
async initNutritionTables() {
    try {
      // Foods table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS foods (
          id TEXT PRIMARY KEY,
          name_en TEXT NOT NULL,
          name_ru TEXT,
          calories REAL NOT NULL,
          protein REAL NOT NULL,
          carbs REAL NOT NULL,
          fats REAL NOT NULL,
          serving_size REAL DEFAULT 100,
          serving_unit TEXT DEFAULT 'g',
          source TEXT DEFAULT 'local',
          usda_fdc_id TEXT,
          is_custom INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);
  
      // Nutrition logs table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS nutrition_logs (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          food_id TEXT NOT NULL,
          food_name TEXT NOT NULL,
          meal_type TEXT NOT NULL,
          servings REAL NOT NULL,
          calories REAL NOT NULL,
          protein REAL NOT NULL,
          carbs REAL NOT NULL,
          fats REAL NOT NULL,
          logged_at TEXT NOT NULL,
          date TEXT NOT NULL,
          FOREIGN KEY (food_id) REFERENCES foods (id)
        );
      `);
  
      // Create index for fast date queries
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_nutrition_logs_date 
        ON nutrition_logs(user_id, date);
      `);
  
      // Nutrition goals table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS nutrition_goals (
          user_id TEXT PRIMARY KEY,
          daily_calories REAL DEFAULT 2000,
          protein_goal REAL DEFAULT 150,
          carbs_goal REAL DEFAULT 250,
          fats_goal REAL DEFAULT 65,
          water_goal REAL DEFAULT 2000
        );
      `);
  
      // Water logs table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS water_logs (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          amount REAL NOT NULL,
          logged_at TEXT NOT NULL,
          date TEXT NOT NULL
        );
      `);
  
      // Create index for water logs
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_water_logs_date 
        ON water_logs(user_id, date);
      `);
  
      // Saved meals table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS saved_meals (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          foods TEXT NOT NULL,
          total_calories REAL NOT NULL,
          total_protein REAL NOT NULL,
          total_carbs REAL NOT NULL,
          total_fats REAL NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);
  
      console.log('✅ Nutrition tables initialized');
    } catch (error) {
      console.error('❌ Error initializing nutrition tables:', error);
      throw error;
    }
  }
  
  // Populate initial food data
  async populateInitialFoods() {
    try {
      // Check if already populated
      const count = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM foods'
      );
  
      if (count && count.count > 0) {
        console.log('✅ Foods already populated');
        return;
      }
  
      // Initial food data (50 common foods for now)
      const initialFoods = [
        // Fruits
        { id: 'f1', name_en: 'Apple', name_ru: 'Яблоко', calories: 52, protein: 0.3, carbs: 14, fats: 0.2, serving_size: 100, serving_unit: 'g' },
        { id: 'f2', name_en: 'Banana', name_ru: 'Банан', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, serving_size: 100, serving_unit: 'g' },
        { id: 'f3', name_en: 'Orange', name_ru: 'Апельсин', calories: 47, protein: 0.9, carbs: 12, fats: 0.1, serving_size: 100, serving_unit: 'g' },
        { id: 'f4', name_en: 'Strawberries', name_ru: 'Клубника', calories: 32, protein: 0.7, carbs: 8, fats: 0.3, serving_size: 100, serving_unit: 'g' },
        
        // Vegetables
        { id: 'v1', name_en: 'Broccoli', name_ru: 'Брокколи', calories: 34, protein: 2.8, carbs: 7, fats: 0.4, serving_size: 100, serving_unit: 'g' },
        { id: 'v2', name_en: 'Carrot', name_ru: 'Морковь', calories: 41, protein: 0.9, carbs: 10, fats: 0.2, serving_size: 100, serving_unit: 'g' },
        { id: 'v3', name_en: 'Tomato', name_ru: 'Помидор', calories: 18, protein: 0.9, carbs: 4, fats: 0.2, serving_size: 100, serving_unit: 'g' },
        { id: 'v4', name_en: 'Cucumber', name_ru: 'Огурец', calories: 15, protein: 0.7, carbs: 3.6, fats: 0.1, serving_size: 100, serving_unit: 'g' },
        
        // Proteins
        { id: 'p1', name_en: 'Chicken Breast', name_ru: 'Куриная грудка', calories: 165, protein: 31, carbs: 0, fats: 3.6, serving_size: 100, serving_unit: 'g' },
        { id: 'p2', name_en: 'Salmon', name_ru: 'Лосось', calories: 208, protein: 20, carbs: 0, fats: 13, serving_size: 100, serving_unit: 'g' },
        { id: 'p3', name_en: 'Egg', name_ru: 'Яйцо', calories: 155, protein: 13, carbs: 1.1, fats: 11, serving_size: 100, serving_unit: 'g' },
        { id: 'p4', name_en: 'Greek Yogurt', name_ru: 'Греческий йогурт', calories: 59, protein: 10, carbs: 3.6, fats: 0.4, serving_size: 100, serving_unit: 'g' },
        { id: 'p5', name_en: 'Beef Steak', name_ru: 'Говяжий стейк', calories: 271, protein: 25, carbs: 0, fats: 19, serving_size: 100, serving_unit: 'g' },
        
        // Grains & Carbs
        { id: 'c1', name_en: 'White Rice', name_ru: 'Белый рис', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, serving_size: 100, serving_unit: 'g' },
        { id: 'c2', name_en: 'Brown Rice', name_ru: 'Коричневый рис', calories: 111, protein: 2.6, carbs: 23, fats: 0.9, serving_size: 100, serving_unit: 'g' },
        { id: 'c3', name_en: 'Oatmeal', name_ru: 'Овсянка', calories: 68, protein: 2.4, carbs: 12, fats: 1.4, serving_size: 100, serving_unit: 'g' },
        { id: 'c4', name_en: 'Whole Wheat Bread', name_ru: 'Цельнозерновой хлеб', calories: 247, protein: 13, carbs: 41, fats: 3.4, serving_size: 100, serving_unit: 'g' },
        { id: 'c5', name_en: 'Pasta', name_ru: 'Макароны', calories: 131, protein: 5, carbs: 25, fats: 1.1, serving_size: 100, serving_unit: 'g' },
        
        // Dairy
        { id: 'd1', name_en: 'Milk', name_ru: 'Молоко', calories: 42, protein: 3.4, carbs: 5, fats: 1, serving_size: 100, serving_unit: 'ml' },
        { id: 'd2', name_en: 'Cheese', name_ru: 'Сыр', calories: 402, protein: 25, carbs: 1.3, fats: 33, serving_size: 100, serving_unit: 'g' },
        
        // Nuts & Seeds
        { id: 'n1', name_en: 'Almonds', name_ru: 'Миндаль', calories: 579, protein: 21, carbs: 22, fats: 50, serving_size: 100, serving_unit: 'g' },
        { id: 'n2', name_en: 'Peanut Butter', name_ru: 'Арахисовое масло', calories: 588, protein: 25, carbs: 20, fats: 50, serving_size: 100, serving_unit: 'g' },
        
        // Beverages
        { id: 'b1', name_en: 'Coffee', name_ru: 'Кофе', calories: 2, protein: 0.3, carbs: 0, fats: 0, serving_size: 100, serving_unit: 'ml' },
        { id: 'b2', name_en: 'Orange Juice', name_ru: 'Апельсиновый сок', calories: 45, protein: 0.7, carbs: 10, fats: 0.2, serving_size: 100, serving_unit: 'ml' },
        { id: 'b3', name_en: 'Green Tea', name_ru: 'Зеленый чай', calories: 1, protein: 0, carbs: 0, fats: 0, serving_size: 100, serving_unit: 'ml' },
      ];
  
      // Insert all foods
      for (const food of initialFoods) {
        await db.runAsync(
          `INSERT INTO foods (id, name_en, name_ru, calories, protein, carbs, fats, serving_size, serving_unit, source, is_custom)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'local', 0)`,
          [
            food.id,
            food.name_en,
            food.name_ru,
            food.calories,
            food.protein,
            food.carbs,
            food.fats,
            food.serving_size,
            food.serving_unit,
          ]
        );
      }
  
      console.log(`✅ Populated ${initialFoods.length} initial foods`);
    } catch (error) {
      console.error('❌ Error populating foods:', error);
      throw error;
    }
  }
  
  // Set default nutrition goals for user
  async setDefaultNutritionGoals(userId: string) {
    try {
      const existing = await db.getFirstAsync(
        'SELECT * FROM nutrition_goals WHERE user_id = ?',
        [userId]
      );
  
      if (existing) {
        console.log('✅ Nutrition goals already set');
        return;
      }
  
      await db.runAsync(
        `INSERT INTO nutrition_goals (user_id, daily_calories, protein_goal, carbs_goal, fats_goal, water_goal)
         VALUES (?, 2000, 150, 250, 65, 2000)`,
        [userId]
      );
  
      console.log('✅ Default nutrition goals set');
    } catch (error) {
      console.error('❌ Error setting nutrition goals:', error);
      throw error;
    }
  }

  // Get nutrition summary for a specific date
async getDailyNutritionSummary(userId: string, date: string): Promise<any> {
    try {
      // Get nutrition logs for the date
      const logs = await db.getAllAsync<any>(
        'SELECT * FROM nutrition_logs WHERE user_id = ? AND date = ?',
        [userId, date]
      );
  
      // Get user's goals
      const goals = await db.getFirstAsync<any>(
        'SELECT * FROM nutrition_goals WHERE user_id = ?',
        [userId]
      );
  
      // Get water logs for the date
      const waterLogs = await db.getAllAsync<any>(
        'SELECT * FROM water_logs WHERE user_id = ? AND date = ?',
        [userId, date]
      );
  
      // Calculate totals
      const total_calories = logs.reduce((sum, log) => sum + log.calories, 0);
      const total_protein = logs.reduce((sum, log) => sum + log.protein, 0);
      const total_carbs = logs.reduce((sum, log) => sum + log.carbs, 0);
      const total_fats = logs.reduce((sum, log) => sum + log.fats, 0);
      const total_water = waterLogs.reduce((sum, log) => sum + log.amount, 0);
  
      return {
        date,
        total_calories: Math.round(total_calories),
        total_protein: Math.round(total_protein),
        total_carbs: Math.round(total_carbs),
        total_fats: Math.round(total_fats),
        total_water: Math.round(total_water),
        goal_calories: goals?.daily_calories || 2000,
        goal_protein: goals?.protein_goal || 150,
        goal_carbs: goals?.carbs_goal || 250,
        goal_fats: goals?.fats_goal || 65,
        goal_water: goals?.water_goal || 2000,
        logs: logs,
      };
    } catch (error) {
      console.error('❌ Error getting daily nutrition summary:', error);
      throw error;
    }
  }
  
  // Get logs grouped by meal type for a date
  async getMealLogs(userId: string, date: string) {
    try {
      const logs = await db.getAllAsync<any>(
        'SELECT * FROM nutrition_logs WHERE user_id = ? AND date = ? ORDER BY logged_at',
        [userId, date]
      );
  
      // Group by meal type
      const grouped = {
        breakfast: logs.filter(log => log.meal_type === 'breakfast'),
        lunch: logs.filter(log => log.meal_type === 'lunch'),
        dinner: logs.filter(log => log.meal_type === 'dinner'),
        snack: logs.filter(log => log.meal_type === 'snack'),
      };
  
      return grouped;
    } catch (error) {
      console.error('❌ Error getting meal logs:', error);
      throw error;
    }
  }
  
  // Log water intake
  async logWater(userId: string, amount: number) {
    try {
      const now = new Date();
      const date = now.toISOString().split('T')[0];
  
      await db.runAsync(
        `INSERT INTO water_logs (id, user_id, amount, logged_at, date)
         VALUES (?, ?, ?, ?, ?)`,
        [Date.now().toString(), userId, amount, now.toISOString(), date]
      );
  
      console.log(`✅ Logged ${amount}ml water`);
    } catch (error) {
      console.error('❌ Error logging water:', error);
      throw error;
    }
  }

  // Search foods in database (English only for now)
async searchFoods(query: string): Promise<any[]> {
  try {
    const searchTerm = `%${query.toLowerCase()}%`;
    
    const results = await db.getAllAsync<any>(
      `SELECT * FROM foods 
       WHERE LOWER(name_en) LIKE ?
       ORDER BY name_en
       LIMIT 50`,
      [searchTerm]
    );

    console.log(`✅ Found ${results.length} foods for "${query}"`);
    return results;
  } catch (error) {
    console.error('❌ Error searching foods:', error);
    return [];
  }
}

// Add food to nutrition log
async addFoodLog(
  userId: string,
  foodId: string,
  foodName: string,
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  servings: number,
  calories: number,
  protein: number,
  carbs: number,
  fats: number
) {
  try {
    const now = new Date();
    const date = now.toISOString().split('T')[0];

    await db.runAsync(
      `INSERT INTO nutrition_logs (id, user_id, food_id, food_name, meal_type, servings, calories, protein, carbs, fats, logged_at, date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Date.now().toString(),
        userId,
        foodId,
        foodName,
        mealType,
        servings,
        calories * servings,
        protein * servings,
        carbs * servings,
        fats * servings,
        now.toISOString(),
        date,
      ]
    );

    console.log(`✅ Added ${foodName} to ${mealType}`);
  } catch (error) {
    console.error('❌ Error adding food log:', error);
    throw error;
  }
}

// Get recent foods for quick access
async getRecentFoods(userId: string, limit: number = 10): Promise<any[]> {
  try {
    const results = await db.getAllAsync<any>(
      `SELECT DISTINCT food_id, food_name, foods.* 
       FROM nutrition_logs 
       JOIN foods ON nutrition_logs.food_id = foods.id
       WHERE nutrition_logs.user_id = ?
       ORDER BY nutrition_logs.logged_at DESC
       LIMIT ?`,
      [userId, limit]
    );

    return results;
  } catch (error) {
    console.error('❌ Error getting recent foods:', error);
    return [];
  }
}

// Delete a food log entry
async deleteFoodLog(logId: string): Promise<void> {
  try {
    await db.runAsync('DELETE FROM nutrition_logs WHERE id = ?', [logId]);
    console.log('✅ Food log deleted');
  } catch (error) {
    console.error('❌ Error deleting food log:', error);
    throw error;
  }
}

// Get nutrition data for a specific date (for testing/history)
async getNutritionForDate(userId: string, date: string): Promise<any> {
  try {
    const summary = await this.getDailyNutritionSummary(userId, date);
    const meals = await this.getMealLogs(userId, date);
    
    return { summary, meals };
  } catch (error) {
    console.error('❌ Error getting nutrition for date:', error);
    throw error;
  }
}

// Check if user has logged anything today
async hasLoggedToday(userId: string): Promise<boolean> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM nutrition_logs WHERE user_id = ? AND date = ?',
      [userId, today]
    );
    return (result?.count || 0) > 0;
  } catch (error) {
    console.error('❌ Error checking today logs:', error);
    return false;
  }
}
}

// Export a single instance (singleton pattern)
export default new DatabaseService();