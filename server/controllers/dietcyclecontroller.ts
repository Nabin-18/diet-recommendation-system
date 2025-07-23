import prisma from "../config/db";
import type { Request, Response } from "express";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export const handleDietCycleResponse = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const { response, userInputData, predictionData } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const latestInput = await prisma.userInputDetails.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (response === "Yes") {
      const newCycleNumber = (latestInput?.cycleNumber ?? 0) + 1;

      // Get all previous recipe names used by the user
      const previousRecipes = await prisma.mealPrediction.findMany({
        where: {
          prediction: {
            userId,
          },
        },
        select: { name: true },
      });

      const usedRecipeNames = previousRecipes.map((meal) =>
        meal.name.toLowerCase()
      );

      const filteredMeals = predictionData.meals.filter(
        (meal: any) => !usedRecipeNames.includes(meal.name.toLowerCase())
      );

      if (filteredMeals.length === 0) {
        return res.status(400).json({
          message: "No new recipes available. All recipes have already been used.",
        });
      }

      // Create new input cycle
      const newInput = await prisma.userInputDetails.create({
        data: {
          ...userInputData,
          userId,
          cycleNumber: newCycleNumber,
          startDate: new Date(),
          endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // +15 days
        },
      });

      // Create prediction with filtered meals
      const prediction = await prisma.predictedDetails.create({
        data: {
          userId,
          inputId: newInput.id,
          bmi: predictionData.bmi,
          bmr: predictionData.bmr,
          tdee: predictionData.tdee,
          calorie_target: predictionData.calorie_target,
          expectedWeight: predictionData.expectedWeight,
          weightChange: predictionData.weightChange,
          Instructions: predictionData.Instructions || "",
          Name: predictionData.Name || `Diet Plan ${Date.now()}`,
          calories: predictionData.calories,
          carbs: predictionData.carbs,
          fats: predictionData.fats,
          fiber: predictionData.fiber,
          image: predictionData.image || "",
          protein: predictionData.protein,
          sodium: predictionData.sodium,
          sugar: predictionData.sugar,
          isCurrent: true,

          meals: {
            create: filteredMeals.map((meal: any) => ({
              name: meal.name,
              target_calories: meal.target_calories,
              optimized_calories: meal.optimized_calories,
              calories: meal.calories,
              fat: meal.fat,
              carbs: meal.carbs,
              protein: meal.protein,
              fiber: meal.fiber,
              sugar: meal.sugar,
              sodium: meal.sodium,
              image: meal.image,
              instructions: JSON.stringify(meal.instructions || []),
              calorie_match_pct: meal.calorie_match_pct || 0,
              optimized_ingredients: meal.optimized_ingredients || {},
            })),
          },
        },
        include: { meals: true },
      });

      return res.status(201).json({
        message: "New diet cycle created successfully",
        data: { userInput: newInput, prediction },
      });
    } else {
      return res.status(200).json({
        message: "Continuing with current diet plan",
        data: latestInput,
      });
    }
  } catch (error: any) {
    console.error("Error handling diet cycle response:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
