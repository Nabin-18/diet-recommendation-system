import express from 'express';
import { askDoctor } from '../controllers/chatbot';

const router = express.Router();

router.post('/ask-doctor', askDoctor);

export default router;
