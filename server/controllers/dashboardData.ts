// controllers/dashboard.ts

import type { Request, Response } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

export const getDashboardData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
      },
    });

    // Get latest input details
    const latestInput = await prisma.userInputDetails.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // Get latest prediction
    const latestPrediction = await prisma.predictedDetails.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      user,
      inputDetails: latestInput,
      prediction: latestPrediction,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
