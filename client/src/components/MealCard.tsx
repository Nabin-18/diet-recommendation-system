import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Utensils } from "lucide-react";

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
}

interface MealCardProps {
  meal: MealData;
  index: number;
  instructions: string[];
}
const MealCard: React.FC<MealCardProps> = ({
  meal,
  index,
  instructions,
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Utensils className="w-5 h-5" />
          <span>
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
      {instructions.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 leading-relaxed">
            {instructions.map((step, idx) => (
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

export default MealCard;
