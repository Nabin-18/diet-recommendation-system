import prisma from "../config/db";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"; // ✅ fallback for development

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
    // ✅ Avoid sending duplicate feedback reminder notifications
    const existing = await prisma.notification.findFirst({
      where: {
        relatedId: input.id,
        type: "FEEDBACK_REMINDER",
      },
    });

    if (existing) continue;

    await prisma.notification.create({
      data: {
        userId: input.userId,
        title: "It's Time to Share Feedback!",
        type: "FEEDBACK_REMINDER",
        message: `It's been 15 days since your diet plan started. Let us know how it's going so we can improve it.`,
        sentAt: new Date(),
       relatedId: input.id, 
        hasFeedback: true,
      },
    });

    const feedbackLink = `${frontendUrl}/main-page/feedback-form/${input.id}`; // ✅ full URL

    await transporter.sendMail({
      from: process.env.EMAIL_USER!,
      to: input.user.email,
      subject: "Diet Plan Feedback Reminder",
      html: `
        <h3>We value your progress!</h3>
        <p>Hi ${input.user.name},</p>
        <p>It's been 15 days since you received your personalized diet plan. Please take a moment to provide feedback so we can tailor your next plan even better.</p>
        <p><a href="${feedbackLink}" target="_blank" style="background-color:#2563eb; color:white; padding:10px 16px; border-radius:5px; text-decoration:none;">Click here to give feedback</a></p>
        <p>Or copy this link into your browser: <br /> <a href="${feedbackLink}">${feedbackLink}</a></p>
      `,
    });
  }

  console.log(`Sent ${oldInputs.length} feedback reminders.`);
};
