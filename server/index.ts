import express from 'express';
import type { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import fetch from 'node-fetch'; 
import cors from 'cors'

dotenv.config();
const PORT = process.env.PORT || 5000;



const app: Express = express();

app.use(cors())

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Connect to DB
connectDB();

// Routes
import userRoutes from './routes/userRoutes';
import userInputRoutes from './routes/userInputRoutes';
import predictedDietRoutes from './routes/predictedDietRoutes';
import dashboardRoute from './routes/dashboardRoute'

app.use("/api/user", userRoutes);
app.use("/api/user", userInputRoutes);
app.use("/api", predictedDietRoutes);
app.use("/api",dashboardRoute)

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World');
});

//route that connects to FastAPI
app.get("/api/fetch", async (req: Request, res: Response) => {
  try {
    const fastApiResponse = await fetch("http://127.0.0.1:8000/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await fastApiResponse.json();

    res.status(200).json(data); // Forward FastAPI response to client
  } catch (error) {
    console.error("FastAPI error:", error);
    res.status(500).json({ message: "Can't connect with Python server" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
