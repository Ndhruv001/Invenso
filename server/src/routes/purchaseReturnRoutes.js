/**
 * routes/purchaseReturnRoutes.js
 * Routes for PurchaseReturn resource.
 * RESTful CRUD routes with validation and auth middleware.
 */

import express from "express";
const router = express.Router();

import purchaseReturnController from "../controllers/purchaseReturnControllers.js";
import {
  validatePurchaseReturn,
  validatePurchaseReturnId,
  validatePurchaseReturnQuery,
  validateBulkDelete,
} from "../validations/purchaseReturnValidations.js";

import validateRequest from "../middlewares/validateRequestMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";

// List purchase returns with filters and stats
router.get(
  "/",
  authMiddleware,
  validatePurchaseReturnQuery,
  validateRequest,
  purchaseReturnController.listPurchaseReturns
);

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
  validatePurchaseReturn,
  validateRequest,
  purchaseReturnController.createPurchaseReturn
);

// Update purchase return by ID
router.put(
  "/:id",
  authMiddleware,
  validatePurchaseReturnId,
  validatePurchaseReturn,
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

// Bulk delete purchase returns
router.post(
  "/bulk-delete",
  authMiddleware,
  validateBulkDelete,
  validateRequest,
  purchaseReturnController.bulkDeletePurchaseReturns
);

export default router;
export { router };
