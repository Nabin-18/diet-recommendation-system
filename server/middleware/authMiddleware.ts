import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: number;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Token missing" });
    return;
  }

  const token = authHeader.split(" ")[1];

  // Check if token exists after splitting
  if (!token) {
    res.status(401).json({ message: "Token missing" });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET_KEY;
  if (!jwtSecret) {
    res.status(500).json({ message: "JWT secret not configured" });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as unknown as JwtPayload;

    // Attach user info to request object
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
    return;
  }
};
