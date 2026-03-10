// routes/auth.routes.js
import express from "express";
import { login, logout, me } from "../controllers/authControllers.js";
import validateRequest from "../middlewares/validateRequestMiddleware.js";
import { loginValidation } from "../validations/authValidations.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { loginLimiter } from "../config/limiter.js";

const router = express.Router();

router.post("/login", loginLimiter, loginValidation, validateRequest, login);

router.post("/logout", authMiddleware, logout);

router.get("/me", authMiddleware, me);

export default router;
export { router as authRoutes };
