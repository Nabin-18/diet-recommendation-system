import prisma from "../config/db";
import type { Request, Response } from "express";
import axios from "axios";
import { createNotification } from "./notificationController";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

interface UserInputDetails {
  height: number;
  weight: number;
  age: number;
  gender: string;
  goal: string;
  activityType: string;
  preferences: string;
  healthIssues: string;
  mealPlan?: string;
  startDate: string;
  endDate: string;
  cycleNumber: number;
}

export const getAllInputDetailsOfUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized: User ID missing" });
      return;
    }

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
      startDate,
      endDate,
      cycleNumber,
    } = req.body as UserInputDetails;

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate
      ? new Date(endDate)
      : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

    // Save user input details
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
        mealPlan: mealPlan || "balanced",
        startDate: start,
        endDate: end,
        cycleNumber: cycleNumber || 1,
        user: { connect: { id: userId } },
      },
    });

    // Payload to FastAPI
    const fastApiPayload = {
      gender: gender.toLowerCase() === "male" ? 1 : 0,
      age,
      height_cm: height,
      weight_kg: weight,
      goal: goal.toLowerCase(),
      Type: preferences.toLowerCase(),
      meal_type: (mealPlan || "balanced").toLowerCase(),
      health_conditions: healthIssues
        .split(",")
        .map((c) => c.trim().toLowerCase()),
      activity_type: activityType.toLowerCase(),
    };

    const pythonResponse = await axios.post(
      "http://localhost:8000/recommend",
      fastApiPayload
    );

    const { bmr, tdee, bmi, calorie_target, diet_plan } = pythonResponse.data;

    // 🧠 Calculate expected weight
    const days = 15;
    const calorie_diff_per_day = calorie_target - tdee;
    const total_calorie_change = calorie_diff_per_day * days;
    const weight_change_kg = total_calorie_change / 7700;
    const expected_weight = parseFloat((weight + weight_change_kg).toFixed(2));

    // Save prediction and meals
    if (diet_plan?.length > 0) {
      await prisma.predictedDetails.create({
        data: {
          bmr,
          tdee,
          bmi,
          calorie_target,
          expectedWeight: expected_weight,
          weightChange: parseFloat(weight_change_kg.toFixed(2)),
          user: { connect: { id: userId } },
          inputDetail: { connect: { id: inputDetails.id } },
          meals: {
            create: diet_plan.map((item: any) => ({
              name: item.Name || "Unknown Meal",
              target_calories:
                item.target_calories || item["Calories (kcal)"] || 0,
              optimized_calories:
                item.optimized_calories || item["Calories (kcal)"] || 0,
              calories: item["Calories (kcal)"] || 0,
              protein: item["Protein (g)"] || 0,
              carbs: item["Carbs (g)"] || 0,
              fat: item["Fat (g)"] || 0,
              sodium: item["Sodium (mg)"] || 0,
              fiber: item["Fiber (g)"] || 0,
              sugar: item["Sugar (g)"] || 0,
              instructions: item.Instructions || "No instructions available",
              image: item.Image || "No image available",
              calorie_match_pct: item.calorie_match_pct || 100,
              optimized_ingredients: item["Optimized Ingredients"] || [],
            })),
          },
        },
      });

      // Send notification
      await createNotification({
        userId,
        type: "DIET_PLAN_GENERATED",
        title: "New Diet Plan Ready! 🍽️",
        message: `Your personalized ${goal.toLowerCase()} diet plan has been generated with ${
          diet_plan.length
        } meals! 🎯 Target: ${calorie_target} kcal/day.\n📉 Expected weight after 15 days: ${expected_weight} kg.`,
      });
    }

    res.status(200).json({
      message: "Input and prediction saved successfully",
      userId,
      inputDetails,
      bmr,
      tdee,
      bmi,
      calorie_target,
      expected_weight,
      weight_change_kg: parseFloat(weight_change_kg.toFixed(2)),
    });
  } catch (error) {
    console.error("Error in getAllInputDetailsOfUser:", error);
    res.status(500).json({ message: "Server error" });
  }
};
