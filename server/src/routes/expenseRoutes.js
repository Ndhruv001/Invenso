/**
 * routes/expenseRoutes.js
 * Routes for Expense resource.
 * Sets up RESTful endpoints with auth and validations.
 */

import express from "express";
const router = express.Router();

import expenseController from "../controllers/expenseControllers.js";
import {
  validateExpense,
  validateExpenseId,
  validateExpenseQuery,
  validateBulkDelete,
} from "../validations/expenseValidations.js";
import validateRequest from "../middlewares/validateRequestMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";

// List expenses with filters, pagination, sorting
router.get(
  "/",
  authMiddleware,
  validateExpenseQuery,
  validateRequest,
  expenseController.listExpenses
);

// Get expense by ID
router.get(
  "/:id",
  authMiddleware,
  validateExpenseId,
  validateRequest,
  expenseController.getExpense
);

// Create new expense
router.post(
  "/",
  authMiddleware,
  validateExpense,
  validateRequest,
  expenseController.createExpense
);

// Update expense by ID
router.put(
  "/:id",
  authMiddleware,
  validateExpenseId,
  validateExpense,
  validateRequest,
  expenseController.updateExpense
);

// Soft delete expense by ID
router.delete(
  "/:id",
  authMiddleware,
  validateExpenseId,
  validateRequest,
  expenseController.deleteExpense
);

// Bulk soft delete expenses
router.post(
  "/bulk-delete",
  authMiddleware,
  validateBulkDelete,
  validateRequest,
  expenseController.bulkDeleteExpenses
);

export default router;
export { router };
