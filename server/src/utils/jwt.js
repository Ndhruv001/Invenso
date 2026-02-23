// utils/jwt.js
import jwt from "jsonwebtoken";
import AppError from "./appErrorUtils.js";

const JWT_SECRET_KEY =
  process.env.JWT_SECRET_KEY || "F70rn6nd1iDOfMKAb07nB62Y7SKjBb+WUbBW58PIc8TGURNsQOTSWflEXZO/jbem";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

// Generate JWT token
export const generateToken = (payload, expiresIn = JWT_EXPIRES_IN) => {
  try {
    return jwt.sign(payload, JWT_SECRET_KEY, { expiresIn });
  } catch (err) {
    throw new AppError("Failed to generate token", 500, "JWT_SIGN_ERROR");
  }
};

// Verify JWT token
export const verifyToken = token => {
  try {
    return jwt.verify(token, JWT_SECRET_KEY);
  } catch (err) {
    throw new AppError("Invalid or expired token", 401, "JWT_VERIFY_ERROR");
  }
};
