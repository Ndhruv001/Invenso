/**
 * routes/partyRoutes.js
 * Routes for Party resource.
 * Sets up RESTful endpoints with auth and validations.
 */

import express from "express";
const router = express.Router();

import partyController from "../controllers/partyControllers.js";
import {
  validateParty,
  validatePartyId,
  validatePartyQuery,
  validateBulkDelete,
} from "../validations/partyValidations.js";
import validateRequest from "../middlewares/validateRequestMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";

// Party name suggestions for dropdown (with q param)
router.get(
  "/suggest",
  authMiddleware,
  partyController.suggestPartyNames
);

// List parties with filters, pagination, sorting
router.get("/", authMiddleware, validatePartyQuery, validateRequest, partyController.listParties);

// Get party by ID
router.get("/:id", authMiddleware, validatePartyId, validateRequest, partyController.getParty);

// Create new party
router.post("/", authMiddleware, validateParty, validateRequest, partyController.createParty);

// Update party by ID
router.put(
  "/:id",
  authMiddleware,
  validatePartyId,
  validateParty,
  validateRequest,
  partyController.updateParty
);

// Soft delete party by ID
router.delete(
  "/:id",
  authMiddleware,
  validatePartyId,
  validateRequest,
  partyController.deleteParty
);

// Bulk soft delete parties
router.post(
  "/bulk-delete",
  authMiddleware,
  validateBulkDelete,
  validateRequest,
  partyController.bulkDeleteParties
);

// Global search parties (with q param)
router.get(
  "/search",
  authMiddleware,
  validateRequest,
  partyController.globalSearchParties
);




export default router;
export { router };
