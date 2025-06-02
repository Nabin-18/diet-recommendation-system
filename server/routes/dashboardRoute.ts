// routes/dashboard.ts
import { Router } from "express";
import { getDashboardData } from "../controllers/dashboardData";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/dashboard", authenticateToken, getDashboardData);

export default router;
