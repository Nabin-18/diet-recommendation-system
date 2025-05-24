
import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
const PORT = process.env.PORT || 5000;
dotenv.config();

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// connectt database 
connectDB();

// import routes
import userRoutes from './routes/userRoutes'
import userInputRoutes from './routes/userInputRoutes'
import predictedDietRoutes from './routes/predictedDietRoutes'
// import {  generateExpiry, generateOTP } from './controllers/forgetPassword';


app.use("/api/user", userRoutes)
app.use("/api/user", userInputRoutes)
//get the details from dataset 

app.use("/api", predictedDietRoutes)

app.get('/', (req, res) => {
  res.send('Hello World');
});


// //calling my function 
// generateOTP()
// generateExpiry

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

