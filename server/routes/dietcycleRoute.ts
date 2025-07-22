import express from "express";
import { handleDietCycleResponse } from "../controllers/dietcyclecontroller";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/new-cycle", authenticateToken,handleDietCycleResponse );

export default router;
