import prisma from "../config/db";
import type { Request, Response } from "express";

export const savePrediction = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      userId,
      bmr,
      bmi,
      tdee,
      calorie_target,
      actual_calories,
      calorie_accuracy,
      diet_plan
    } = req.body;

    // Create the prediction entry first
    const prediction = await prisma.predictedDetails.create({
      data: {
        userId,
        bmr,
        bmi,
        tdee,
        calorie_target,
        actual_calories,
        calorie_accuracy,
        meals: {
          create: diet_plan.map((meal: any) => ({
            name: meal.Name,
            target_calories: meal["Target Calories"],
            optimized_calories: meal["Optimized Calories"],
            calories: meal["Calories (kcal)"],
            fat: meal["Fat (g)"],
            carbs: meal["Carbs (g)"],
            protein: meal["Protein (g)"],
            fiber: meal["Fiber (g)"],
            sugar: meal["Sugar (g)"],
            sodium: meal["Sodium (mg)"],
            image: meal["Image"] || "",
            instructions: typeof meal.Instructions === "string" ? meal.Instructions : JSON.stringify(meal.Instructions),
            calorie_match_pct: meal["Calorie Match %"],
            optimized_ingredients: meal["Optimized Ingredients"]
          }))
        }
      },
      include: {
        meals: true
      }
    });

    res.status(200).json({
      message: "Predicted diet and meals saved successfully",
      data: prediction
    });

  } catch (error) {
    console.error("Error saving prediction:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export const getPredictedDetails = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const predictions = await prisma.predictedDetails.findMany({
      where: { userId },
      orderBy: { predictionDate: 'desc' },
      include: {
        meals: true // Include meals with prediction
      }
    });

    res.status(200).json({ predictions });
  } catch (error) {
    console.error("Error fetching predictions:", error);
    res.status(500).json({ message: "Failed to fetch predictions" });
  }
};
