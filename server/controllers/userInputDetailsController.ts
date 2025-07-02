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
  mealPlan?: string; // Make optional
  mealFrequency: number;
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
    console.log("User ID from request:", userId); // Debug log

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
      mealFrequency,
      startDate,
      endDate,
      cycleNumber,
    } = req.body as UserInputDetails;

    // Add validation for required fields - mealPlan is now optional
    // if (!mealPlan) {
    //   res.status(400).json({ message: "mealPlan is required" });
    //   return;
    // }

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
        mealPlan: mealPlan || "balanced", // Provide default value
        mealFrequency: mealFrequency || 3,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate
          ? new Date(endDate)
          : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        cycleNumber: cycleNumber || 1,
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
      Type: preferences.toLowerCase(),
      meal_type: (mealPlan || "balanced").toLowerCase(),
      health_conditions: healthIssues
        .split(",")
        .map((c) => c.trim().toLowerCase()),
      activity_type: activityType.toLowerCase(),
    };

    // 3. Send POST to Python model (FastAPI)
    const pythonResponse = await axios.post(
      "http://localhost:8000/recommend",
      fastApiPayload
    );
    const { bmr, tdee, bmi, calorie_target, diet_plan } = pythonResponse.data;

    // 4. Save predicted diet to PredictedDetails
    if (diet_plan?.length > 0) {
      await prisma.predictedDetails.create({
        data: {
          bmr,
          tdee,
          bmi,
          calorie_target,
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
              fat: item["Fat (g)"] || 0, // Fixed: changed from 'fats' to 'fat'
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

      try {
        console.log("=== CREATING DIET PLAN NOTIFICATION ===");
        await createNotification({
          userId: userId,
          type: "DIET_PLAN_GENERATED",
          title: "New Diet Plan Ready! 🍽️",
          message: `Your personalized ${goal.toLowerCase()} diet plan has been generated with ${
            diet_plan.length
          } meals! Target: ${calorie_target} calories. Check it out and start your healthy eating journey!`,
        });
        console.log("✅ Diet plan notification created successfully!");
      } catch (notificationError) {
        console.error(
          "❌ Failed to create diet plan notification:",
          notificationError
        );
        // Don't fail the whole process if notification fails
      }
    }

    const responseData = {
      message: "Input and prediction saved successfully",
      userId: userId, // Add userId to response
      inputDetails,
      bmr,
      tdee,
      bmi,
      calorie_target,
    };

    console.log("Sending response:", responseData); // Debug log
    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error in user input processing:", error);
    res.status(500).json({ message: "Server error" });
  }
};
