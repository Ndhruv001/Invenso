/**
 * routes/purchaseRoutes.js
 * Routes for Purchase resource.
 * RESTful CRUD routes with validation and auth middleware.
 */

import express from "express";
const router = express.Router();

import purchaseController from "../controllers/purchaseControllers.js";
import {
  validateCreatePurchase,
  validateUpdatePurchase,
  validatePurchaseId
} from "../validations/purchaseValidations.js";

import validateRequest from "../middlewares/validateRequestMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";

// List purchases with filters and stats
router.get("/", authMiddleware, purchaseController.listPurchases);

router.get("/download/invoice/:id", purchaseController.getPurchaseInvoicePdf);
router.get("/print/invoice/:id", purchaseController.printPurchaseInvoicePdf);

// Get purchase by Party ID
router.get("/party-id/:partyId", authMiddleware, purchaseController.getPurchaseByPartyId);

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
  validateCreatePurchase,
  validateRequest,
  purchaseController.createPurchase
);

// Update purchase by ID
router.put(
  "/:id",
  authMiddleware,
  validatePurchaseId,
  validateUpdatePurchase,
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
