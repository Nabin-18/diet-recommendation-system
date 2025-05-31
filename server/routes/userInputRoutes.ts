import express from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import { getAllInputDetailsOfUser } from "../controllers/userInputDetailsController";

const router = express.Router();

router.post("/user-input", authenticateUser, getAllInputDetailsOfUser);

export default router;
