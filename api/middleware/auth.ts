import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import config from "../config";

export interface CustomRequest extends Request {
  user: string | JwtPayload;
}

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];

      if (token) {
        jwt.verify(token, config.JWT_SECRET as Secret, (err, user) => {
          if (err) {
            return res.status(401).json({ success: false, message: err.name });
          }
          (req as CustomRequest).user = user as JwtPayload;
          next();
        });
      } else {
        return res.status(401).json({ success: false, message: "Invalid authorization token" });
      }
    } else {
      return res.status(401).json({ success: false, message: "No authorization token provided" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
};
