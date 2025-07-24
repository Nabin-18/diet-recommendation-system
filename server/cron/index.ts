import cron from "node-cron";
import { sendFeedbackReminders } from "./feedbackreminder";

// Runs at midnight on the 1st and 16th of every month
// cron.schedule("0 0 1,16 * *", async () => {
//   console.log("Running feedback reminder every 15 days...");
//   await sendFeedbackReminders();
// });

cron.schedule("*/2 * * * *", async () => {
  console.log("Running feedback reminder every 2 minutes...");
  await sendFeedbackReminders();
});
