import axios from "axios";
import prisma from "../config/db";
import type { Request, Response } from "express";

type AuthenticatedRequest = Request & {
  user?: { id: number };
};

export const submitFeedback = async (req: AuthenticatedRequest, res: Response) => {
  console.log("Received feedback submission:", req.body);
  try {
    const userId = req.user?.id;
    const { inputDetailId, weightChange, achieved, note, regenerate } = req.body;

    if (!userId || !inputDetailId) {
      return res.status(400).json({ message: "Missing required data" });
    }

    const weightChangeNumber = weightChange !== undefined && weightChange !== null
      ? Number(weightChange)
      : null;
    const weightChangeString = weightChangeNumber !== null ? String(weightChangeNumber) : null;

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

    // Fetch updated input details
    const inputDetails = await prisma.userInputDetails.findUnique({
      where: { id: Number(inputDetailId) },
    });

    console.log("Fetched inputDetails after update:", inputDetails?.weight);

    if (!inputDetails) {
      return res.status(404).json({ message: "User input details not found" });
    }

    let responseData: { message: string; newDiet?: { prediction: any; meals: any } } = {
      message: "Feedback submitted successfully",
    };

    if (regenerate) {
      const previousMeals = await prisma.mealPrediction.findMany({
        where: { prediction: { inputId: inputDetails.id } },
        select: { name: true },
      });

      const excludeRecipeNames = previousMeals.map((m) => m.name);

      const healthConditions =
        Array.isArray(inputDetails.healthIssues)
          ? inputDetails.healthIssues
          : typeof inputDetails.healthIssues === "string" && inputDetails.healthIssues.trim() !== ""
            ? inputDetails.healthIssues.split(",").map((s: string) => s.trim()).filter(Boolean)
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
        exclude_recipe_names: Array.isArray(excludeRecipeNames) ? excludeRecipeNames : [],
      };

      console.log("Sending to FastAPI:", mappedInput);

      let apiResponse;
      try {
        apiResponse = await axios.post("http://127.0.0.1:8000/recommend", mappedInput);
      } catch (err: any) {
        console.error("FastAPI error:", err?.response?.data || err.message);
        return res.status(500).json({
          message: err?.response?.data?.message || "Error from recommendation service",
          fastapiError: err?.response?.data,
        });
      }

      console.log("Received from FastAPI:", apiResponse.data);
      const prediction = apiResponse.data;
      const meals = Array.isArray(prediction?.diet_plan?.meals) ? prediction.diet_plan.meals : [];

      responseData = {
        message: "Feedback submitted and new diet plan generated",
        newDiet: {
          prediction,
          meals,
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
