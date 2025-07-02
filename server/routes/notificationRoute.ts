import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  getNotifications,
  markAsRead,
  processWeightAndSendNotification,
} from "../controllers/notificationController";

const router = Router();

router.get("/notifications", authenticateToken, getNotifications);
router.patch("/notifications/:id/read", authenticateToken, markAsRead);
router.post(
  "/process-weight",
  authenticateToken,
  processWeightAndSendNotification
);

export default router;
