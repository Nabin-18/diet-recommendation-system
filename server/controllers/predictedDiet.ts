import prisma from "../config/db";
import type { Request, Response } from "express";

//save the predicted diet from the trained dataset

export const savePrediction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, protein, calories, sugar, fats, Name, carbs, sodium, fiber, Instructions, image } = req.body

    const prediction = await prisma.predictedDetails.create({
      data: {
        userId,
        protein,
        calories,
        sugar,
        fats,
        Name,
        carbs,
        sodium,
        fiber,
        Instructions,
        image
      }
    })
    res.status(200).json({
      message: "Predicted Diet saved Successfully",
      data: prediction

    })


  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Internal Server Error"
    })

  }

}

//get all the saved predicated details of diet to show the user 

export const getPredictedDetails = async (req: Request, res: Response): Promise<void> => {

  try {
    const { userId } = req.params
    if (!userId) {
      res.status(400).json({ message: "userId is required" });
      return;
    }
    const prediction = await prisma.predictedDetails.findMany({
      where: { userId: parseInt(userId, 10) },
      //here 10 is the radix value
      //to get the latest predicted data
      orderBy: { predictionDate: "desc" }

    });
    res.status(200).json({
      data: prediction
    })
  }
  catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Error fetching prediction"
    })
  }

}