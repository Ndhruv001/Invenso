/**
 * @file Routes for Transport resource.
 * Sets up RESTful endpoints with validation and authentication middleware.
 */

import express from "express";
const router = express.Router();

import authMiddleware from "../middlewares/authMiddleware.js";
import validateRequest from "../middlewares/validateRequestMiddleware.js";
import transportController from "../controllers/transportControllers.js";
import {
  validateCreateTransport,
  validateTransportId,
  validateUpdateTransport
} from "../validations/transportValidations.js";

/**
 * ---------------------------
 * STATIC & FEATURE ROUTES
 * ---------------------------
 */

/**
 * (Reserved for future features like /transports/stats or /transports/bulk-delete)
 */

/**
 * ---------------------------
 * COLLECTION ROUTES
 * ---------------------------
 */

// List transports with filters, pagination, sorting
router.get("/", authMiddleware, transportController.listTransports);

// Create new transport
router.post(
  "/",
  authMiddleware,
  validateCreateTransport,
  validateRequest,
  transportController.createTransport
);

/**
 * ---------------------------
 * PARAMETERIZED ROUTES
 * ---------------------------
 */

// Get single transport
router.get(
  "/:id",
  authMiddleware,
  validateTransportId,
  validateRequest,
  transportController.getTransport
);

// Update transport
router.put(
  "/:id",
  authMiddleware,
  validateTransportId,
  validateUpdateTransport,
  validateRequest,
  transportController.updateTransport
);

// Delete transport
router.delete(
  "/:id",
  authMiddleware,
  validateTransportId,
  validateRequest,
  transportController.deleteTransport
);

/* -------------------------------------------------------------------------- */
/* Exports                                  */
/* -------------------------------------------------------------------------- */

export default router;
export { router as transportRouter };
