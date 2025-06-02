import type { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const askDoctor = async (req: Request, res: Response) => {
  const { message } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' }); 

    const result = await model.generateContent(message);
    const reply = result.response.text();

    res.json({ reply });
  } catch (error: any) {
    console.error('Gemini API error:', error.message);
    if (error.message.includes("quota")) {
      return res.status(429).json({
        error: 'Free quota exceeded. Try again tomorrow.',
      });
    }
    res.status(500).json({ error: 'Failed to get response from Gemini API' });
  }
};
