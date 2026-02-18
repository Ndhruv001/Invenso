/**
 * routes/adjustStockRoutes.js
 * Routes for adjustStock resource.
 * Only create operation supported.
 */

import express from "express";
const router = express.Router();

import adjustStockController from "../controllers/adjustStockControllers.js";
import { validateCreateAdjustStock } from "../validations/adjustStockValidations.js";
import validateRequest from "../middlewares/validateRequestMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";

// Create adjust stock entry
router.post(
  "/",
  authMiddleware,
  validateCreateAdjustStock,
  validateRequest,
  adjustStockController.createAdjustStock
);

export default router;
export { router };
