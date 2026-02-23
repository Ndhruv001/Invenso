// routes/partyRoutes.js

import express from "express";
const router = express.Router();

import authMiddleware from "../middlewares/authMiddleware.js";
import {
  validateCreateParty,
  validateUpdateParty,
  validatePartyId,
  validateSuggest
} from "../validations/partyValidations.js";
import validateRequest from "../middlewares/validateRequestMiddleware.js";
import partyController from "../controllers/partyControllers.js";

/**
 * ---------------------------
 * STATIC & FEATURE ROUTES
 * ---------------------------
 */

// Party name suggestions
router.get(
  "/suggest",
  authMiddleware,
  validateSuggest,
  validateRequest,
  partyController.suggestPartyNames
);

/**
 * ---------------------------
 * COLLECTION ROUTES
 * ---------------------------
 */

// List parties
router.get("/", authMiddleware, partyController.listParties);

// Create new party
router.post("/", authMiddleware, validateCreateParty, validateRequest, partyController.createParty);

/**
 * ---------------------------
 * PARAMETERIZED ROUTES
 * ---------------------------
 */

// Get single party
router.get("/:id", authMiddleware, validatePartyId, validateRequest, partyController.getParty);

// Update party
router.put(
  "/:id",
  authMiddleware,
  validatePartyId,
  validateUpdateParty,
  validateRequest,
  partyController.updateParty
);

// Delete party
router.delete(
  "/:id",
  authMiddleware,
  validatePartyId,
  validateRequest,
  partyController.deleteParty
);

export default router;
export { router as partyRouter };
