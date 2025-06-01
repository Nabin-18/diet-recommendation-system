import prisma from "../config/db";
import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";

interface UserInputDetails {
  height: number;
  weight: number;
  age: number;
  gender: string;
  goal: string;
  activityType: string;
  preferences: string;
  healthIssues: string;
  mealPlan: string;
  mealFrequency: number;
}

export const getAllInputDetailsOfUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      height,
      weight,
      age,
      gender,
      goal,
      activityType,
      preferences,
      healthIssues,
      mealPlan,
      mealFrequency,
    } = req.body as UserInputDetails;

    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User ID missing from token" });
      return;
    }
    console.log(userId)

    const inputDetails = await prisma.userInputDetails.create({
      data: {
        height,
        weight,
        age,
        gender,
        goal,
        activityType,
        preferences,
        healthIssues,
        mealPlan,
        mealFrequency,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    res.status(200).json({
      message: "Input details are taken",
      data: inputDetails,
    });
  } catch (error) {
    console.error("Error saving input details:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
