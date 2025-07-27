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
      : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // default +15 days

    // Save new user input
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

    // Fetch prediction from FastAPI
    const pythonResponse = await axios.post(
      "http://localhost:8000/recommend",
      fastApiPayload
    );

    // console.log(pythonResponse.data);

    const { bmr, tdee, bmi, calorie_target, diet_plan } = pythonResponse.data;

    // Calculate expected weight
    const days = 15;
    const calorie_diff_per_day = calorie_target - tdee;
    const total_calorie_change = calorie_diff_per_day * days;
    const weight_change_kg = total_calorie_change / 7700;
    const expected_weight = parseFloat((weight + weight_change_kg).toFixed(2));

    // Deactivate all other inputs and predictions
    await prisma.userInputDetails.updateMany({
      where: { userId, NOT: { id: inputDetails.id } },
      data: { isActive: false },
    });
    await prisma.predictedDetails.updateMany({
      where: { userId, inputId: inputDetails.id },
      data: { isCurrent: false },
    });

    // --- EXTRACT MEALS ARRAY ---
    // FastAPI may return { diet_plan: { meals: [...] } } or { diet_plan: [...] }
    let meals = [];
    if (Array.isArray(diet_plan)) {
      meals = diet_plan;
    } else if (diet_plan && Array.isArray(diet_plan.meals)) {
      meals = diet_plan.meals;
    }

    // --- CREATE PREDICTION ---
    const newPrediction = await prisma.predictedDetails.create({
      data: {
        userId,
        inputId: inputDetails.id,
        bmr,
        tdee,
        bmi,
        calorie_target,
        expectedWeight: expected_weight,
        weightChange: parseFloat(weight_change_kg.toFixed(2)),
        isCurrent: true,
        meals:
          meals.length > 0
            ? {
                create: meals.map((item: any) => ({
                  name: item.Name || item.name || "Unknown Meal",
                  target_calories:
                    item.target_calories || item["Calories (kcal)"] || 0,
                  optimized_calories:
                    item.optimized_calories || item["Calories (kcal)"] || 0,
                  calories: item["Calories (kcal)"] || item.calories || 0,
                  protein: item["Protein (g)"] || item.protein || 0,
                  carbs: item["Carbs (g)"] || item.carbs || 0,
                  fat: item["Fat (g)"] || item.fat || 0,
                  sodium: item["Sodium (mg)"] || item.sodium || 0,
                  fiber: item["Fiber (g)"] || item.fiber || 0,
                  sugar: item["Sugar (g)"] || item.sugar || 0,
                  instructions:
                    item.Instructions ||
                    item.instructions ||
                    "No instructions available",
                  image: item.Image || item.image || "No image available",
                  calorie_match_pct: item.calorie_match_pct || 100,
                  optimized_ingredients:
                    item["Optimized Ingredients"] ||
                    item.optimized_ingredients ||
                    [],
                })),
              }
            : undefined,
      },
    });

    await prisma.predictedDetails.updateMany({
      where: {
        userId,
        NOT: { id: newPrediction.id },
      },
      data: { isCurrent: false },
    });

    // Send notification to user
    await createNotification({
      userId,
      type: "DIET_PLAN_GENERATED",
      title: "New Diet Plan Ready! 🍽️",
      message: `Your personalized ${goal.toLowerCase()} diet plan has been generated with ${
        diet_plan.length
      } meals! 🎯 Target: ${calorie_target} kcal/day.\n📉 Expected weight after 15 days: ${expected_weight} kg.`,
    });

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
    console.error(" Error in getAllInputDetailsOfUser:", error);
    res.status(500).json({ message: "Server error", error: error });
  }
};
