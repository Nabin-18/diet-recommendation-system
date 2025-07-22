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
    const { inputId, meals, bmr, tdee, bmi, calorie_target, expectedWeight, weightChange } = req.body;

    if (!userId || !inputId) {
      res.status(400).json({ message: "Missing userId or inputId" });
      return;
    }

    // 1. Mark previous predictions for this user and input as not current
    await prisma.predictedDetails.updateMany({
      where: { userId, inputId: inputId },
      data: { isCurrent: false }
    });

    // 2. Mark all other UserInputDetails for this user as inactive
    await prisma.userInputDetails.updateMany({
      where: {
        userId,
        NOT: { id: inputId },
      },
      data: {
        isActive: false,
      },
    });

    // 3. Mark current UserInputDetails as active
    await prisma.userInputDetails.update({
      where: { id: inputId },
      data: { isActive: true },
    });

    // 4. Create new prediction with isCurrent = true
    const prediction = await prisma.predictedDetails.create({
      data: {
        userId: userId,
        inputId: inputId,
        bmr: bmr,
        tdee: tdee,
        bmi: bmi,
        calorie_target: calorie_target,
        expectedWeight: expectedWeight,
        weightChange: weightChange,
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
      include: { meals: true },
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
// Fetch latest active diet plan (active input + current prediction)
// -------------------------------------------
export const getLatestDietPlan = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const activeInput = await prisma.userInputDetails.findFirst({
      where: { userId, isActive: true },
    });

    if (!activeInput) {
      return res.status(404).json({ message: "No active diet input found" });
    }

    const latestPrediction = await prisma.predictedDetails.findFirst({
      where: { userId, inputId: activeInput.id, isCurrent: true },
      orderBy: { predictionDate: "desc" },
      include: { meals: true, inputDetail: true },
    });

    if (!latestPrediction) {
      return res.status(404).json({ message: "No current prediction found" });
    }

    res.status(200).json({
      latestPrediction,
      latestUserInput: activeInput,
    });
  } catch (error) {
    console.error("❌ Error fetching latest diet plan:", error);
    res.status(500).json({ message: "Failed to fetch latest diet plan" });
  }
};
