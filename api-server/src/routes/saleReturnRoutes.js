/**
 * routes/saleReturnRoutes.js
 * Routes for SaleReturn resource.
 * RESTful CRUD routes with validation and auth middleware.
 */

import express from "express";
const router = express.Router();

import saleReturnController from "../controllers/saleReturnControllers.js";
import {
  validateCreateSaleReturn,
  validateUpdateSaleReturn,
  validateSaleReturnId
} from "../validations/saleReturnValidations.js";

import validateRequest from "../middlewares/validateRequestMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";

// List sale returns with filters and stats
router.get("/", authMiddleware, saleReturnController.listSaleReturns);

router.get("/download/invoice/:id", saleReturnController.getSaleReturnInvoicePdf);
router.get("/print/invoice/:id", saleReturnController.printSaleReturnInvoicePdf);

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
  validateCreateSaleReturn,
  validateRequest,
  saleReturnController.createSaleReturn
);

// Update sale return by ID
router.put(
  "/:id",
  authMiddleware,
  validateSaleReturnId,
  validateUpdateSaleReturn,
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

export default router;
export { router };
