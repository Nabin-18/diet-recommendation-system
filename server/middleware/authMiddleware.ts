import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Request to include user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export const authenticateUser = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(
      token as string,
      process.env.JWT_SECRET_KEY || "default_secret_key"
    ) as unknown as { id: number; email: string };

    req.user = decoded; // Attach decoded token to request
    next();
  } catch (error) {
    console.error("Token error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
