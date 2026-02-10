/**
 * @file Controllers for Dashboard resource.
 * Orchestrates dashboard-related requests and responses.
 * Delegates heavy logic to dashboard services.
 */

import asyncHandler from "../utils/asyncHandlerUtils.js";
import * as dashboardServices from "../services/dashboardServices.js";
import { successResponse } from "../utils/responseUtils.js";

/**
 * GET /dashboard/summary
 * Returns overall dashboard summary metrics.
 */
const getDashboardSummary = asyncHandler(async (req, res) => {
  const result = await dashboardServices.getDashboardSummary();
  console.log("🚀 ~ result:   DASHBOARD SUMMMARY", result)

  return successResponse(res, "Dashboard summary fetched successfully", result, 200);
});

/**
 * GET /dashboard/sales-trend
 * Returns sales trend data for charts.
 */
const getSalesTrend = asyncHandler(async (req, res) => {
  const { range } = req.query || { range: 7 };

  const result = await dashboardServices.getSalesTrend(Number(range));
  console.log("🚀 ~ result:   GET SALES TREND", result)

  return successResponse(res, "Sales trend fetched successfully", result, 200);
});

/**
 * GET /dashboard/low-stock-products
 * Returns products with low stock.
 */
const getLowStockProducts = asyncHandler(async (req, res) => {
  const result = await dashboardServices.getLowStockProducts();
  console.log("🚀 ~ result:  GET LOW STOCK PRODUCTS", result)

  return successResponse(res, "Low stock products fetched successfully", result, 200);
});

/**
 * GET /dashboard/top-selling-products
 * Returns top selling products.
 */
const getTopSellingProducts = asyncHandler(async (req, res) => {
  const { limit } = req.query;

  const result = await dashboardServices.getTopSellingProducts(Number(limit));
  console.log("🚀 ~ result:  GET TOP SELLING PRODUCTS", result)

  return successResponse(res, "Top selling products fetched successfully", result, 200);
});

/**
 * GET /dashboard/recent-payments
 * Returns recent payments.
 */
const getRecentPayments = asyncHandler(async (req, res) => {
  const { limit } = req.query;

  const result = await dashboardServices.getRecentPayments(Number(limit));
  console.log("🚀 ~ result:  GET RECENT PAYMENTS", result)

  return successResponse(res, "Recent payments fetched successfully", result, 200);
});

/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */

export default {
  getDashboardSummary,
  getSalesTrend,
  getLowStockProducts,
  getTopSellingProducts,
  getRecentPayments
};

export {
  getDashboardSummary,
  getSalesTrend,
  getLowStockProducts,
  getTopSellingProducts,
  getRecentPayments
};
