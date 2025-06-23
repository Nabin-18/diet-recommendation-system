export interface DashboardData {
  user: {
    name: string;
    email: string;
    image?: string;
  };
  inputDetails: {
    age: number;
    gender: string;
    weight: number;
    height: number;
    activity: string;
    bmi: number;
    goal: string;
    preference: string;
    mealFrequency: number;
  };
  prediction: {
    carbs: number;
    fats: number;
    sugar: number;
    sodium: number;
    fiber: number;
    calories: number;
    protein: number;
    bmr: number;
    tdee: number;
    targetCalories: number;
    nutrients: Record<string, number>;
    recommendedDiet: string;
  };
}
