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

  const oldInputs = await prisma.userInputDetails.findMany({
    where: {
      createdAt: { lt: twoMinutesAgo },
      feedback: null,
    },
    include: { user: true },
  });

  for (const input of oldInputs) {
    await prisma.notification.create({
      data: {
        userId: input.userId,
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
      to: input.user.email,
      subject: "Diet Plan Feedback Reminder",
      html: `
        <h3>We value your progress!</h3>
        <p>Hi ${input.user.name},</p>
        <p>This is your scheduled reminder to provide feedback on your current diet plan.</p>
        <p><a href="${feedbackLink}" target="_blank" style="background-color:#2563eb; color:white; padding:10px 16px; border-radius:5px; text-decoration:none;">Click here to give feedback</a></p>
        <p>Or copy this link into your browser:<br /> <a href="${feedbackLink}">${feedbackLink}</a></p>
      `,
    });
  }

  console.log(`✅ Sent ${oldInputs.length} feedback reminders.`);
};
