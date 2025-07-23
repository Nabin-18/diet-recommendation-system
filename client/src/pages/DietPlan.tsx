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
import jsPDF from "jspdf";

interface MealData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  instructions: string | string[] | Record<string, string | string[]> | null;
  optimized_ingredients: string[] | null;
  mealType?: string;
}

interface NewRecommendations {
  bmi: number;
  bmr: number;
  tdee: number;
  calorie_target: number;
  meals: MealData[];
}

interface DietPlanData {
  userInput: {
    height: number;
    weight: number;
    age: number;
    gender: string;
    goal: string;
    activityType: string;
    preferences: string;
    healthIssues: string;
    mealPlan: string;
    mealFrequency?: number;
  };
  recommendations: NewRecommendations;
  metadata: {
    formSubmittedAt: string;
  };
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
  latestUserInput?: DietPlanData["userInput"];
}

const getCleanInstructions = (
  instructions:
    | string
    | string[]
    | Record<string, string | string[]>
    | null
    | undefined
) => {
  if (!instructions) return [];

  if (
    Array.isArray(instructions) &&
    instructions.every((item) => typeof item === "string")
  ) {
    return instructions.map((step) => step.trim()).filter(Boolean);
  }

  if (typeof instructions === "object" && !Array.isArray(instructions)) {
    const allSteps: string[] = [];
    Object.keys(instructions)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .forEach((key) => {
        const steps = instructions[key];
        if (Array.isArray(steps)) {
          allSteps.push(...steps);
        } else if (typeof steps === "string") {
          allSteps.push(steps);
        }
      });

    return allSteps.map((step) => step.trim()).filter(Boolean);
  }

  if (typeof instructions === "string") {
    let str = instructions.trim();

    try {
      str = str.replace(/[\r\n\t]/g, " ");

      const match = str.match(/^\d+\.\s*(\[.*\])$/);
      if (match) {
        const arrayStr = match[1].replace(/'/g, '"');
        const arr = JSON.parse(arrayStr);
        if (Array.isArray(arr)) {
          return arr.map((step) => step.trim()).filter(Boolean);
        }
      }

      const parsed = JSON.parse(str.replace(/'/g, '"'));
      if (typeof parsed === "object") {
        return getCleanInstructions(parsed);
      }
    } catch {
      // Fallback
    }

    return str
      .split(/[.!?]\s+/)
      .map((step) => step.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);
  }

  return [];
};

const DietPlan: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dietData, setDietData] = useState<DietPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const state = location.state as { dietPlanData?: DietPlanData };

    async function fetchLatestPlan() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setDietData(null);
          setLoading(false);
          navigate("/auth/login");
          return;
        }
        const res = await axios.get<DietPlanApiResponse>(
          "http://localhost:5000/api/latest-prediction",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const { latestPrediction, latestUserInput } = res.data;
        if (latestPrediction && latestUserInput) {
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
              meals: Array.isArray(latestPrediction.meals)
                ? latestPrediction.meals
                : [],
            },
            metadata: {
              formSubmittedAt:
                latestPrediction.predictionDate || new Date().toISOString(),
            },
          };
          setDietData(convertedData);
        } else {
          setDietData(null);
        }
      } catch (e) {
        console.error("Error fetching latest diet plan:", e);
        setDietData(null);
        setError("Failed to load diet plan");
      } finally {
        setLoading(false);
      }
    }

    if (state?.dietPlanData) {
      setDietData(state.dietPlanData);
      setLoading(false);
    } else {
      fetchLatestPlan();
    }
  }, [location.state, navigate]);

  const handleBackToForm = () => navigate(-1);

  const handleDownloadPDF = () => {
    if (!dietData) return;

    const { userInput, recommendations, metadata } = dietData;

    const doc = new jsPDF();
    let y = 10;

    doc.setFontSize(18);
    doc.text("MY PERSONALIZED DIET PLAN", 10, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`Generated on: ${metadata.formSubmittedAt}`, 10, y);
    y += 10;

    doc.text("PERSONAL INFORMATION:", 10, y);
    y += 8;
    doc.text(`Height: ${userInput.height} cm`, 10, y);
    y += 6;
    doc.text(`Weight: ${userInput.weight} kg`, 10, y);
    y += 6;
    doc.text(`Age: ${userInput.age} years`, 10, y);
    y += 6;
    doc.text(`Gender: ${userInput.gender}`, 10, y);
    y += 6;
    doc.text(`Goal: ${userInput.goal.replace("_", " ")}`, 10, y);
    y += 6;
    doc.text(`Activity: ${userInput.activityType}`, 10, y);
    y += 6;
    doc.text(`Diet Preference: ${userInput.preferences}`, 10, y);
    y += 6;
    doc.text(`Health Condition: ${userInput.healthIssues || "None"}`, 10, y);
    y += 6;
    doc.text(`Meal Plan: ${userInput.mealPlan}`, 10, y);
    if (userInput.mealFrequency) {
      y += 6;
      doc.text(`Meals Per Day: ${userInput.mealFrequency}`, 10, y);
    }
    y += 10;

    doc.text("NUTRITIONAL TARGETS:", 10, y);
    y += 8;
    doc.text(`BMI: ${recommendations.bmi?.toFixed(1) ?? "N/A"}`, 10, y);
    y += 6;
    doc.text(`BMR: ${recommendations.bmr ?? "N/A"} calories`, 10, y);
    y += 6;
    doc.text(`TDEE: ${recommendations.tdee ?? "N/A"} calories`, 10, y);
    y += 6;
    doc.text(
      `Daily Calorie Target: ${
        recommendations.calorie_target ?? "N/A"
      } calories`,
      10,
      y
    );
    y += 10;

    doc.text("RECOMMENDED MEALS:", 10, y);
    y += 8;

    recommendations.meals.forEach((meal, index) => {
      doc.setFontSize(14);
      doc.text(`${index + 1}. ${meal.name.toUpperCase()}`, 10, y);
      y += 7;
      doc.setFontSize(12);
      doc.text(`Calories: ${meal.calories}`, 12, y);
      y += 6;
      doc.text(
        `Protein: ${meal.protein}g, Carbs: ${meal.carbs}g, Fats: ${meal.fat}g`,
        12,
        y
      );
      y += 6;
      doc.text(
        `Fiber: ${meal.fiber}g, Sugar: ${meal.sugar}g, Sodium: ${meal.sodium}mg`,
        12,
        y
      );
      y += 6;
      doc.text("Ingredients:", 12, y);
      y += 6;
      (meal.optimized_ingredients ?? []).forEach((item) => {
        doc.text(`• ${item}`, 16, y);
        y += 5;
      });
      doc.text("Instructions:", 12, y);
      y += 6;
      const cleanInstructions = getCleanInstructions(meal.instructions);
      cleanInstructions.forEach((step, i) => {
        doc.text(`${i + 1}. ${step}`, 16, y);
        y += 5;
      });
      y += 8;
      if (y > 270) {
        doc.addPage();
        y = 10;
      }
    });

    doc.save(`diet-plan-${new Date().toISOString().split("T")[0]}.pdf`);
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
      navigator.clipboard.writeText(
        `${shareData.title}\n${shareData.text}\n${shareData.url}`
      );
      alert("Diet plan details copied to clipboard!");
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
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
            <Button onClick={handleBackToForm}>Back</Button>
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
          <Button onClick={handleBackToForm} className="w-full">
            Back
          </Button>
        </div>
      </div>
    );
  }

  const { userInput, recommendations, metadata } = dietData;
  const bmiInfo = getBMICategory(recommendations.bmi);
  const mealsArray: MealData[] = recommendations.meals;
  const totalCalories = mealsArray.reduce(
    (sum, meal) => sum + (meal.calories ?? 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleBackToForm}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Your Diet Plan</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              className="flex items-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>
        </div>

        {/* Generated Date */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Generated on {metadata.formSubmittedAt}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{recommendations.meals.length} meals planned</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <div className="flex justify-between items-center">
                <span className="text-gray-600">BMI:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">
                    {typeof recommendations.bmi === "number"
                      ? recommendations.bmi.toFixed(1)
                      : "N/A"}
                  </span>
                  <Badge className={bmiInfo.color}>{bmiInfo.category}</Badge>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">BMR:</span>
                <span className="font-medium">
                  {recommendations.bmr ?? "N/A"} cal
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">TDEE:</span>
                <span className="font-medium">
                  {recommendations.tdee ?? "N/A"} cal
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Daily Target:</span>
                <span className="font-medium text-blue-600">
                  {recommendations.calorie_target ?? "N/A"} cal
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Plan Total:</span>
                <span className="font-medium text-green-600">
                  {totalCalories.toFixed(1)} cal
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Activity & Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Diet Type:</span>
                <span className="font-medium capitalize">
                  {userInput.preferences}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Health Issues:</span>
                <span className="font-medium">
                  {userInput.healthIssues || "None"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommended Meals */}
        <div className="mt-6 space-y-6">
          {mealsArray.map((meal, index) => (
            <MealCard
              key={index}
              meal={meal}
              index={index}
              instructions={getCleanInstructions(meal.instructions)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DietPlan;
