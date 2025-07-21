import express from "express";
import { submitFeedback } from "../controllers/feedbackController";
import { authenticateToken } from "../middleware/authMiddleware";
const router = express.Router();
router.post("/feedback", authenticateToken, submitFeedback);

export default router


