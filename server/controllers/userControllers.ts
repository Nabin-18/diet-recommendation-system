import prisma from "../config/db";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signUpController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, dob, gender } = req.body;

    const image = req.file? `/uploads/${req.file.filename}` : null;



    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        dob: dob ? new Date(dob) : null,
        gender,
        image,
      },
    });

    res.status(201).json({
      message: "User created successfully!",
      data: { id: newUser.id, name: newUser.name, email: newUser.email,dob: newUser.dob, gender: newUser.gender, image: newUser.image  },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logInController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: "Invalid password" });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET_KEY;
    if (!jwtSecret) {
      res.status(500).json({ message: "JWT secret key is not defined" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
