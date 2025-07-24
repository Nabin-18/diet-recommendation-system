import cron from "node-cron";
import { sendFeedbackReminders } from "./feedbackreminder";

// Schedule to run once per day at midnight
// cron.schedule("0 0 * * *", async () => {
//   console.log("Running feedback reminder cron job...");
//   await sendFeedbackReminders();
// });

cron.schedule("*/2 * * * *", async () => {
  console.log("⏰ Running feedback reminder every 2 minutes...");
  await sendFeedbackReminders();
});
