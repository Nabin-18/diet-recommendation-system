import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import {
  ArrowLeft,
  User,
  Target,
  Activity,
  Utensils,
  Calendar,
  Download,
  Share2,
  Clock,
  Loader2,
} from "lucide-react";
import MealCard from "@/components/MealCard";
import InfoRow from "@/components/InfoRow";

interface MealInstruction {
  [key: string]: string | string[];
}

interface MealData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  instructions: string | string[] | MealInstruction;
  optimized_ingredients: string[];
  mealType?: string;
}

interface CleanMealData extends Omit<MealData, "instructions"> {
  instructions: string[];
}

interface NewRecommendations {
  bmi: number;
  bmr: number;
  tdee: number;
  calorie_target: number;
  meals: CleanMealData[];
}

interface UserInput {
  height: number;
  weight: number;
  age: number;
  gender: string;
  goal: string;
  activityType: string;
  preferences: string;
  healthIssues: string;
  mealPlan: string;
  mealFrequency: number;
}

interface Metadata {
  formSubmittedAt: string;
}

interface DietPlanData {
  userInput: UserInput;
  recommendations: NewRecommendations;
  metadata: Metadata;
}

interface DietPlanApiResponse {
  latestPrediction?: {
    bmi: number;
    bmr: number;
    tdee: number;
    calorie_target: number;
    meals: MealData[];
    predictionDate?: string;
  };
  latestUserInput?: UserInput;
}

