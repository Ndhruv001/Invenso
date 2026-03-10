/**
 * routes/saleRoutes.js
 * Routes for Sale resource.
 * RESTful CRUD routes with validation and auth middleware.
 */

import express from "express";
const router = express.Router();

import saleController from "../controllers/saleControllers.js";
import {
  validateCreateSale,
  validateUpdateSale,
  validateSaleId
} from "../validations/saleValidations.js";

import validateRequest from "../middlewares/validateRequestMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";

// List sales with filters and stats
router.get("/", authMiddleware, saleController.listSales);

router.get("/download/invoice/:id", saleController.getSaleInvoicePdf);
router.get("/print/invoice/:id", saleController.printSaleInvoicePdf);

// Get sales by Party ID (suggestions)
router.get("/party-id/:partyId", authMiddleware, saleController.getSalesByPartyId);

// Get sale by ID
router.get("/:id", authMiddleware, validateSaleId, validateRequest, saleController.getSale);

// Create sale
router.post("/", authMiddleware, validateCreateSale, validateRequest, saleController.createSale);

// Update sale by ID
router.put(
  "/:id",
  authMiddleware,
  validateSaleId,
  validateUpdateSale,
  validateRequest,
  saleController.updateSale
);

// Delete sale by ID
router.delete("/:id", authMiddleware, validateSaleId, validateRequest, saleController.deleteSale);

export default router;
export { router };
