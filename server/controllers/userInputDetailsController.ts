import prisma from "../config/db";
import type { Request, Response } from "express";

interface UserInputDetails {
  height: number;
  weight: number;
  age: number;
  gender: string;
  goal: string;
  activityType: string;
  preferences: string;
  healthIssues: string[];
  mealPlan: string;
  mealFrequency: number;
  userId: number;
}

export const getAllInputDetailsOfUser = async (req: Request, res: Response): Promise<void> => {
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
      userId
    }: UserInputDetails = req.body;

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
          connect: { id: userId }
        }
      }
    });

    res.status(200).json({
      message: "Input details are taken",
      data: inputDetails
    });

  } catch (error) {
    console.error("Error saving input details:", error);
    res.status(500).json({
      message: "Internal Server Error"
    });
  }
};