const DietPlan: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dietData, setDietData] = useState<DietPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizeInstructions = (instructions: unknown): string[] => {
    if (!instructions) return [];

    if (typeof instructions === "string") {
      try {
        const parsed = JSON.parse(instructions);
        return normalizeInstructions(parsed);
      } catch {
        return instructions
          .split(/\n|\d\./)
          .map((step) => step.trim())
          .filter(Boolean);
      }
    }

    if (Array.isArray(instructions)) {
      return instructions
        .flatMap((item) => normalizeInstructions(item))
        .filter(Boolean);
    }

    if (typeof instructions === "object") {
      return Object.values(instructions)
        .flatMap((value) => normalizeInstructions(value))
        .filter(Boolean);
    }

    return [];
  };

  const fetchLatestPlan = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth/login");
        return;
      }

      const res = await axios.get<DietPlanApiResponse>(
        "http://localhost:5000/api/latest-prediction",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.data?.latestPrediction || !res.data?.latestUserInput) {
        throw new Error("No diet plan data found");
      }

      const { latestPrediction, latestUserInput } = res.data;

      const meals: CleanMealData[] = (
        Array.isArray(latestPrediction.meals) ? latestPrediction.meals : []
      ).map((meal) => ({
        ...meal,
        instructions: normalizeInstructions(meal.instructions),
      }));

      const convertedData: DietPlanData = {
        userInput: {
          height: latestUserInput.height,
          weight: latestUserInput.weight,
          age: latestUserInput.age,
          gender: latestUserInput.gender,
          goal: latestUserInput.goal,
          activityType: latestUserInput.activityType,
          preferences: latestUserInput.preferences,
          healthIssues: latestUserInput.healthIssues,
          mealPlan: latestUserInput.mealPlan,
          mealFrequency: latestUserInput.mealFrequency,
        },
        recommendations: {
          bmi: latestPrediction.bmi,
          bmr: latestPrediction.bmr,
          tdee: latestPrediction.tdee,
          calorie_target: latestPrediction.calorie_target,
          meals,
        },
        metadata: {
          formSubmittedAt:
            latestPrediction.predictionDate || new Date().toISOString(),
        },
      };

      setDietData(convertedData);
    } catch (error) {
      console.error("Error fetching diet plan:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load diet plan"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const state = location.state as { dietPlanData?: DietPlanData };

    if (state?.dietPlanData) {
      // Normalize instructions for passed-in data
      const normalizedData = {
        ...state.dietPlanData,
        recommendations: {
          ...state.dietPlanData.recommendations,
          meals: state.dietPlanData.recommendations.meals.map((meal) => ({
            ...meal,
            instructions: normalizeInstructions(meal.instructions),
          })),
        },
      };
      setDietData(normalizedData);
      setLoading(false);
    } else {
      fetchLatestPlan();
    }
  }, [location.state]);

  const handleBackToForm = () => navigate(-1);
  const handleNewPlan = () => navigate("/main-page/diet-recommend");

  const handleDownload = () => {
    if (!dietData) return;

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    let content = `MY PERSONALIZED DIET PLAN
Generated on: ${formatDate(dietData.metadata.formSubmittedAt)}

PERSONAL INFORMATION:
- Height: ${dietData.userInput.height} cm
- Weight: ${dietData.userInput.weight} kg
- Age: ${dietData.userInput.age} years
- Gender: ${dietData.userInput.gender}
- Goal: ${dietData.userInput.goal.replace("_", " ")}
- Activity: ${dietData.userInput.activityType}
- Diet Preference: ${dietData.userInput.preferences}
- Health Condition: ${dietData.userInput.healthIssues || "None"}
- Meal Plan: ${dietData.userInput.mealPlan}
- Meals Per Day: ${dietData.userInput.mealFrequency}

NUTRITIONAL TARGETS:
- BMI: ${dietData.recommendations.bmi.toFixed(1)}
- BMR: ${dietData.recommendations.bmr} calories
- TDEE: ${dietData.recommendations.tdee} calories
- Daily Calorie Target: ${dietData.recommendations.calorie_target} calories

RECOMMENDED MEALS:
`;

    dietData.recommendations.meals.forEach((meal, index) => {
      content += `
${index + 1}. ${meal.name.toUpperCase()}
- Calories: ${meal.calories}
- Protein: ${meal.protein}g
- Carbs: ${meal.carbs}g
- Fats: ${meal.fat}g
- Fiber: ${meal.fiber}g
- Sugar: ${meal.sugar}g
- Sodium: ${meal.sodium}mg

INGREDIENTS:
${meal.optimized_ingredients.map((item) => `• ${item}`).join("\n")}

INSTRUCTIONS:
${meal.instructions.map((step, i) => `${i + 1}. ${step}`).join("\n")}
`;
    });

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diet-plan-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!dietData) return;

    const shareData = {
      title: "My Personalized Diet Plan",
      text: `Check out my personalized diet plan! Target: ${dietData.recommendations.calorie_target} calories/day with ${dietData.recommendations.meals.length} meals`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
        );
        alert("Diet plan details copied to clipboard!");
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
        alert("Failed to share diet plan.");
      }
    }
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5)
      return { category: "Underweight", color: "bg-blue-100 text-blue-800" };
    if (bmi < 25)
      return { category: "Normal", color: "bg-green-100 text-green-800" };
    if (bmi < 30)
      return { category: "Overweight", color: "bg-yellow-100 text-yellow-800" };
    return { category: "Obese", color: "bg-red-100 text-red-800" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Loading your diet plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-red-500 mb-4">
            <Utensils className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error Loading Plan
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={fetchLatestPlan} variant="outline">
              Try Again
            </Button>
            <Button onClick={handleNewPlan}>Create New Diet Plan</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!dietData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-gray-400 mb-4">
            <Utensils className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Diet Plan Found
          </h2>
          <p className="text-gray-600 mb-6">
            You haven't generated a diet plan yet.
          </p>
          <Button onClick={handleNewPlan} className="w-full">
            Create New Diet Plan
          </Button>
        </div>
      </div>
    );
  }

  const { userInput, recommendations, metadata } = dietData;
  const bmiInfo = getBMICategory(recommendations.bmi);
  const totalCalories = recommendations.meals.reduce(
    (sum, meal) => sum + meal.calories,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleBackToForm}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Your Diet Plan
            </h1>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex items-center space-x-2 flex-1 sm:flex-none"
            >
              <Download className="w-4 h-4" />
              <span className="sr-only sm:not-sr-only">Download</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              className="flex items-center space-x-2 flex-1 sm:flex-none"
            >
              <Share2 className="w-4 h-4" />
              <span className="sr-only sm:not-sr-only">Share</span>
            </Button>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              Generated on{" "}
              {new Date(metadata.formSubmittedAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{recommendations.meals.length} meals planned</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Personal Info</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Height:" value={`${userInput.height} cm`} />
              <InfoRow label="Weight:" value={`${userInput.weight} kg`} />
              <InfoRow label="Age:" value={`${userInput.age} years`} />
              <InfoRow
                label="Gender:"
                value={<span className="capitalize">{userInput.gender}</span>}
              />
              <InfoRow
                label="Goal:"
                value={
                  <span className="capitalize">
                    {userInput.goal.replace("_", " ")}
                  </span>
                }
              />
              <InfoRow label="Activity:" value={userInput.activityType} />
            </CardContent>
          </Card>

          {/* Nutritional Targets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Targets</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow
                label="BMI:"
                value={
                  <div className="flex items-center gap-2">
                    <span>{recommendations.bmi.toFixed(1)}</span>
                    <Badge className={bmiInfo.color}>{bmiInfo.category}</Badge>
                  </div>
                }
              />
              <InfoRow label="BMR:" value={`${recommendations.bmr} cal`} />
              <InfoRow label="TDEE:" value={`${recommendations.tdee} cal`} />
              <InfoRow
                label="Daily Target:"
                value={
                  <span className="text-blue-600">
                    {recommendations.calorie_target} cal
                  </span>
                }
              />
              <InfoRow
                label="Plan Total:"
                value={
                  <span className="text-green-600">
                    {totalCalories.toFixed(0)} cal
                  </span>
                }
              />
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow
                label="Diet Type:"
                value={
                  <span className="capitalize">{userInput.preferences}</span>
                }
              />
              <InfoRow
                label="Meals/Day:"
                value={recommendations.meals.length}
              />
              <InfoRow
                label="Health Issues:"
                value={userInput.healthIssues || "None"}
              />
            </CardContent>
          </Card>
        </div>

        {/* Meals Section */}
        <div className="space-y-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recommended Meals
          </h2>

          {recommendations.meals.map((meal, index) => (
            <MealCard
              key={`${meal.name}-${index}`}
              meal={meal}
              index={index}
              instructions={meal.instructions}
            />
          ))}
        </div>

        {/* Action Button */}
        <div className="flex justify-center mt-12">
          <Button
            onClick={handleNewPlan}
            size="lg"
            className="px-8 py-6 text-lg"
          >
            Create New Diet Plan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DietPlan;
