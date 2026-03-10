// routes/dashboardRoutes.js

import express from "express";
const router = express.Router();

import authMiddleware from "../middlewares/authMiddleware.js";
import dashboardController from "../controllers/dashboardControllers.js";

/**
 * ---------------------------
 * STATIC & FEATURE ROUTES
 * ---------------------------
 */

/**
 * Dashboard summary (KPIs)
 * GET /dashboard/summary
 */
router.get("/summary", authMiddleware, dashboardController.getDashboardSummary);

/**
 * Sales trend (7 / 30 days)
 * GET /dashboard/sales-trend
 */
router.get("/sales-trend", authMiddleware, dashboardController.getSalesTrend);

/**
 * Low stock products
 * GET /dashboard/low-stock-products
 */
router.get("/low-stock-products", authMiddleware, dashboardController.getLowStockProducts);

/**
 * Top selling products
 * GET /dashboard/top-selling-products
 */
router.get("/top-selling-products", authMiddleware, dashboardController.getTopSellingProducts);

/**
 * Recent payments
 * GET /dashboard/recent-payments
 */
router.get("/recent-payments", authMiddleware, dashboardController.getRecentPayments);

/**
 * ---------------------------
 * COLLECTION ROUTES
 * ---------------------------
 */

/**
 * (Dashboard is read-only)
 * No collection routes required
 */

/**
 * ---------------------------
 * PARAMETERIZED ROUTES
 * ---------------------------
 */

/**
 * (Dashboard has no ID-based routes)
 * Keep this section for future drill-down views
 */

export default router;
export { router as dashboardRouter };
