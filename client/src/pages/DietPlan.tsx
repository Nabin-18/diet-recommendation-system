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
} from "lucide-react";
import MealCard from "@/components/MealCard";
import InfoRow from "@/components/InfoRow";

interface MealData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  Instructions: string | string[];
  mealType?: string; // breakfast, lunch, dinner, snack
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
    mealFrequency: number;
  };
  recommendations: NewRecommendations;
  metadata: {
    formSubmittedAt: string;
  };
}

const DietPlan: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dietData, setDietData] = useState<DietPlanData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const state = location.state as { dietPlanData?: DietPlanData };

    async function fetchLatestPlan() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setDietData(null);
          setLoading(false);
          navigate("/login");
          return;
        }
        const res = await axios.get("/api/latest-prediction", {
          headers: { Authorization: `Bearer ${token}` },
        });
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

  const handleNewPlan = () => navigate("/main-page/diet-recommend");

  const handleDownload = () => {
    if (!dietData) return;

    let content = `
MY PERSONALIZED DIET PLAN
Generated on: ${dietData.metadata.formSubmittedAt}

PERSONAL INFORMATION:
- Height: ${dietData.userInput.height} cm
- Weight: ${dietData.userInput.weight} kg
- Age: ${dietData.userInput.age} years
- Gender: ${dietData.userInput.gender}
- Goal: ${dietData.userInput.goal.replace("_", " ")}
- Activity: ${dietData.userInput.activityType}
- Diet Preference: ${dietData.userInput.preferences}
- Health Condition: ${dietData.userInput.healthIssues}
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
      const cleanInstructions = getCleanInstructions(meal.Instructions);
      content += `
${index + 1}. ${meal.name.toUpperCase()}
- Calories: ${meal.calories}
- Protein: ${meal.protein}g
- Carbs: ${meal.carbs}g
- Fats: ${meal.fat}g
- Fiber: ${meal.fiber}g
- Sugar: ${meal.sugar}g
- Sodium: ${meal.sodium}mg

INSTRUCTIONS:
${cleanInstructions
  .map((instruction, idx) => `${idx + 1}. ${instruction}`)
  .join("\n")}
`;
    });

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-diet-plan.txt";
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
      navigator.clipboard.writeText(
        `${shareData.title}\n${shareData.text}\n${shareData.url}`
      );
      alert("Diet plan details copied to clipboard!");
    }
  };

  const getCleanInstructions = (instructions: string | string[]): string[] => {
    if (Array.isArray(instructions)) {
      return instructions
        .flat()
        .map((step) => step.trim())
        .filter(Boolean);
    }
    if (typeof instructions === "string") {
      let str = instructions.trim();
      try {
        str = str.replace(/[\r\n\t]/g, " ");
        if (str.startsWith("[") && str.endsWith("]")) {
          const arr = JSON.parse(str.replace(/'/g, '"'));
          if (Array.isArray(arr)) {
            return arr
              .map((step: string) => step.replace(/^\d+\.\s*/, "").trim())
              .filter(Boolean);
          }
        }
      } catch (error) {
        console.error("Error parsing instructions:", error);
      }
      return str
        .split(/(?=\d+\.\s)|[.!?]\s+/)
        .map((step) => step.replace(/^\d+\.\s*/, "").trim())
        .filter(Boolean);
    }
    return [];
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your diet plan...</p>
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
            It looks like you haven't generated a diet plan yet or the data
            wasn't passed correctly.
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

  const mealsArray: MealData[] = recommendations.meals;

  // calculate total calories from all meals
  const totalCalories = mealsArray.reduce(
    (sum, meal) => sum + meal.calories,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleBackToForm}
              className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Your Diet Plan</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Download</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              className="flex items-center space-x-2">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>
        </div>

        {/* generated Date */}
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
          {/* personal Information */}
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
                    {userInput.goal ? userInput.goal.replace("_", " ") : "N/A"}
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
                  {typeof recommendations.bmr === "number"
                    ? recommendations.bmr
                    : "N/A"}{" "}
                  cal
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">TDEE:</span>
                <span className="font-medium">
                  {typeof recommendations.tdee === "number"
                    ? recommendations.tdee
                    : "N/A"}{" "}
                  cal
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Daily Target:</span>
                <span className="font-medium text-blue-600">
                  {typeof recommendations.calorie_target === "number"
                    ? recommendations.calorie_target
                    : "N/A"}{" "}
                  cal
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
              {/* <div className="flex justify-between">
                <span className="text-gray-600">Meal Plan:</span>
                <span className="font-medium">{userInput.mealPlan}</span>
              </div> */}
              <div className="flex justify-between">
                <span className="text-gray-600">Meals/Day:</span>
                <span className="font-medium">{recommendations.meals.length}</span>
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
              instructions={getCleanInstructions(meal.Instructions)}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center mt-8">
          <Button onClick={handleNewPlan} className="px-8 py-2">
            Create New Diet Plan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DietPlan;
