import prisma from "../config/db";
import type { Request, Response } from "express";

type AuthenticatedRequest = Request & { user?: { id: number } };

export const submitFeedback = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { inputDetailId, weightChange, achieved, note } = req.body;

    if (!userId || !inputDetailId) {
      return res.status(400).json({ message: "Missing required fields." });
    }

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

    res.status(200).json({ message: "Feedback submitted", feedback });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ message: "Server error" });
  }
};

