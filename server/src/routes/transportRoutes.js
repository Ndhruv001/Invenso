/**
 * routes/transportRoutes.js
 * Routes for Transport resource.
 * Sets up RESTful endpoints with validation and authentication middleware.
 */

import express from "express";
const router = express.Router();

import transportController from "../controllers/transportControllers.js";
import {
  validateTransport,
  validateTransportId,
  validateTransportQuery,
  validateBulkDelete
} from "../validations/transportValidations.js";
import validateRequest from "../middlewares/validateRequestMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";

// List transports with filters, pagination, sorting, stats
router.get(
  "/",
  authMiddleware,
  validateTransportQuery,
  validateRequest,
  transportController.listTransports
);

// Get single transport by ID
router.get(
  "/:id",
  authMiddleware,
  validateTransportId,
  validateRequest,
  transportController.getTransport
);

// Create new transport
router.post(
  "/",
  authMiddleware,
  validateTransport,
  validateRequest,
  transportController.createTransport
);

// Update transport by ID
router.put(
  "/:id",
  authMiddleware,
  validateTransportId,
  validateTransport,
  validateRequest,
  transportController.updateTransport
);

// Delete transport by ID
router.delete(
  "/:id",
  authMiddleware,
  validateTransportId,
  validateRequest,
  transportController.deleteTransport
);

// Bulk delete transports
router.post(
  "/bulk-delete",
  authMiddleware,
  validateBulkDelete,
  validateRequest,
  transportController.bulkDeleteTransports
);

export default router;
export { router };
