// controllers/paymentControllers.js

/**
 * @file Controllers for Payment resource.
 * Orchestrates requests/responses.
 * Wraps service calls in asyncHandler and sends structured success responses.
 */

import asyncHandler from "../utils/asyncHandlerUtils.js";
import * as paymentServices from "../services/paymentServices.js";
import { successResponse } from "../utils/responseUtils.js";

/**
 * GET /payments
 * Query params: page, limit, sortBy, sortOrder, search, filters
 * Returns paginated list of payments with filters and stats.
 */
const listPayments = asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, search, ...rest } = req.query;

  const query = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sortBy: sortBy || "createdAt",
    sortOrder: sortOrder || "desc",
    search: search || "",
    filters: rest || {} // everything else goes into filters
  };

  const result = await paymentServices.listPayments(query);
  return successResponse(res, "Payments fetched successfully", result, 200);
});

/**
 * GET /payments/:id
 * Fetch single payment by ID.
 */
const getPayment = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const payment = await paymentServices.getPaymentById(id);
  return successResponse(res, "Payment fetched successfully", payment, 200);
});

/**
 * POST /payments
 * Create a new payment.
 * Expects payment data in req.body.
 */
const createPayment = asyncHandler(async (req, res) => {
  const paymentData = req.body;
  const userId = req.user?.id || null;

  const createdPayment = await paymentServices.createPayment(paymentData, userId);
  return successResponse(res, "Payment created successfully", createdPayment, 201);
});

/**
 * PUT /payments/:id
 * Update existing payment by ID.
 * Expects update data in req.body.
 */
const updatePayment = asyncHandler(async (req, res) => {
  const id = Number(req.params?.id);
  const updateData = req.body;
  const userId = req.user?.id || null;

  const updatedPayment = await paymentServices.updatePayment(id, updateData, userId);

  return successResponse(res, "Payment updated successfully", updatedPayment, 200);
});

/**
 * DELETE /payments/:id
 * Delete payment by ID and revert party balance.
 */
const deletePayment = asyncHandler(async (req, res) => {
  const id = Number(req.params?.id);
  const userId = req.user?.id || null;

  const deleted = await paymentServices.deletePayment(id, userId);
  return successResponse(res, "Payment deleted successfully", deleted, 200);
});

/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */

export default {
  listPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment
};

export { listPayments, getPayment, createPayment, updatePayment, deletePayment };
