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

  // Calculate the date 15 days ago
  // const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);

  // Find all users who have at least one eligible input
  const usersToRemind = await prisma.user.findMany({
    where: {
      UserInputDetails: {
        some: {
          createdAt: { lt: twoMinutesAgo },
          // createdAt: { gte: fifteenDaysAgo },
          feedback: null,
        },
      },
    },
    include: {
      UserInputDetails: {
        where: {
          createdAt: { lt: twoMinutesAgo },
          // createdAt: { gte: fifteenDaysAgo },
          feedback: null,
        },
      },
    },
  });

  let sentCount = 0;

  for (const user of usersToRemind) {
    // Check if a notification was sent in the last 2 minutes for this user
    const recentNotification = await prisma.notification.findFirst({
      where: {
        userId: user.id,
        type: "FEEDBACK_REMINDER",
        sentAt: { gte: twoMinutesAgo },
        // createdAt: { gte: fifteenDaysAgo },
      },
    });

    if (recentNotification) {
      continue; // Already sent recently
    }

    // You can link to the first eligible input for feedback
    const firstInput = user.UserInputDetails[0];

    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "It's Time to Share Feedback!",
        type: "FEEDBACK_REMINDER",
        message: `Reminder: Please provide feedback on your current diet plan.`,
        sentAt: new Date(),
        relatedId: firstInput?.id,
        hasFeedback: true,
      },
    });

    const feedbackLink = `${frontendUrl}/main-page/feedback-form/${firstInput?.id}`;

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
