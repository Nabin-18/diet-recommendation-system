import prisma from "../config/db";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASS!,
  },
});

export const sendFeedbackReminders = async () => {
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

  const inputsToRemind = await prisma.userInputDetails.findMany({
    where: {
      OR: [
        // No feedback yet, created more than 2 minutes ago
        {
          feedback: null,
          createdAt: { lt: twoMinutesAgo },
        },
        // Feedback exists, but feedback.createdAt is more than 2 minutes ago
        {
          feedback: {
            createdAt: { lt: twoMinutesAgo },
          },
        },
      ],
    },
    include: {
      user: true,
      feedback: true,
    },
  });

  let sentCount = 0;

  for (const input of inputsToRemind) {
    const user = input.user;

    // Check if a notification was sent in the last 2 minutes for this user
    const recentNotification = await prisma.notification.findFirst({
      where: {
        userId: user.id,
        type: "FEEDBACK_REMINDER",
        sentAt: { gte: twoMinutesAgo },
      },
    });

    if (recentNotification) {
      continue; // Already sent recently
    }

    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "It's Time to Share Feedback!",
        type: "FEEDBACK_REMINDER",
        message: `Reminder: Please provide feedback on your current diet plan.`,
        sentAt: new Date(),
        relatedId: input.id,
        hasFeedback: true,
      },
    });

    const feedbackLink = `${frontendUrl}/main-page/feedback-form/${input.id}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER!,
      to: user.email,
      subject: "Diet Plan Feedback Reminder",
      html: `
        <h3>We value your progress!</h3>
        <p>Hi ${user.name},</p>
        <p>This is your scheduled reminder to provide feedback on your current diet plan.</p>
        <p><a href="${feedbackLink}" target="_blank" style="background-color:#2563eb; color:white; padding:10px 16px; border-radius:5px; text-decoration:none;">Click here to give feedback</a></p>
        <p>Or copy this link into your browser:<br /> <a href="${feedbackLink}">${feedbackLink}</a></p>
      `,
    });

    sentCount++;
  }

  console.log(`Sent ${sentCount} feedback reminders.`);
};
