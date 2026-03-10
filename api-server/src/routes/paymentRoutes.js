// routes/paymentRoutes.js

import express from "express";
const router = express.Router();

import authMiddleware from "../middlewares/authMiddleware.js";
import {
  validateCreatePayment,
  validateUpdatePayment,
  validatePaymentId
} from "../validations/paymentValidations.js";
import validateRequest from "../middlewares/validateRequestMiddleware.js";
import paymentController from "../controllers/paymentControllers.js";

/**
 * ---------------------------
 * STATIC & FEATURE ROUTES
 * ---------------------------
 */

/**
 * (No static feature routes for payments for now)
 * Keep this section for future extensions
 */

/**
 * ---------------------------
 * COLLECTION ROUTES
 * ---------------------------
 */

// List payments
router.get("/", authMiddleware, paymentController.listPayments);

// Create new payment
router.post(
  "/",
  authMiddleware,
  validateCreatePayment,
  validateRequest,
  paymentController.createPayment
);

/**
 * ---------------------------
 * PARAMETERIZED ROUTES
 * ---------------------------
 */

// Get single payment
router.get(
  "/:id",
  authMiddleware,
  validatePaymentId,
  validateRequest,
  paymentController.getPayment
);

// Update payment
router.put(
  "/:id",
  authMiddleware,
  validatePaymentId,
  validateUpdatePayment,
  validateRequest,
  paymentController.updatePayment
);

// Delete payment
router.delete(
  "/:id",
  authMiddleware,
  validatePaymentId,
  validateRequest,
  paymentController.deletePayment
);

export default router;
export { router as paymentRouter };
