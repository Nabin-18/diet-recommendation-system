import axios from "axios";
import prisma from "../config/db";
import type { Request, Response } from "express";

type AuthenticatedRequest = Request & { user?: { id: number } };

export const submitFeedback = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { inputDetailId, weightChange, achieved, note, regenerate } = req.body;

    if (!userId || !inputDetailId) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // 1. Upsert feedback
    const feedback = await prisma.feedback.upsert({
      where: { inputDetailId: Number(inputDetailId) },
      update: {
        weightChange: String(weightChange),
        achieved: achieved === "true",
        note,
      },
      create: {
        weightChange: String(weightChange),
        achieved: achieved === "true",
        note,
        inputDetailId: Number(inputDetailId),
        userId,
      },
    });

    // 2. If regeneration is requested
    let newDiet = null;

    if (regenerate === "true") {
      // a. Get all previously used recipe names
      const previousMeals = await prisma.mealPrediction.findMany({
        where: {
          prediction: {
            inputDetail: {
              userId,
            },
          },
        },
        select: { name: true },
      });

      const exclude = previousMeals.map((m) => m.name);

      // b. Get latest input details
      const inputDetails = await prisma.userInputDetails.findUnique({
        where: { id: Number(inputDetailId) },
      });

      if (!inputDetails) {
        return res.status(404).json({ message: "Input details not found." });
      }

      // c. Request new diet plan from FastAPI
      const response = await axios.post("http://localhost:8000/recommend", {
        ...inputDetails,
        exclude,
      });

      const data = response.data;
      const dietName = `Diet-${Date.now()}`;

      // d. Save new prediction
      const newPrediction = await prisma.predictedDetails.create({
        data: {
          dietName,
          tdee: data.tdee,
          bmr: data.bmr,
          bmi: data.bmi,
          calories: data.total_calories,
          fat: data.total_fat,
          protein: data.total_protein,
          carbs: data.total_carbohydrate,
          fiber: data.total_fiber,
          userInputDetailsId: Number(inputDetailId),
        },
      });

      // e. Save all meals
      for (const meal of data.diet_plan) {
        await prisma.mealPrediction.create({
          data: {
            name: meal.name,
            calories: meal.total_calories,
            protein: meal.protein,
            carbs: meal.carbohydrate,
            fat: meal.fat,
            fiber: meal.fiber,
            sodium: meal.sodium,
            sugar: meal.sugar,
            ingredient_quantity: JSON.stringify(meal.ingredient_quantity),
            recipeinstruction: JSON.stringify(meal.recipeinstruction),
            predictedDetailsId: newPrediction.id,
          },
        });
      }

      newDiet = { dietName, meals: data.diet_plan };
    }

    return res.status(200).json({
      message: "Feedback submitted successfully",
      feedback,
      ...(newDiet && { newDiet }),
    });

  } catch (error: any) {
    console.error("❌ Error in submitFeedback:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
