import prisma from "../config/db";
import type { Request, Response } from "express";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const signUpController = async (req: Request, res: Response): Promise<void> => {
  try {

    const { name, email, password } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)

    //check wheather user is already exist or not 

    const existingUser = await prisma.user.findUnique({
      where: {
        email: email
      }
    });
    if (existingUser) {
      res.status(400).json({
        message: "User already exist"
      })
      return;
    }

    //create new user if user is not registerd already 

    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword

      }

    })
    res.status(200).json({
      message: "User Created Successfully!",
      data: newUser
    })

  }
  catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Internal Server Error"
    })

  }

}

//get the data from database to login the user 

export const logInController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body 
    const user = await prisma.user.findUnique({

      where: { email: email }
    })
    if (!user) {
      res.status(400).json({
        message: "Invalid credentials"
      })
      return;
    }
    const comparedPassword = await bcrypt.compare(password, user.password)
    if (!comparedPassword) {
      res.status(400).json({
        message: "Invalid password"
      })
      return
    }
    //generate jwt token for proper authentication
    const token = jwt.sign(
      {
        id: user.id, email: user.email
      },
      //this is payload
      process.env.JWT_SECRET_KEY || "default_secret_key", //secret
      {
        expiresIn: process.env.JWT_EXPIRES_IN ? parseInt(process.env.JWT_EXPIRES_IN, 10) || "1d" : "1d"
      }
    )
    res.status(200).json({
      message: "Login Successfull !",
      user,
      token
    })



  } catch (error) {
    console.log(error)
    res.status(400).json({
      message: "Internal server Error!"
    })

  }

}