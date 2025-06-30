import prisma from "../config/db";
import type { Request, Response } from "express";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email?: string;
  };
}

//save the predicted diet from the trained dataset

export const savePrediction = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      userId,
      meals, // Array of meals
      bmr,
      tdee,
      bmi,
      calorie_target,
    } = req.body;

    // Create the prediction entry first
    const prediction = await prisma.predictedDetails.create({
      data: {
        userId,
        meals: Array.isArray(meals) ? meals : [],
        bmr,
        tdee,
        bmi,
        calorie_target,
      },
    });
    res.status(200).json({
      message: "Predicted Diet saved Successfully",
      data: prediction,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

//get all the saved predicated details of diet to show the user
export const getPredictedDetails = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.id;
  const mealFrequency = Number(req.query.mealFrequency) || 3; // Default to 3 if not provided
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const predictions = await prisma.predictedDetails.findMany({
      where: { userId },
      orderBy: { predictionDate: "desc" },
      take: mealFrequency,
    });

    res.status(200).json({ predictions });
  } catch (error) {
    console.error("Error fetching predictions:", error);
    res.status(500).json({ message: "Failed to fetch predictions" });
  }
};

// get the latest predicted diet details
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
    res.status(500).json({ message: "Failed to fetch latest diet plan" });
  }
};
