import axiosInstance from "@/lib/config/axiosInstance";

/**
 * Fetch paginated audit logs (no filters/search).
 * @param {Object} params - Pagination (page, limit), sorting (sortBy, sortOrder)
 * @returns {Promise<Object>} { data, pagination }
 */
export const getAuditLogs = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/audits", { params });
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error?.message || "Failed to fetch audit logs");
  }
};
export const sentInvoiceOnWhatsApp = async () => {
  try {
    const response = await axiosInstance.post("/audits/run-whatsapp-invoices");
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error?.message || "Failed to fetch audit logs");
  }
};

export default {
  getAuditLogs,
  
};
