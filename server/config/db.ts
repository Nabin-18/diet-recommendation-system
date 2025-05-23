import { PrismaClient } from "../generated/prisma";
import dotenv from "dotenv";
dotenv.config();
const prisma = new PrismaClient()

export default prisma;

export const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("DB connected");
    } catch (error) {
        console.error("DB connection error", error);
    }

}