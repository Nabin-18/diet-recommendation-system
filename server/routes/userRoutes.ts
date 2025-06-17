import { Router } from "express";
import upload from "../middleware/uploadMiddleware";
import { logInController, signUpController } from "../controllers/userControllers";


const router = Router()

// Add multer middleware for handling image upload under "image" field
router.post("/create-account", upload.single("image"), signUpController);
router.post("/get-user", logInController)

export default router;