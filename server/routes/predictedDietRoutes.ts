import { Router } from "express"; 
import { savePrediction,getPredictedDetails, getLatestDietPlan } from "../controllers/predictedDiet";
import { authenticateToken } from "../middleware/authMiddleware";

const router=Router()

router.post("/save-prediction",savePrediction)
router.get("/prediction/:userId",authenticateToken,getPredictedDetails)
router.get("/latest-prediction",authenticateToken,getLatestDietPlan)




export default router