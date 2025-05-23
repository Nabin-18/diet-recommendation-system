import { Router } from "express";
import { logInController, signUpController } from "../controllers/userControllers";


const router = Router()

router.post("/create-account", signUpController)
router.get("/get-user", logInController)

export default router;