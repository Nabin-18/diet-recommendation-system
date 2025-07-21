import prisma from "../config/db";
import type { Request, Response } from "express";
// import { AuthenticatedRequest } from "../middleware/authMiddleware";
type AuthenticatedRequest = Request & { user?: { id: number } };
import nodemailer from "nodemailer";

interface CreateNotificationParams {
  userId: number;
  type: string;
  title: string;
  message: string;
}

export const createNotification = async (params: CreateNotificationParams) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        read: false,
        sentAt: new Date(),
      },
    });

    console.log(
      `Notification created for user ${params.userId}: ${params.title}`
    );
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};
const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const processWeightAndSendNotification = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { currentWeight, expectedWeight } = req.body;

    if (!currentWeight || !expectedWeight) {
      res.status(400).json({
        message: "Current weight and expected weight are required",
      });
      return;
    }

    // Get user details for email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Calculate weight difference
    const weightDiff = currentWeight - expectedWeight;
    let notificationMessage: string;
    let notificationType: string;
    let emailSubject: string;
    let emailBody: string;

    if (weightDiff > 0) {
      // User is above expected weight
      notificationMessage = `Your current weight (${currentWeight} kg) is ${weightDiff.toFixed(
        1
      )} kg above the expected weight (${expectedWeight} kg). A customized diet plan has been generated to help you reach your goal.`;
      notificationType = "WEIGHT_ABOVE_EXPECTED";
      emailSubject = "Diet Plan Generated - Weight Above Target";
      emailBody = `
        <h2>Diet Plan Generated</h2>
        <p>Dear ${user.name},</p>
        <p>Your weight assessment has been completed:</p>
        <ul>
          <li><strong>Current Weight:</strong> ${currentWeight} kg</li>
          <li><strong>Expected Weight:</strong> ${expectedWeight} kg</li>
          <li><strong>Difference:</strong> +${weightDiff.toFixed(
            1
          )} kg above target</li>
        </ul>
        <p>Don't worry! We've generated a personalized diet plan to help you reach your weight goal safely and effectively.</p>
        <p>Check your dashboard for your new diet recommendations.</p>
        <p>Best regards,<br>Diet Recommendation System</p>
      `;
    } else if (weightDiff < 0) {
      // User is below expected weight
      const absWeightDiff = Math.abs(weightDiff);
      notificationMessage = `Great news! Your current weight (${currentWeight} kg) is ${absWeightDiff.toFixed(
        1
      )} kg below the expected weight (${expectedWeight} kg). A maintenance diet plan has been generated for you.`;
      notificationType = "WEIGHT_BELOW_EXPECTED";
      emailSubject = "Congratulations! Diet Plan Generated";
      emailBody = `
        <h2>Congratulations on Your Progress!</h2>
        <p>Dear ${user.name},</p>
        <p>Excellent work on your weight management:</p>
        <ul>
          <li><strong>Current Weight:</strong> ${currentWeight} kg</li>
          <li><strong>Expected Weight:</strong> ${expectedWeight} kg</li>
          <li><strong>Achievement:</strong> ${absWeightDiff.toFixed(
            1
          )} kg below target!</li>
        </ul>
        <p>You're doing great! We've generated a maintenance diet plan to help you sustain your healthy weight.</p>
        <p>Check your dashboard for your personalized diet recommendations.</p>
        <p>Keep up the excellent work!<br>Diet Recommendation System</p>
      `;
    } else {
      // User is at expected weight
      notificationMessage = `Perfect! Your current weight (${currentWeight} kg) matches the expected weight. A balanced maintenance diet plan has been generated for you.`;
      notificationType = "WEIGHT_AT_TARGET";
      emailSubject = "Perfect Weight Match - Diet Plan Generated";
      emailBody = `
        <h2>Perfect Weight Achievement!</h2>
        <p>Dear ${user.name},</p>
        <p>Congratulations! You've achieved your target weight:</p>
        <ul>
          <li><strong>Current Weight:</strong> ${currentWeight} kg</li>
          <li><strong>Expected Weight:</strong> ${expectedWeight} kg</li>
          <li><strong>Status:</strong> Perfect match!</li>
        </ul>
        <p>We've generated a balanced maintenance diet plan to help you maintain this healthy weight.</p>
        <p>Check your dashboard for your personalized recommendations.</p>
        <p>Excellent achievement!<br>Diet Recommendation System</p>
      `;
    }

    // Create in-app notification
    await prisma.notification.create({
      data: {
        userId: userId,
        type: notificationType,
        title: "Diet Plan Generated",
        message: notificationMessage,
        read: false,
        sentAt: new Date(),
      },
    });

    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: emailSubject,
      html: emailBody,
    };

    try {
      await emailTransporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${user.email}`);
    } catch (emailError) {
      console.error(`Failed to send email to ${user.email}:`, emailError);
      // Continue execution even if email fails
    }

    // Update user's weight data
    await prisma.user.update({
      where: { id: userId },
      data: {
        currentWeight: currentWeight,
        lastWeightUpdate: new Date(),
      },
    });

    res.status(200).json({
      message: "Weight processed and notifications sent successfully",
      weightStatus: {
        current: currentWeight,
        expected: expectedWeight,
        difference: weightDiff,
        status:
          weightDiff > 0
            ? "above_target"
            : weightDiff < 0
            ? "below_target"
            : "at_target",
      },
      notificationSent: true,
    });
  } catch (error) {
    console.error("Error processing weight and sending notification:", error);
    res
      .status(500)
      .json({ message: "Failed to process weight and send notification" });
  }
};

export const sendWeightReminderAfterDays = async (
  userId: number,
  days: number = 15
): Promise<void> => {
  try {
    // This function can be called by a cron job after specified days
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
        currentWeight: true,
        lastWeightUpdate: true,
      },
    });

    if (!user) return;

    const daysSinceLastUpdate = user.lastWeightUpdate
      ? Math.floor(
          (Date.now() - user.lastWeightUpdate.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

    if (daysSinceLastUpdate >= days) {
      // Create reminder notification
      await prisma.notification.create({
        data: {
          userId: userId,
          type: "WEIGHT_UPDATE_REMINDER",
          title: `${days}-Day Weight Check Reminder`,
          message: `It's been ${daysSinceLastUpdate} days since your last weight update. Please update your current weight to get a fresh diet plan.`,
          read: false,
          sentAt: new Date(),
        },
      });

      // Send reminder email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `${days}-Day Weight Update Reminder`,
        html: `
          <h2>Time for Your Weight Check!</h2>
          <p>Dear ${user.name},</p>
          <p>It's been ${daysSinceLastUpdate} days since your last weight update.</p>
          <p>To ensure you're getting the most effective diet plan, please:</p>
          <ol>
            <li>Weigh yourself</li>
            <li>Update your current weight in the app</li>
            <li>Get your refreshed diet recommendations</li>
          </ol>
          <p>Regular weight monitoring helps us provide you with the best possible diet plan.</p>
          <p>Best regards,<br>Diet Recommendation System</p>
        `,
      };

      await emailTransporter.sendMail(mailOptions);
      console.log(`Weight reminder sent to user ${userId}`);
    }
  } catch (error) {
    console.error(`Error sending weight reminder to user ${userId}:`, error);
  }
};

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
        userId: userId,
      },
      data: { read: true },
    });

    if (updatedNotification.count === 0) {
      res
        .status(404)
        .json({ message: "Notification not found or not owned by user" });
      return;
    }

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Failed to update notification" });
  }
};
