/**
 * paymentControllers.js
 * Controllers for Payment resource.
 * Handles requests/responses by calling paymentServices.
 * Uses asyncHandler for error handling and successResponse for responses.
 */

import asyncHandler from "../utils/asyncHandlerUtils.js";
import * as paymentServices from "../services/paymentServices.js";
import {successResponse} from "../utils/responseUtils.js";

/**
 * GET /payments
 * List payments with filters, pagination, sorting, and stats
 */
const listPayments = asyncHandler(async (req, res) => {
  const query = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    sortBy: req.query.sortBy || "createdAt",
    sortOrder: req.query.sortOrder || "desc",
    search: req.query.search || "",
    filters: req.query.filters || {},
  };

  if (typeof query.filters === "string") {
    try {
      query.filters = JSON.parse(query.filters);
    } catch {
      query.filters = {};
    }
  }

  const result = await paymentServices.listPayments(query);
  return successResponse(res, "Payments fetched successfully", result, 200);
});

/**
 * GET /payments/:id
 * Get payment by ID
 */
const getPayment = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const payment = await paymentServices.getPaymentById(id);
  return successResponse(res, "Payment fetched successfully", payment, 200);
});

/**
 * POST /payments
 * Create new payment
 */
const createPayment = asyncHandler(async (req, res) => {
  const paymentData = req.body;
  const userId = req.user?.id || null;
  const createdPayment = await paymentServices.createPayment(paymentData, userId);
  return successResponse(res, "Payment created successfully", createdPayment, 201);
});

/**
 * PUT /payments/:id
 * Update payment by ID
 */
const updatePayment = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const updateData = req.body;
  const userId = req.user?.id || null;
  const updatedPayment = await paymentServices.updatePayment(id, updateData, userId);
  return successResponse(res, "Payment updated successfully", updatedPayment, 200);
});

/**
 * DELETE /payments/:id
 * Delete payment by ID and revert balances
 */
const deletePayment = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.user?.id || null;
  const deleted = await paymentServices.deletePayment(id, userId);
  return successResponse(res, "Payment deleted successfully", deleted, 200);
});

/**
 * POST /payments/bulk-delete
 * Bulk delete payments by IDs
 */
const bulkDeletePayments = asyncHandler(async (req, res) => {
  const ids = req.body?.ids;
  const userId = req.user?.id || null;
  const deleted = await paymentServices.bulkDeletePayments(ids, userId);
  return successResponse(res, "Payments deleted successfully", deleted, 200);
});

export default {
  listPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment,
  bulkDeletePayments,
};
export {
  listPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment,
  bulkDeletePayments,
};
