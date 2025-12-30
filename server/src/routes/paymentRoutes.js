/**
 * routes/paymentRoutes.js
 * Routes for Payment resource.
 * Sets up RESTful endpoints with auth and validations.
 */

import express from "express";
const router = express.Router();

import paymentController from "../controllers/paymentControllers.js";
import {
  validatePayment,
  validatePaymentId,
  validatePaymentQuery,
  validateBulkDelete,
} from "../validations/paymentValidations.js";
import validateRequest from "../middlewares/validateRequestMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";

// List payments with filters, pagination, sorting
router.get(
  "/",
  authMiddleware,
  validatePaymentQuery,
  validateRequest,
  paymentController.listPayments
);

// Get payment by ID
router.get(
  "/:id",
  authMiddleware,
  validatePaymentId,
  validateRequest,
  paymentController.getPayment
);

// Create new payment
router.post(
  "/",
  authMiddleware,
  validatePayment,
  validateRequest,
  paymentController.createPayment
);

// Update payment by ID
router.put(
  "/:id",
  authMiddleware,
  validatePaymentId,
  validatePayment,
  validateRequest,
  paymentController.updatePayment
);

// Delete payment by ID
router.delete(
  "/:id",
  authMiddleware,
  validatePaymentId,
  validateRequest,
  paymentController.deletePayment
);

// Bulk delete payments
router.post(
  "/bulk-delete",
  authMiddleware,
  validateBulkDelete,
  validateRequest,
  paymentController.bulkDeletePayments
);

export default router;
export { router };
