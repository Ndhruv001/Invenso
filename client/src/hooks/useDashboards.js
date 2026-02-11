import { useQuery } from "@tanstack/react-query";
import {
  getDashboardSummary,
  getSalesTrend,
  getLowStockProducts,
  getTopSellingProducts,
  getRecentPayments
} from "@/services/dashboardServices";

/**
 * React Query Hooks for Dashboard Data
 * -----------------------------------
 * Handles cache, background updates, and independent widget fetching.
 * Each hook maps to a single dashboard widget.
 */

// --------------------------------------------------
// QUERY KEYS (Centralized for consistency)
// --------------------------------------------------
export const DASHBOARD_KEYS = {
  all: ["dashboard"],

  summary: (params = {}) => ["dashboard", "summary", params],

  salesTrend: (params = {}) => ["dashboard", "sales-trend", params],

  lowStock: ["dashboard", "low-stock"],

  topSelling: (params = {}) => ["dashboard", "top-selling", params],

  recentPayments: (params = {}) => ["dashboard", "recent-payments", params]
};

// --------------------------------------------------
// QUERIES
// --------------------------------------------------

/**
 * Dashboard Summary KPIs
 */
export const useDashboardSummary = () => {
  return useQuery({
    queryKey: DASHBOARD_KEYS.summary(),
    queryFn: () => getDashboardSummary(),
    staleTime: 2 * 60 * 1000, // KPIs change often
    cacheTime: 10 * 60 * 1000
  });
};

/**
 * Sales Trend (7 / 30 days)
 */
export const useSalesTrend = (params = { period: "week" }) => {
  return useQuery({
    queryKey: DASHBOARD_KEYS.salesTrend(params),
    queryFn: () => getSalesTrend(params),
    staleTime: 5 * 60 * 1000, // Time-series is stable
    cacheTime: 30 * 60 * 1000
  });
};

/**
 * Low Stock Products
 */
export const useLowStockProducts = () => {
  return useQuery({
    queryKey: DASHBOARD_KEYS.lowStock,
    queryFn: getLowStockProducts,
    staleTime: 1 * 60 * 1000, // Stock can change quickly
    cacheTime: 10 * 60 * 1000
  });
};

/**
 * Top Selling Products
 */
export const useTopSellingProducts = (params = { limit: 5 }) => {
  return useQuery({
    queryKey: DASHBOARD_KEYS.topSelling(params),
    queryFn: () => getTopSellingProducts(params),
    staleTime: 10 * 60 * 1000,
    cacheTime: 60 * 60 * 1000
  });
};

/**
 * Recent Payments
 */
export const useRecentPayments = (params = { limit: 5 }) => {
  return useQuery({
    queryKey: DASHBOARD_KEYS.recentPayments(params),
    queryFn: () => getRecentPayments(params),
    staleTime: 30 * 1000, // Payments are live-ish
    cacheTime: 5 * 60 * 1000
  });
};

// --------------------------------------------------
// DEFAULT EXPORT
// --------------------------------------------------
export default {
  useDashboardSummary,
  useSalesTrend,
  useLowStockProducts,
  useTopSellingProducts,
  useRecentPayments
};
