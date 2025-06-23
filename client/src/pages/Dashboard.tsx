import React from "react";
import UserDetails from "./Dashboard/UserDetails";
import type { DashboardData } from "@/types";


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

const Dashboard: React.FC<Props> = ({
  dashboardData,
  loading,
  onRefresh,
  error,
}) => {
  // Error state
  if (error) {
    return (
      <div className="text-center mt-8">
        <div className="text-red-500 mb-4">⚠️ {error}</div>
        <button
          onClick={onRefresh}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Try Again
        </button>
      </div>
    );
  }

  // loading state
  if (loading) {
    return (
      <div className="text-center mt-8">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // no data state
  if (!dashboardData) {
    return (
      <div className="text-center mt-8">
        <p className="text-gray-500 mb-4">No dashboard data available.</p>
        <button
          onClick={onRefresh}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* user details */}
      <div className="mb-6">
        <UserDetails userData={dashboardData} />
      </div>
    </div>
  );
};

export default Dashboard;
