import prisma from "../config/db";
import type { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

export const getNotifications = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { sentAt: "desc" },
    });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

export const markAsRead = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const notificationId = Number(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (isNaN(notificationId)) {
      res.status(400).json({ message: "Invalid notification ID" });
      return;
    }

    // Update only if notification belongs to user
    const updatedNotification = await prisma.notification.updateMany({
      where: { 
        id: notificationId,
        userId: userId 
      },
      data: { read: true },
    });

    if (updatedNotification.count === 0) {
      res.status(404).json({ message: "Notification not found or not owned by user" });
      return;
    }

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Failed to update notification" });
  }
};