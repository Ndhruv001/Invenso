/**
 * routes/saleReturnRoutes.js
 * Routes for SaleReturn resource with full CRUD and bulk delete support.
 */

import express from "express";
const router = express.Router();

import saleReturnController from "../controllers/saleReturnControllers.js";
import {
  validateSaleReturn,
  validateSaleReturnId,
  validateSaleReturnQuery,
  validateBulkDelete,
} from "../validations/saleReturnValidations.js";

import validateRequest from "../middlewares/validateRequestMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";

// List sale returns
router.get(
  "/",
  authMiddleware,
  validateSaleReturnQuery,
  validateRequest,
  saleReturnController.listSaleReturns
);

// Get sale return by ID
router.get(
  "/:id",
  authMiddleware,
  validateSaleReturnId,
  validateRequest,
  saleReturnController.getSaleReturn
);

// Create sale return
router.post(
  "/",
  authMiddleware,
  validateSaleReturn,
  validateRequest,
  saleReturnController.createSaleReturn
);

// Update sale return by ID
router.put(
  "/:id",
  authMiddleware,
  validateSaleReturnId,
  validateSaleReturn,
  validateRequest,
  saleReturnController.updateSaleReturn
);

// Delete sale return by ID
router.delete(
  "/:id",
  authMiddleware,
  validateSaleReturnId,
  validateRequest,
  saleReturnController.deleteSaleReturn
);

// Bulk delete sale returns
router.post(
  "/bulk-delete",
  authMiddleware,
  validateBulkDelete,
  validateRequest,
  saleReturnController.bulkDeleteSaleReturns
);

export default router;
export { router };
