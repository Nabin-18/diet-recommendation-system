import express from "express";
import {authenticateToken } from "../middleware/authMiddleware";
import { getAllInputDetailsOfUser } from "../controllers/userInputDetailsController";

const router = express.Router();

router.post("/user-input", authenticateToken, getAllInputDetailsOfUser);

export default router;
