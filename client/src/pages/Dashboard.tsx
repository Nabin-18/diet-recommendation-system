import React from "react";
import UserDetails from "./Dashboard/UserDetails";
import NutritionDetails from "./Dashboard/NutritionDetails";
import type { DashboardData } from "@/types";
// import Instructions from "./Dashboard/Instructions";


interface DashboardData {
  user: {
    name: string;
    email: string;  
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

interface Props {
  dashboardData: DashboardData | null;
  loading: boolean;
  onRefresh: () => void;
  error?: string | null;

}

const Dashboard: React.FC<Props> = ({ dashboardData, loading, onRefresh, error }) => {
  // Error state
  if (error) {
    return (
      <div className="text-center mt-8">
        <div className="text-red-500 mb-4">
          ⚠️ {error}
        </div>
        <button 
          onClick={onRefresh}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="text-center mt-8">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // No data state
  if (!dashboardData) {
    return (
      <div className="text-center mt-8">
        <p className="text-gray-500 mb-4">No dashboard data available.</p>
        <button 
          onClick={onRefresh}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div>
      <UserDetails userData={data} />
      <hr />
     <NutritionDetails
  nutrients={{
    protein: data.prediction.protein,
    carbs: data.prediction.carbs,
    fats: data.prediction.fats,
    sugar: data.prediction.sugar,
    // sodium: data.prediction.sodium,
    fiber: data.prediction.fiber,
    // calories: data.prediction.calories,
  }}
/>
=======
    <div className="max-w-4xl mx-auto p-4">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <button 
          onClick={onRefresh}
          className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200"
        >
          Refresh
        </button>
      </div>
>>>>>>> 69512dc873935d127eefd40b924aab77d0dd4ac3

      {/* User Details */}
      <div className="mb-6">
        <UserDetails userData={dashboardData} />
      </div>

      <hr className="my-6" />

      {/* Nutrition Section */}
      {!dashboardData.inputDetails || !dashboardData.prediction ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-yellow-700 font-medium mb-2">
            ⚠️ Complete Your Profile
          </div>
          <p className="text-yellow-600">
            Please enter your details to receive your personalized nutrition recommendations.
          </p>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Your Nutrition Recommendations
          </h2>
          <NutritionDetails
            nutrients={{
              protein: dashboardData.prediction.protein,
              carbs: dashboardData.prediction.carbs,
              fats: dashboardData.prediction.fats,
              sugar: dashboardData.prediction.sugar,
              sodium: dashboardData.prediction.sodium,
              fiber: dashboardData.prediction.fiber,
              calories: dashboardData.prediction.calories,
            }}
          />
          {/* <hr className="my-6" />
          <Instructions recommendedRecipe={dashboardData.prediction.recommendedDiet} /> */}
        </div>
      )}
    </div>
  );
};

export default Dashboard;