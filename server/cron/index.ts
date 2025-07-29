import cron from "node-cron";
import { sendFeedbackReminders } from "./feedbackreminder";


// for production to check notification is send or not every day
// cron.schedule("0 0 * * *", async () => {
//   console.log("Daily reminder check running...");
//   await sendFeedbackReminders();
// });



cron.schedule("*/15 * * * * *", async () => {
  console.log("Running feedback reminder every 15 seconds...");
  await sendFeedbackReminders();
});
