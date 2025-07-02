import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { getNotifications, markAsRead } from "../controllers/notificationController";

const router = Router();

router.get("/notifications", authenticateToken, getNotifications);
router.patch("/notifications/:id/read", authenticateToken, markAsRead);

export default router;
