import express, { type Express, type Request, type Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fetch from 'node-fetch';
import multer from 'multer';
import path from 'path';
import { connectDB } from './config/db';
import upload from "./middleware/uploadMiddleware";

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));


// Connect to DB
connectDB();

// Routes
import userRoutes from './routes/userRoutes';
import userInputRoutes from './routes/userInputRoutes';
import predictedDietRoutes from './routes/predictedDietRoutes';
import dashboardRoute from './routes/dashboardRoute';
import geminiRoute from './routes/geminiRoute';
import notificationRoutes from './routes/notificationRoute';
// Register routes
app.use("/api/user", userRoutes);
app.use("/api/user", userInputRoutes);
app.use("/api", predictedDietRoutes);
app.use("/api", dashboardRoute);
app.use("/api", geminiRoute);
app.use("/api", notificationRoutes);

// FastAPI bridge route
app.post("/api/fetch", async (req: Request, res: Response) => {
  try {
    const fastApiResponse = await fetch("http://127.0.0.1:8000/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await fastApiResponse.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("FastAPI error:", error);
    res.status(500).json({ message: "Can't connect with Python server" });
  }
});

// Root route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World');
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
