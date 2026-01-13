/**
 * routes/purchaseRoutes.js
 * Routes for Purchase resource.
 * RESTful CRUD routes with validation and auth middleware.
 */

import express from "express";
const router = express.Router();

import purchaseController from "../controllers/purchaseControllers.js";
import {
  validatePurchase,
  validatePurchaseId,
} from "../validations/purchaseValidations.js";

import validateRequest from "../middlewares/validateRequestMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";

// List purchases with filters and stats
router.get(
  "/",
  authMiddleware,
  purchaseController.listPurchases
);

// Get purchase by ID
router.get(
  "/:id",
  authMiddleware,
  validatePurchaseId,
  validateRequest,
  purchaseController.getPurchase
);

// Create purchase
router.post(
  "/",
  authMiddleware,
  validatePurchase,
  validateRequest,
  purchaseController.createPurchase
);

// Update purchase by ID
router.put(
  "/:id",
  authMiddleware,
  validatePurchaseId,
  validateRequest,
  purchaseController.updatePurchase
);

// Delete purchase by ID
router.delete(
  "/:id",
  authMiddleware,
  validatePurchaseId,
  validateRequest,
  purchaseController.deletePurchase
);


export default router;
export { router };
