import axios from "axios";
import prisma from "../config/db";
import type { Request, Response } from "express";
import { createPrediction } from "./predictedDiet"; // Add this import

type AuthenticatedRequest = Request & {
  user?: { id: number };
};

export const submitFeedback = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  console.log("Received feedback submission:", req.body);
  try {
    const userId = req.user?.id;
    const { inputDetailId, weightChange, achieved, note, regenerate } =
      req.body;

    if (!userId || !inputDetailId) {
      return res.status(400).json({ message: "Missing required data" });
    }

    const weightChangeNumber =
      weightChange !== undefined && weightChange !== null
        ? Number(weightChange)
        : null;
    const weightChangeString =
      weightChangeNumber !== null ? String(weightChangeNumber) : null;

    // Always update DB weight with the latest submitted value
    if (weightChangeNumber !== null) {
      await prisma.userInputDetails.update({
        where: { id: Number(inputDetailId) },
        data: { weight: weightChangeNumber },
      });

      await prisma.user.update({
        where: { id: userId },
        data: {
          currentWeight: weightChangeNumber,
          lastWeightUpdate: new Date(),
        },
      });
    }

    // Upsert feedback
    await prisma.feedback.upsert({
      where: { inputDetailId: Number(inputDetailId) },
      update: { weightChange: weightChangeString, achieved, note },
      create: {
        inputDetailId: Number(inputDetailId),
        userId,
        weightChange: weightChangeString,
        achieved,
        note,
      },
    });

    // fetch updated input details
    const inputDetails = await prisma.userInputDetails.findUnique({
      where: { id: Number(inputDetailId) },
    });

    console.log("Fetched inputDetails after update:", inputDetails?.weight);

    if (!inputDetails) {
      return res.status(404).json({ message: "User input details not found" });
    }

    let responseData: {
      message: string;
      newDiet?: { prediction: any; meals: any };
    } = {
      message: "Feedback submitted successfully",
    };

    if (regenerate) {
      const previousMeals = await prisma.mealPrediction.findMany({
        where: { prediction: { inputId: inputDetails.id } },
        select: { name: true },
      });

      const excludeRecipeNames = previousMeals.map((m) => m.name);

      const healthConditions = Array.isArray(inputDetails.healthIssues)
        ? inputDetails.healthIssues
        : typeof inputDetails.healthIssues === "string" &&
          inputDetails.healthIssues.trim() !== ""
        ? inputDetails.healthIssues
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [];

      // Always use the latest weight stored in UserInputDetails for FastAPI
      const weightForFastAPI = inputDetails.weight;

      const mappedInput = {
        gender: inputDetails.gender === "male" ? 1 : 0,
        age: inputDetails.age,
        height_cm: inputDetails.height,
        weight_kg: weightForFastAPI,
        goal: inputDetails.goal,
        Type: inputDetails.preferences,
        meal_type: inputDetails.mealPlan || "general",
        health_conditions: healthConditions,
        activity_type: inputDetails.activityType,
        exclude_recipe_names: Array.isArray(excludeRecipeNames)
          ? excludeRecipeNames
          : [],
      };

      console.log("Sending to FastAPI:", mappedInput);

      let apiResponse;
      try {
        apiResponse = await axios.post(
          "http://127.0.0.1:8000/recommend",
          mappedInput
        );
      } catch (err: any) {
        console.error("FastAPI error:", err?.response?.data || err.message);
        return res.status(500).json({
          message:
            err?.response?.data?.message || "Error from recommendation service",
          fastapiError: err?.response?.data,
        });
      }

      console.log("Received from FastAPI:", apiResponse.data);
      const prediction = apiResponse.data;
      const predictionData = prediction;
      const meals = Array.isArray(prediction.diet_plan?.meals)
        ? prediction.diet_plan.meals
        : [];

      // Calculate expected weight and weight change (same logic as initial) ---
      const days = 15;
      const calorie_diff_per_day =
        predictionData.calorie_target - predictionData.tdee;
      const total_calorie_change = calorie_diff_per_day * days;
      const weight_change_kg = total_calorie_change / 7700;
      const expected_weight = parseFloat(
        (weightForFastAPI + weight_change_kg).toFixed(2)
      );

      // map meals to match DB schema
      const mappedMeals = meals.map((meal: any) => ({
        name: meal.Name ?? meal.name ?? "Unknown Meal",
        target_calories:
          meal["Target Calories"] ??
          meal.target_calories ??
          meal["Calories (kcal)"] ??
          0,
        optimized_calories:
          meal["Actual Calories"] ??
          meal.optimized_calories ??
          meal["Calories (kcal)"] ??
          0,
        calories: meal["Calories (kcal)"] ?? meal.calories ?? 0,
        protein: meal["Protein (g)"] ?? 0,
        fat: meal["Fat (g)"] ?? 0,
        carbs: meal["Carbs (g)"] ?? 0,
        fiber: meal["Fiber (g)"] ?? 0,
        sugar: meal["Sugar (g)"] ?? 0,
        sodium: meal["Sodium (mg)"] ?? 0,
        instructions:
          meal.Instructions ?? meal.instructions ?? "No instructions available",
        image: meal.Image ?? meal.image ?? "No image available",
        calorie_match_pct:
          meal["Calorie Match %"] ?? meal.calorie_match_pct ?? 100,
        optimized_ingredients:
          meal["Optimized Ingredients"] ?? meal.optimized_ingredients ?? [],
      }));

      console.log("Mapped meals before saving:", mappedMeals);

      // Save new prediction to DB
      const newPrediction = await createPrediction({
        userId,
        inputId: inputDetails.id,
        meals: mappedMeals,
        bmr: predictionData.bmr,
        tdee: predictionData.tdee,
        bmi: predictionData.bmi,
        calorie_target: predictionData.calorie_target,
        expectedWeight: expected_weight, // calculated value
        weightChange: parseFloat(weight_change_kg.toFixed(2)), // calculated value
      });

      responseData = {
        message: "Feedback submitted and new diet plan generated",
        newDiet: {
          prediction: newPrediction,
          meals: newPrediction.meals,
          userInput: inputDetails,
          metadata: { formSubmittedAt: new Date().toISOString() },
        },
      };
    }

    return res.status(200).json(responseData);
  } catch (error: any) {
    console.error("Feedback submission error:", error);
    if (error.response) {
      console.error("FastAPI error response:", error.response.data);
    }
    return res.status(500).json({
      message: error.response?.data?.message || "Internal server error",
      error: error.message,
      fastapiError: error.response?.data,
    });
  }
};
