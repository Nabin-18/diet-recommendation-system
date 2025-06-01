import { Router } from "express"; 
import { savePrediction,getPredictedDetails } from "../controllers/predictedDiet";
import { authenticateToken } from "../middleware/authMiddleware";

const router=Router()

router.post("/save-prediction",savePrediction)
router.get("/prediction/:userId",authenticateToken,getPredictedDetails)

export default router