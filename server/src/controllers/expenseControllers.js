// controllers/expenseControllers.js

/**
 * @file Controllers for Expense resource.
 * Orchestrates requests/responses.
 * Wraps service calls in asyncHandler and sends structured success responses.
 */

import asyncHandler from "../utils/asyncHandlerUtils.js";
import * as expenseServices from "../services/expenseServices.js";
import { successResponse } from "../utils/responseUtils.js";

/**
 * GET /expenses
 * Query params: page, limit, sortBy, sortOrder, search, filters
 * Returns paginated list of expenses with filters and stats.
 */
const listExpenses = asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, search, ...rest } = req.query;

  const query = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sortBy: sortBy || "date",
    sortOrder: sortOrder || "desc",
    search: search || "",
    filters: rest || {} // everything else goes into filters
  };

  const result = await expenseServices.listExpenses(query);
  return successResponse(res, "Expenses fetched successfully", result, 200);
});

/**
 * GET /expenses/:id
 * Fetch single expense by ID.
 */
const getExpense = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const expense = await expenseServices.getExpenseById(id);
  return successResponse(res, "Expense fetched successfully", expense, 200);
});

/**
 * POST /expenses
 * Create a new expense.
 * Expects expense data in req.body.
 */
const createExpense = asyncHandler(async (req, res) => {
  const expenseData = req.body;
  const userId = req.user?.id || null;

  const createdExpense = await expenseServices.createExpense(expenseData, userId);
  return successResponse(res, "Expense created successfully", createdExpense, 201);
});

/**
 * PUT /expenses/:id
 * Update existing expense by ID.
 * Expects update data in req.body.
 */
const updateExpense = asyncHandler(async (req, res) => {
  const id = Number(req.params?.id);
  const updateData = req.body;
  const userId = req.user?.id || null;

  const updatedExpense = await expenseServices.updateExpense(id, updateData, userId);
  return successResponse(res, "Expense updated successfully", updatedExpense, 200);
});

/**
 * DELETE /expenses/:id
 * Delete expense by ID.
 */
const deleteExpense = asyncHandler(async (req, res) => {
  const id = Number(req.params?.id);
  const userId = req.user?.id || null;

  const deleted = await expenseServices.deleteExpense(id, userId);
  return successResponse(res, "Expense deleted successfully", deleted, 200);
});

/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */

export default {
  listExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense
};

export { listExpenses, getExpense, createExpense, updateExpense, deleteExpense };
