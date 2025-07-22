import axios from "axios";
import prisma from "../config/db";
import type { Request, Response } from "express";

type AuthenticatedRequest = Request & {
  user?: { id: number };
};

export const submitFeedback = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { inputDetailId, weightChange, achieved, note, regenerate } = req.body;

    if (!userId || !inputDetailId) {
      return res.status(400).json({ message: "Missing required data" });
    }

    // 1. Convert weightChange to string for feedback storage
    const weightChangeString = weightChange ? String(weightChange) : null;

    // 2. Upsert feedback
    await prisma.feedback.upsert({
      where: { inputDetailId: Number(inputDetailId) },
      update: { weightChange: weightChangeString, achieved, note },
      create: { inputDetailId: Number(inputDetailId), userId, weightChange: weightChangeString, achieved, note },
    });

    // 3. Update weight if changed
    if (weightChange) {
      await prisma.userInputDetails.update({
        where: { id: Number(inputDetailId) },
        data: { weight: Number(weightChange) },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { currentWeight: Number(weightChange), lastWeightUpdate: new Date() },
      });
    }

    // 4. Prepare basic response message
    let responseData: { message: string; newDiet?: { prediction: any; meals: any } } = { message: "Feedback submitted successfully" };

    // 5. If regenerate is true, fetch input details and regenerate diet plan
    if (regenerate) {
      const inputDetails = await prisma.userInputDetails.findUnique({
        where: { id: Number(inputDetailId) },
      });

      if (!inputDetails) {
        return res.status(404).json({ message: "User input details not found" });
      }

      // 6. Fetch all previous meal names for this inputId to exclude
      const previousMeals = await prisma.mealPrediction.findMany({
        where: { prediction: { inputId: inputDetails.id } },
        select: { name: true },
      });

      const excludeRecipeNames = previousMeals.map((m) => m.name);

      // 7. Build payload for FastAPI
      const mappedInput = {
        gender: inputDetails.gender === "male" ? 1 : 0,
        age: inputDetails.age,
        height_cm: inputDetails.height,
        weight_kg: weightChange || inputDetails.weight,
        goal: inputDetails.goal,
        Type: inputDetails.preferences || "vegetarian",  // or whatever your veg/non-veg field is
        meal_type: inputDetails.mealPlan || "general",
        health_conditions: inputDetails.healthIssues?.split(",") || [],
        activity_type: inputDetails.activityType,
        exclude_recipe_names: excludeRecipeNames,
      };

      // 8. Call FastAPI /recommend endpoint
      const apiResponse = await axios.post(
        `${process.env.FASTAPI_URL || "http://localhost:8000"}/recommend`,
        mappedInput
      );
      const prediction = apiResponse.data;

      if (!prediction?.recommendations) {
        return res.status(500).json({ message: "Invalid response from recommendation service" });
      }
      


      // 9. Mark existing predictions for this input as not current
      await prisma.predictedDetails.updateMany({
        where: { userId, inputId: inputDetails.id },
        data: { isCurrent: false },
      });

      // 10. Save new prediction
      const newPrediction = await prisma.predictedDetails.create({
        data: {
          userId,
          inputId: inputDetails.id,
          Name: `Diet Plan ${new Date().toLocaleDateString()}`,
          bmi: prediction.bmi,
          bmr: prediction.bmr,
          tdee: prediction.tdee,
          calorie_target: prediction.total_calories,
          calories: prediction.total_calories,
          protein: prediction.total_protein,
          carbs: prediction.total_carbohydrate,
          fats: prediction.total_fat,
          fiber: prediction.total_fiber,
          sugar: prediction.total_sugar || 0,
          sodium: prediction.total_sodium || 0,
          isCurrent: true,
        },
      });

      // 11. Save meals
      const meals = await Promise.all(
        prediction.recommendations.map((meal: any) =>
          prisma.mealPrediction.create({
            data: {
              name: meal.name,
              calories: meal.total_calories,
              fat: meal.fat,
              carbs: meal.carbohydrate,
              protein: meal.protein,
              fiber: meal.fiber,
              sugar: meal.sugar,
              sodium: meal.sodium,
              image: meal.image || "",
              instructions: JSON.stringify(meal.recipeinstruction),
              optimized_ingredients: JSON.stringify(meal.ingredient_quantity),
              target_calories: meal.target_calories || 0,
              optimized_calories: meal.optimized_calories || 0,
              calorie_match_pct: meal.calorie_match_pct || 0,
              predictionId: newPrediction.id,
            },
          })
        )
      );

      // 12. Update response
      responseData = {
        message: "Feedback submitted and new diet plan generated",
        newDiet: { prediction: newPrediction, meals },
      };
    }

    return res.status(200).json(responseData);
  } catch (error: any) {
    console.error("Feedback submission error:", error);
    return res.status(500).json({
      message: error.response?.data?.message || "Internal server error",
      error: error.message,
    });
  }
};
