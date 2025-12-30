// routes/auth.routes.js
import express from "express";
import { login, logout } from "../controllers/authControllers.js";
import validateRequest from "../middlewares/validateRequestMiddleware.js";
import { loginValidation } from "../validations/authValidations.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import loginLimiter from "../config/limiter.js";

const router = express.Router();

router.post("/login",  loginValidation, validateRequest, login);

router.post("/logout", authMiddleware, logout);

export default router;
export { router as authRoutes };
