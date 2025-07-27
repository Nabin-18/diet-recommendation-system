import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  User,
  Target,
  Activity,
  Calendar,
  Clock,
  Download,
  Share2,
} from "lucide-react";
import MealCard from "@/components/MealCard";
import InfoRow from "@/components/InfoRow";

function normalizeMeal(meal: any): any {
  return {
    name: meal.Name || meal.name || "",
    calories: meal["Calories (kcal)"] ?? meal.calories ?? 0,
    protein: meal["Protein (g)"] ?? meal.protein ?? 0,
    carbs: meal["Carbs (g)"] ?? meal.carbs ?? 0,
    fat: meal["Fat (g)"] ?? meal.fat ?? 0,
    fiber: meal["Fiber (g)"] ?? meal.fiber ?? 0,
    sugar: meal["Sugar (g)"] ?? meal.sugar ?? 0,
    sodium: meal["Sodium (mg)"] ?? meal.sodium ?? 0,
    mealType: meal.mealType || "",
    optimized_ingredients:
      meal["Optimized Ingredients"] ?? meal.optimized_ingredients ?? [],
    // Fix: check both keys for instructions
    instructions: meal.instructions ?? meal.Instructions ?? "",
  };
}

function getCleanInstructions(
  instructions:
    | string
    | string[]
    | Record<string, string | string[]>
    | null
    | undefined
) {
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
}

const NewDiet: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { dietPlanData } = location.state || {};
  const userInput = dietPlanData?.userInput || {};

  if (!dietPlanData) {
    return (
      <div className="max-w-xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg text-center">
        <p>No new diet plan data found.</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => navigate("/main-page")}>
          Back to Main Page
        </button>
      </div>
    );
  }

  // Defensive extraction
  const { prediction = {}, meals = [] } = dietPlanData;
  const metadata = dietPlanData.metadata || {
    formSubmittedAt: new Date().toISOString(),
  };

  // Defensive: ensure meals is always an array
  const safeMeals = Array.isArray(meals) ? meals.map(normalizeMeal) : [];

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5)
      return { category: "Underweight", color: "bg-blue-100 text-blue-800" };
    if (bmi < 25)
      return { category: "Normal", color: "bg-green-100 text-green-800" };
    if (bmi < 30)
      return { category: "Overweight", color: "bg-yellow-100 text-yellow-800" };
    return { category: "Obese", color: "bg-red-100 text-red-800" };
  };

  const bmiInfo = getBMICategory(prediction.bmi || 0);
  const totalCalories = safeMeals.reduce(
    (sum, meal) => sum + (meal.calories || 0),
    0
  );

  const handleBackToMain = () => navigate("/main-page");

  const handleDownload = () => {
    let content = `MY PERSONALIZED DIET PLAN
Generated on: ${new Date(metadata.formSubmittedAt).toLocaleDateString()}

PERSONAL INFORMATION:
- Height: ${userInput.height} cm
- Weight: ${userInput.weight} kg
- Age: ${userInput.age} years
- Gender: ${userInput.gender}
- Goal: ${userInput.goal}
- Activity: ${userInput.activityType}
- Diet Preference: ${userInput.preferences}
- Health Condition: ${userInput.healthIssues || "None"}
- Meal Plan: ${userInput.mealPlan}

NUTRITIONAL TARGETS:
- BMI: ${prediction.bmi}
- BMR: ${prediction.bmr} calories
- TDEE: ${prediction.tdee} calories
- Daily Calorie Target: ${prediction.calorie_target} calories

RECOMMENDED MEALS:
`;

    safeMeals.forEach((meal, index) => {
      content += `
${index + 1}. ${meal.name?.toUpperCase() || "Meal"}
- Calories: ${meal.calories}
- Protein: ${meal.protein}g
- Carbs: ${meal.carbs}g
- Fats: ${meal.fat}g
- Fiber: ${meal.fiber}g
- Sugar: ${meal.sugar}g
- Sodium: ${meal.sodium}mg

INGREDIENTS:
${
  Array.isArray(meal.optimized_ingredients)
    ? meal.optimized_ingredients.map((item) => `• ${item}`).join("\n")
    : ""
}

INSTRUCTIONS:
${
  Array.isArray(meal.instructions)
    ? meal.instructions.map((step, i) => `${i + 1}. ${step}`).join("\n")
    : ""
}
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
    const shareData = {
      title: "My Personalized Diet Plan",
      text: `Check out my personalized diet plan! Target: ${prediction.calorie_target} calories/day with ${safeMeals.length} meals`,
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleBackToMain}
              className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Your New Diet Plan
            </h1>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex items-center space-x-2 flex-1 sm:flex-none">
              <Download className="w-4 h-4" />
              <span className="sr-only sm:not-sr-only">Download</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              className="flex items-center space-x-2 flex-1 sm:flex-none">
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
            <span>{safeMeals.length} meals planned</span>
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
              <InfoRow label="Gender:" value={userInput.gender} />
              <InfoRow label="Goal:" value={userInput.goal} />
              <InfoRow label="Activity:" value={userInput.activityType} />
              {/* <InfoRow label="Diet Preference:" value={userInput.preferences} /> */}
              {/* <InfoRow
                label="Health Condition:"
                value={userInput.healthIssues || "None"}
              />
              <InfoRow label="Meal Plan:" value={userInput.mealPlan} /> */}
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
                    <span>{prediction.bmi?.toFixed?.(1) ?? "N/A"}</span>
                    <Badge className={bmiInfo.color}>{bmiInfo.category}</Badge>
                  </div>
                }
              />
              <InfoRow label="BMR:" value={`${prediction.bmr ?? "N/A"} cal`} />
              <InfoRow
                label="TDEE:"
                value={`${prediction.tdee ?? "N/A"} cal`}
              />
              <InfoRow
                label="Daily Target:"
                value={
                  <span className="text-blue-600">
                    {prediction.calorie_target ?? "N/A"} cal
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
                label="Health Issues:"
                value={userInput.healthIssues || "None"}
              />
              <InfoRow label="Meals Frequency" value={safeMeals.length} />
            </CardContent>
          </Card>
        </div>

        {/* Meals Section */}
        <div className="space-y-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recommended Meals
          </h2>

          {safeMeals.length === 0 ? (
            <div className="text-gray-500 text-center">
              No meals found for your diet plan.
            </div>
          ) : (
            safeMeals.map((meal, index) => (
              <MealCard
                key={`${meal.name}-${index}`}
                meal={meal}
                index={index}
                instructions={getCleanInstructions(meal.instructions)}
              />
            ))
          )}
        </div>

        {/* Footer */}

        {/* Action Button */}
        <div className="flex justify-center mt-12">
          <Button
            onClick={handleBackToMain}
            size="lg"
            className="px-8 py-6 text-lg">
            Back to Main Page
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewDiet;
