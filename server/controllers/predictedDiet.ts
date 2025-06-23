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
      protein,
      calories,
      sugar,
      fats,
      Name,
      carbs,
      sodium,
      fiber,
      Instructions,
      image,
      tdee,
      calorie_target,
      bmr,
      bmi,
    } = req.body;

    const prediction = await prisma.predictedDetails.create({
      data: {
        userId,
        protein,
        calories,
        sugar,
        fats,
        Name,
        carbs,
        sodium,
        fiber,
        Instructions,
        image,
        tdee,
        bmr,
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

    const latest = predictions[0] || {};

    res.status(200).json({ predictions: [{ ...latest, meals: predictions }] });
  } catch (error) {
    console.error("Error fetching predictions:", error);
    res.status(500).json({ message: "Failed to fetch predictions" });
  }
};
