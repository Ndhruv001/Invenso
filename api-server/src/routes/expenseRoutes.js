// routes/expenseRoutes.js

import express from "express";
const router = express.Router();

import authMiddleware from "../middlewares/authMiddleware.js";
import {
  validateCreateExpense,
  validateUpdateExpense,
  validateExpenseId
} from "../validations/expenseValidations.js";
import validateRequest from "../middlewares/validateRequestMiddleware.js";
import expenseController from "../controllers/expenseControllers.js";

/**
 * ---------------------------
 * STATIC & FEATURE ROUTES
 * ---------------------------
 */

/**
 * (No static feature routes for expenses for now)
 * Keep this section for future extensions
 */

/**
 * ---------------------------
 * COLLECTION ROUTES
 * ---------------------------
 */

// List expenses
router.get("/", authMiddleware, expenseController.listExpenses);

// Create new expense
router.post(
  "/",
  authMiddleware,
  validateCreateExpense,
  validateRequest,
  expenseController.createExpense
);

/**
 * ---------------------------
 * PARAMETERIZED ROUTES
 * ---------------------------
 */

// Get single expense
router.get(
  "/:id",
  authMiddleware,
  validateExpenseId,
  validateRequest,
  expenseController.getExpense
);

// Update expense
router.put(
  "/:id",
  authMiddleware,
  validateExpenseId,
  validateUpdateExpense,
  validateRequest,
  expenseController.updateExpense
);

// Delete expense
router.delete(
  "/:id",
  authMiddleware,
  validateExpenseId,
  validateRequest,
  expenseController.deleteExpense
);

export default router;
export { router as expenseRouter };
