/**
 * routes/purchaseReturnRoutes.js
 * Routes for Purchase Return resource.
 * RESTful CRUD routes with validation and auth middleware.
 */

import express from "express";
const router = express.Router();

import purchaseReturnController from "../controllers/purchaseReturnControllers.js";
import {
  validateCreatePurchaseReturn,
  validateUpdatePurchaseReturn,
  validatePurchaseReturnId
} from "../validations/purchaseReturnValidations.js";

import validateRequest from "../middlewares/validateRequestMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";

// List purchase returns with filters and stats
router.get("/", authMiddleware, purchaseReturnController.listPurchaseReturns);

// Get purchase return by ID
router.get(
  "/:id",
  authMiddleware,
  validatePurchaseReturnId,
  validateRequest,
  purchaseReturnController.getPurchaseReturn
);

// Create purchase return
router.post(
  "/",
  authMiddleware,
  validateCreatePurchaseReturn,
  validateRequest,
  purchaseReturnController.createPurchaseReturn
);

// Update purchase return by ID
router.put(
  "/:id",
  authMiddleware,
  validatePurchaseReturnId,
  validateUpdatePurchaseReturn,
  validateRequest,
  purchaseReturnController.updatePurchaseReturn
);

// Delete purchase return by ID
router.delete(
  "/:id",
  authMiddleware,
  validatePurchaseReturnId,
  validateRequest,
  purchaseReturnController.deletePurchaseReturn
);

export default router;
export { router };
