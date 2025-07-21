import prisma from "../config/db";
import type { Request, Response } from "express";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}



// Save prediction handler
export const savePrediction = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { inputId, meals, bmr, tdee, bmi, calorie_target } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const inputDetail = await prisma.userInputDetails.findUnique({
      where: { id: inputId },
    });

    if (!inputDetail) {
      res.status(404).json({ message: "User input details not found" });
      return;
    }

   

    const prediction = await prisma.predictedDetails.create({
      data: {
        bmr,
        tdee,
        bmi,
        calorie_target,
        
        user: { connect: { id: userId } },
        inputDetail: { connect: { id: inputId } },
        meals: {
          create: meals.map((meal: any) => ({
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
            instructions: meal.instructions,
            calorie_match_pct: meal.calorie_match_pct,
            optimized_ingredients: meal.optimized_ingredients,
          })),
        },
      },
      include: { meals: true },
    });

    res.status(200).json({
      message: "Prediction saved successfully",
      data: prediction,
    });
  } catch (error) {
    console.error("Prediction save error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get latest predictions
export const getPredictedDetails = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.id;
  const limit = Number(req.query.limit) || 3;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const predictions = await prisma.predictedDetails.findMany({
      where: { userId },
      orderBy: { predictionDate: "desc" },
      take: limit,
      include: {
        meals: true,
        inputDetail: true,
      },
    });

    res.status(200).json(predictions);
  } catch (error) {
    console.error("Error fetching predictions:", error);
    res.status(500).json({ message: "Failed to fetch predictions" });
  }
};

// Get latest diet plan
export const getLatestDietPlan = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const latestPrediction = await prisma.predictedDetails.findFirst({
      where: { userId },
      orderBy: { predictionDate: "desc" },
      include: {
        meals: true,
        inputDetail: true,
      },
    });

    const latestUserInput = await prisma.userInputDetails.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      latestPrediction,
      latestUserInput,
    });
  } catch (error) {
    console.error("Error fetching latest diet plan:", error);
    res.status(500).json({ message: "Failed to fetch latest diet plan" });
  }
};
