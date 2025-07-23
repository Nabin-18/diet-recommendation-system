import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Utensils,
  ChefHat,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface MealData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  mealType?: string;
  optimized_ingredients: string[];
}

interface MealCardProps {
  meal: MealData;
  index: number;
  instructions: string[];
}

const MealCard: React.FC<MealCardProps> = ({ meal, index, instructions }) => {
  const [showInstructions, setShowInstructions] = useState(false);

  // Always use an array for instructions
  const safeInstructions = Array.isArray(instructions)
    ? instructions
    : typeof instructions === "string"
    ? [instructions]
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Utensils className="w-5 h-5 text-gray-600" />
            <span className="text-lg font-semibold text-gray-800">
              Meal {index + 1}: {meal.name}
            </span>
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
            <div className="text-2xl font-bold">{meal.protein}g</div>
            <div className="text-sm text-gray-600">Protein</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{meal.carbs}g</div>
            <div className="text-sm text-gray-600">Carbs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{meal.fat}g</div>
            <div className="text-sm text-gray-600">Fats</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{meal.fiber}g</div>
            <div className="text-sm text-gray-600">Fiber</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{meal.sugar}g</div>
            <div className="text-sm text-gray-600">Sugar</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{meal.sodium}mg</div>
            <div className="text-sm text-gray-600">Sodium</div>
          </div>
        </div>

        {/* Ingredients Section */}
        <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
            <ChefHat className="w-4 h-4 mr-2 text-gray-600" />
            Ingredients:
          </h3>
          <ul className="flex flex-wrap gap-2 ml-1">
            {meal.optimized_ingredients &&
            meal.optimized_ingredients.length > 0 ? (
              meal.optimized_ingredients.map((ingredient, idx) => (
                <li key={idx}>
                  <span className="inline-block px-3 py-1  font-semibold rounded-full shadow-sm">
                    {ingredient}
                  </span>
                </li>
              ))
            ) : (
              <li className="flex items-center">
                <span className="text-gray-400 mr-2">•</span>
                <span className="text-gray-500">No ingredients available</span>
              </li>
            )}
          </ul>
        </div>

        {safeInstructions.length > 0 && (
          <div>
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="w-full flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100"
            >
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-blue-700" />
                <span className="font-semibold text-blue-900">
                  Instructions
                </span>
                <span className="ml-2 text-sm text-blue-600">
                  ({safeInstructions.length} steps)
                </span>
              </div>
              {showInstructions ? (
                <ChevronUp className="w-4 h-4 text-blue-700" />
              ) : (
                <ChevronDown className="w-4 h-4 text-blue-700" />
              )}
            </button>

            {showInstructions && (
              <div className="mt-2 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <ol className="list-decimal list-inside space-y-2 text-blue-800 leading-relaxed">
                  {safeInstructions.map((step, idx) => (
                    <li key={idx} className="pl-1">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MealCard;
