import { Router } from "express";
import { getAllInputDetailsOfUser } from "../controllers/userInputDetailsController";

const router=Router()

router.post("/input-details",getAllInputDetailsOfUser)

export default router