/**
 * expenseControllers.js
 * Controllers for Expense resource.
 * Handles HTTP requests, calls expenseServices,
 * wrapped in asyncHandler for async error catching,
 * uses successResponse for consistent API responses.
 */

import asyncHandler from "../utils/asyncHandlerUtils.js";
import * as expenseServices from "../services/expenseServices.js";
import {successResponse} from "../utils/responseUtils.js";

/**
 * GET /expenses
 * List expenses with filters, pagination, sorting, stats
 */
const listExpenses = asyncHandler(async (req, res) => {
  const query = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    sortBy: req.query.sortBy || "date",
    sortOrder: req.query.sortOrder || "desc",
    filters: req.query.filters || {},
  };

  if (typeof query.filters === "string") {
    try {
      query.filters = JSON.parse(query.filters);
    } catch {
      query.filters = {};
    }
  }

  const result = await expenseServices.listExpenses(query);
  return successResponse(res, "Expenses fetched successfully", result, 200);
});

/**
 * GET /expenses/:id
 * Get single expense by ID
 */
const getExpense = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const expense = await expenseServices.getExpenseById(id);
  return successResponse(res, "Expense fetched successfully", expense, 200);
});

/**
 * POST /expenses
 * Create new expense
 */
const createExpense = asyncHandler(async (req, res) => {
  const expenseData = req.body;
  const userId = req.user?.id || null;
  const createdExpense = await expenseServices.createExpense(expenseData, userId);
  return successResponse(res, "Expense created successfully", createdExpense, 201);
});

/**
 * PUT /expenses/:id
 * Update expense by ID
 */
const updateExpense = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const updateData = req.body;
  const userId = req.user?.id || null;
  const updatedExpense = await expenseServices.updateExpense(id, updateData, userId);
  return successResponse(res, "Expense updated successfully", updatedExpense, 200);
});

/**
 * DELETE /expenses/:id
 * Soft delete expense by ID
 */
const deleteExpense = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.user?.id || null;
  const deleted = await expenseServices.deleteExpense(id, userId);
  return successResponse(res, "Expense deleted successfully", deleted, 200);
});

/**
 * POST /expenses/bulk-delete
 * Bulk soft delete expenses by IDs
 */
const bulkDeleteExpenses = asyncHandler(async (req, res) => {
  const ids = req.body?.ids;
  const userId = req.user?.id || null;
  const deleted = await expenseServices.bulkDeleteExpenses(ids, userId);
  return successResponse(res, "Expenses deleted successfully", deleted, 200);
});

export default {
  listExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  bulkDeleteExpenses,
};
export {
  listExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  bulkDeleteExpenses,
};
