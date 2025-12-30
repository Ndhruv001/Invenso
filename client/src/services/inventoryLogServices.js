import axiosInstance from "@/lib/config/axiosInstance";

/**
 * Fetch paginated inventory logs (no filters or search).
 * @param {Object} params - Pagination (page, limit), sorting (sortBy, sortOrder)
 * @returns {Promise<Object>} { data, pagination }
 */
export const getInventoryLogs = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/inventories", { params });
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error?.message || "Failed to fetch inventory logs");
  }
};

export default {
  getInventoryLogs,
};
