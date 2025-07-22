import prisma from "../config/db";
import type { Request, Response } from "express";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

// ---------------------------
// Save new prediction & meals
// ---------------------------
export const savePrediction = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { inputId, meals, bmr, tdee, bmi, calorie_target } = req.body;

    if (!userId || !inputId) {
      res.status(400).json({ message: "Missing userId or inputId" });
      return;
    }

    // 1. Mark all previous predictions as not current
    await prisma.predictedDetails.updateMany({
      where: {
        userId,
        isCurrent: true,
      },
      data: {
        isCurrent: false,
      },
    });

    // 2. Create new prediction
    const prediction = await prisma.predictedDetails.create({
      data: {
        bmr,
        tdee,
        bmi,
        calorie_target,
        user: { connect: { id: userId } },
        inputDetail: { connect: { id: inputId } },
        isCurrent: true,
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
      include: {
        meals: true,
      },
    });

    res.status(200).json({
      message: "Prediction saved successfully",
      data: prediction,
    });
  } catch (error) {
    console.error("❌ Prediction save error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ----------------------------------
// Fetch recent N predictions (default 3)
// ----------------------------------
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
    console.error("❌ Error fetching predictions:", error);
    res.status(500).json({ message: "Failed to fetch predictions" });
  }
};

// -------------------------------------------
// Fetch latest diet plan (prediction + input)
// -------------------------------------------
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
      where: { userId, isCurrent: true },
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

    if (!latestPrediction || !latestUserInput) {
      return res.status(404).json({ message: "No diet plan found" });
    }

    res.status(200).json({
      latestPrediction,
      latestUserInput,
    });
  } catch (error) {
    console.error("❌ Error fetching latest diet plan:", error);
    res.status(500).json({ message: "Failed to fetch latest diet plan" });
  }
};
