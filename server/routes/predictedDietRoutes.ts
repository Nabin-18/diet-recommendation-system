import { Router } from "express"; 
import { savePrediction,getPredictedDetails } from "../controllers/predictedDiet";

const router=Router()

router.post("/save-prediction",savePrediction)
router.get("/prediction/:userId",getPredictedDetails)

export default router