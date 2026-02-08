export interface Exercise {
    id: string;
    name: string;
    sets: Set[];
    exerciseType: 'strength' | 'cardio' | 'flexibility';
  }
  
  export interface Set {
    id: string;
    reps?: number;
    weight?: number;
    duration?: number; // in seconds for cardio
    completed: boolean;
  }
  
  export interface Workout {
    id: string;
    userId: string;
    exercises: Exercise[];
    startTime: string;
    endTime?: string;
    notes?: string;
    xpEarned?: number;
  }
  
  export interface ExerciseTemplate {
    name: string;
    category: string;
    type: 'strength' | 'cardio' | 'flexibility';
  }