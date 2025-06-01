import prisma from "../config/db";
import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";
import axios from "axios";

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

export const getAllInputDetailsOfUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
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
      res.status(401).json({ message: "Unauthorized: User ID missing" });
      return;
    }

    // 1. Save input data to DB
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
        user: { connect: { id: userId } },
      },
    });

    // 2. Prepare payload for FastAPI
    const fastApiPayload = {
      gender: gender.toLowerCase() === "male" ? 1 : 0,
      age,
      height_cm: height,
      weight_kg: weight,
      goal: goal.toLowerCase(),
      Type: preferences.toLowerCase(), // 'vegetarian' or 'non-vegetarian'
      meal_type: mealPlan.toLowerCase(),
      health_conditions: healthIssues.split(",").map(c => c.trim().toLowerCase()),
      meal_frequency: mealFrequency,
      activity_type: activityType.toLowerCase(),
    };

    // 3. Send POST to Python model (FastAPI)
    const pythonResponse = await axios.post("http://localhost:8000/recommend", fastApiPayload);
    const { bmr, tdee, bmi, calorie_target, diet_plan } = pythonResponse.data;

    // 4. Save predicted diet to PredictedDetails
    if (diet_plan.length > 0) {
      await Promise.all(
        diet_plan.map(async (item: any) => {
          await prisma.predictedDetails.create({
            data: {
              bmr,
              tdee,
              bmi,
              calorie_target,
              Name: item.Name,
              calories: item["Calories (kcal)"],
              protein: item["Protein (g)"],
              carbs: item["Carbs (g)"],
              fats: item["Fat (g)"],
              sodium: item["Sodium (mg)"],
              fiber: item["Fiber (g)"],
              sugar: item["Sugar (g)"],
              Instructions: item.Instructions,
              image: item.Image,
              user: { connect: { id: userId } },
            },
          });
        })
      );
    }

    res.status(200).json({
      message: "Input and prediction saved",
      inputDetails,
      dietPlan: diet_plan,
      bmr,
      tdee,
      bmi,
      calorie_target,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
