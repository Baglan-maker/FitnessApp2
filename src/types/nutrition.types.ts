export interface Food {
    id: string;
    name_en: string;
    name_ru?: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    serving_size: number;
    serving_unit: string; // 'g', 'ml', 'piece', etc.
    source: 'local' | 'usda' | 'custom';
    usda_fdc_id?: string;
    is_custom: boolean;
    created_at: string;
  }
  
  export interface NutritionLog {
    id: string;
    user_id: string;
    food_id: string;
    food_name: string; // Denormalized for easy display
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    servings: number;
    calories: number; // Calculated: food.calories * servings
    protein: number;
    carbs: number;
    fats: number;
    logged_at: string;
    date: string; // YYYY-MM-DD for easy querying
  }
  
  export interface NutritionGoals {
    user_id: string;
    daily_calories: number;
    protein_goal: number;
    carbs_goal: number;
    fats_goal: number;
    water_goal: number; // in ml
  }
  
  export interface WaterLog {
    id: string;
    user_id: string;
    amount: number; // in ml
    logged_at: string;
    date: string; // YYYY-MM-DD
  }
  
  export interface DailyNutritionSummary {
    date: string;
    total_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fats: number;
    total_water: number;
    goal_calories: number;
    goal_protein: number;
    goal_carbs: number;
    goal_fats: number;
    goal_water: number;
  }
  
  export interface SavedMeal {
    id: string;
    user_id: string;
    name: string;
    foods: Array<{
      food_id: string;
      food_name: string;
      servings: number;
    }>;
    total_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fats: number;
    created_at: string;
  }