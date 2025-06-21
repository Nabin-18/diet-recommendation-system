import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

// Enhanced type definitions
interface MealData {
  Name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium: number;
  Instructions: string | string[];
  mealType?: string; // breakfast, lunch, dinner, snack
}

// Old structure for backward compatibility
interface OldRecommendations {
  bmi: number;
  bmr: number;
  tdee: number;
  calorie_target: number;
  Name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium: number;
  Instructions: string | string[];
}

// New structure
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

// Type for data that might be in old or new format
interface FlexibleDietPlanData {
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
  recommendations: OldRecommendations | NewRecommendations;
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
    const state = location.state as { dietPlanData?: FlexibleDietPlanData };

    if (state?.dietPlanData) {
      // If the data has old structure (single meal), convert it
      const data = state.dietPlanData;
      if ('Name' in data.recommendations) {
        // Convert old structure to new structure
        const oldRec = data.recommendations as OldRecommendations;
        const convertedData: DietPlanData = {
          ...data,
          recommendations: {
            bmi: oldRec.bmi,
            bmr: oldRec.bmr,
            tdee: oldRec.tdee,
            calorie_target: oldRec.calorie_target,
            meals: [{
              Name: oldRec.Name,
              calories: oldRec.calories,
              protein: oldRec.protein,
              carbs: oldRec.carbs,
              fats: oldRec.fats,
              fiber: oldRec.fiber,
              sugar: oldRec.sugar,
              sodium: oldRec.sodium,
              Instructions: oldRec.Instructions,
              mealType: 'main'
            }]
          }
        };
        setDietData(convertedData);
      } else {
        setDietData(data as DietPlanData);
      }
      setLoading(false);
    } else {
      console.warn("No diet plan data found in navigation state");
      handleNoData();
    }
  }, [location.state]);

  const handleNoData = () => {
    setLoading(false);
  };

  const handleBackToForm = () => {
    navigate(-1);
  };

  const handleNewPlan = () => {
    navigate("/main-page/diet-recommend");
  };

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
${index + 1}. ${meal.Name.toUpperCase()}
- Calories: ${meal.calories}
- Protein: ${meal.protein}g
- Carbs: ${meal.carbs}g
- Fats: ${meal.fats}g
- Fiber: ${meal.fiber}g
- Sugar: ${meal.sugar}g
- Sodium: ${meal.sodium}mg

INSTRUCTIONS:
${cleanInstructions.map((instruction, idx) => `${idx + 1}. ${instruction}`).join('\n')}
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
    let text = "";
    
    if (Array.isArray(instructions)) {
      // Handle nested arrays and mixed formats
      const flatInstructions = instructions.flat();
      text = flatInstructions.join(" ");
    } else if (typeof instructions === "string") {
      text = instructions;
    }

    // Remove array brackets and quotes if present
    text = text.replace(/^\[|\]$/g, '').replace(/^['"]|['"]$/g, '');
    
    // Split on numbered patterns (1., 2., etc.) but preserve the content
    let steps = text.split(/(?=\d+\.\s)/).map(step => step.trim()).filter(Boolean);
    
    // If no numbered steps found, try other delimiters
    if (steps.length <= 1) {
      steps = text.split(/[.!?]\s+/).map(step => step.trim()).filter(Boolean);
    }
    
    // Clean up each step
    steps = steps.map(step => {
      // Remove leading numbers and dots
      step = step.replace(/^\d+\.\s*/, '');
      // Remove quotes and array artifacts
      step = step.replace(/^['"\[,\s]+|['"\],\s]*$/g, '');
      // Capitalize first letter
      step = step.charAt(0).toUpperCase() + step.slice(1);
      return step;
    }).filter(step => step.length > 0);

    return steps;
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

  // Calculate total calories from all meals
  const totalCalories = recommendations.meals.reduce((sum, meal) => sum + meal.calories, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
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
              <div className="flex justify-between">
                <span className="text-gray-600">Height:</span>
                <span className="font-medium">{userInput.height} cm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Weight:</span>
                <span className="font-medium">{userInput.weight} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Age:</span>
                <span className="font-medium">{userInput.age} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gender:</span>
                <span className="font-medium capitalize">
                  {userInput.gender}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Goal:</span>
                <span className="font-medium capitalize">
                  {userInput.goal.replace("_", " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Activity:</span>
                <span className="font-medium">{userInput.activityType}</span>
              </div>
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
                  {totalCalories} cal
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
                <span className="text-gray-600">Meal Plan:</span>
                <span className="font-medium">{userInput.mealPlan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Meals/Day:</span>
                <span className="font-medium">{userInput.mealFrequency}</span>
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
          {recommendations.meals.map((meal, index) => {
            const cleanInstructions = getCleanInstructions(meal.Instructions);
            
            return (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Utensils className="w-5 h-5" />
                      <span>Meal {index + 1}: {meal.Name}</span>
                    </div>
                    {meal.mealType && (
                      <Badge variant="outline" className="capitalize">
                        {meal.mealType}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {meal.calories}
                      </div>
                      <div className="text-sm text-gray-600">Calories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {meal.protein}g
                      </div>
                      <div className="text-sm text-gray-600">Protein</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {meal.carbs}g
                      </div>
                      <div className="text-sm text-gray-600">Carbs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {meal.fats}g
                      </div>
                      <div className="text-sm text-gray-600">Fats</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {meal.fiber}g
                      </div>
                      <div className="text-sm text-gray-600">Fiber</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {meal.sugar}g
                      </div>
                      <div className="text-sm text-gray-600">Sugar</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">
                        {meal.sodium}mg
                      </div>
                      <div className="text-sm text-gray-600">Sodium</div>
                    </div>
                  </div>

                  {/* Instructions */}
                  {cleanInstructions.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">
                        Instructions:
                      </h3>
                      <ol className="list-decimal list-inside space-y-2 text-blue-800 leading-relaxed">
                        {cleanInstructions.map((step: string, idx: number) => (
                          <li key={idx} className="pl-1">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
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