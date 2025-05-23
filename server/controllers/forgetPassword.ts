import prisma from "../config/db";
import type { Request, Response } from "express";



//generate otp 

export const generateOTP = () => {

  const result = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(result)
  return result;

}

//expiry time of otp 

export const generateExpiry =(minutes=10)=>{
 const extime=new Date(Date.now()+minutes*60*100)
 console.log(extime)
}

//send otp to the user registerd gmail