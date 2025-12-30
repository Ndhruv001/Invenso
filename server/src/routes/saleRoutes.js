/**
 * routes/saleRoutes.js
 * Routes for Sale resource with CRUD and bulk delete.
 */

import express from "express";
const router = express.Router();

import saleController from "../controllers/saleControllers.js";
import {
  validateSale,
  validateSaleId,
  validateSaleQuery,
  validateBulkDelete,
} from "../validations/saleValidations.js";

import validateRequest from "../middlewares/validateRequestMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";

// List sales
router.get(
  "/",
  authMiddleware,
  validateSaleQuery,
  validateRequest,
  saleController.listSales
);

// Get sale by ID
router.get(
  "/:id",
  authMiddleware,
  validateSaleId,
  validateRequest,
  saleController.getSale
);

// Create sale
router.post(
  "/",
  authMiddleware,
  validateSale,
  validateRequest,
  saleController.createSale
);

// Update sale by ID
router.put(
  "/:id",
  authMiddleware,
  validateSaleId,
  validateSale,
  validateRequest,
  saleController.updateSale
);

// Delete sale by ID
router.delete(
  "/:id",
  authMiddleware,
  validateSaleId,
  validateRequest,
  saleController.deleteSale
);

// Bulk delete sales
router.post(
  "/bulk-delete",
  authMiddleware,
  validateBulkDelete,
  validateRequest,
  saleController.bulkDeleteSales
);

export default router;
export { router };
