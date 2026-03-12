import axiosInstance from "@/lib/config/axiosInstance";

/**
 * Dashboard Service Layer
 * Handles all HTTP requests related to dashboard metrics.
 * Each function returns parsed data (not the full Axios response).
 * Errors are rethrown for React Query or UI to handle.
 */

// --------------------------------------------------
// Helpers
// --------------------------------------------------
const handleAxiosError = (error, defaultMsg) => {
  const message =
    error.response?.data?.message || error.response?.data?.error || error.message || defaultMsg;

  console.error(defaultMsg, error);
  throw new Error(message);
};

// --------------------------------------------------
// API Methods
// --------------------------------------------------

/**
 * Fetches dashboard summary KPIs.
 * @param {Object} params - Date filters { fromDate, toDate }
 * @returns {Promise<Object>} Summary metrics
 */
export const getDashboardSummary = async () => {
  try {
    const { data } = await axiosInstance.get("/dashboards/summary");

    return data;
  } catch (error) {
    handleAxiosError(error, "Failed to fetch dashboard summary");
  }
};

/**
 * Fetches sales trend data.
 * @param {Object} params - { period: 'week' | 'month' }
 * @returns {Promise<Array>} Sales trend points
 */
export const getSalesTrend = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (params.period) queryParams.append("period", params.period);

    const { data } = await axiosInstance.get("/dashboards/sales-trend", {
      params: queryParams
    });

    return data;
  } catch (error) {
    handleAxiosError(error, "Failed to fetch sales trend");
  }
};

/**
 * Fetches products with low stock.
 * @returns {Promise<Array>} Low stock products
 */
export const getLowStockProducts = async () => {
  try {
    const { data } = await axiosInstance.get("/dashboards/low-stock-products");
    return data;
  } catch (error) {
    handleAxiosError(error, "Failed to fetch low stock products");
  }
};

/**
 * Fetches top selling products.
 * @param {Object} params - { limit }
 * @returns {Promise<Array>} Top selling products
 */
export const getTopSellingProducts = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (params.limit) queryParams.append("limit", String(params.limit));

    const { data } = await axiosInstance.get("/dashboards/top-selling-products", {
      params: queryParams
    });

    return data;
  } catch (error) {
    handleAxiosError(error, "Failed to fetch top selling products");
  }
};

/**
 * Fetches recent payments.
 * @param {Object} params - { limit }
 * @returns {Promise<Array>} Recent payments
 */
export const getRecentPayments = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (params.limit) queryParams.append("limit", String(params.limit));

    const { data } = await axiosInstance.get("/dashboards/recent-payments", {
      params: queryParams
    });

    return data;
  } catch (error) {
    handleAxiosError(error, "Failed to fetch recent payments");
  }
};

// --------------------------------------------------
// Named export group
// --------------------------------------------------
export const dashboardApi = {
  getDashboardSummary,
  getSalesTrend,
  getLowStockProducts,
  getTopSellingProducts,
  getRecentPayments
};

export default dashboardApi;
