// routes/chequeRoutes.js

import express from "express";
const router = express.Router();

import authMiddleware from "../middlewares/authMiddleware.js";
import {
  validateCreateCheque,
  validateUpdateCheque,
  validateChequeId
} from "../validations/chequeValidations.js";
import validateRequest from "../middlewares/validateRequestMiddleware.js";
import chequeController from "../controllers/chequeControllers.js";

/**
 * ---------------------------
 * STATIC & FEATURE ROUTES
 * ---------------------------
 */

/**
 * (No static feature routes for cheques for now)
 * Keep this section for future extensions
 */

/**
 * ---------------------------
 * COLLECTION ROUTES
 * ---------------------------
 */

// List cheques
router.get("/", authMiddleware, chequeController.listCheques);

// Create new cheque
router.post(
  "/",
  authMiddleware,
  validateCreateCheque,
  validateRequest,
  chequeController.createCheque
);

/**
 * ---------------------------
 * PARAMETERIZED ROUTES
 * ---------------------------
 */

// Get single cheque
router.get(
  "/:id",
  authMiddleware,
  validateChequeId,
  validateRequest,
  chequeController.getCheque
);

// Update cheque
router.put(
  "/:id",
  authMiddleware,
  validateChequeId,
  validateUpdateCheque,
  validateRequest,
  chequeController.updateCheque
);

// Delete cheque
router.delete(
  "/:id",
  authMiddleware,
  validateChequeId,
  validateRequest,
  chequeController.deleteCheque
);

export default router;
export { router as chequeRouter };