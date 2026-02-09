import axiosInstance from "@/lib/config/axiosInstance";

/**
 * Payment Service Layer
 * Handles all HTTP requests related to payments.
 * Returns parsed data — not full Axios responses.
 */

const handleAxiosError = (error, defaultMsg) => {
  const message =
    error.response?.data?.message || error.response?.data?.error || error.message || defaultMsg;
  console.error(defaultMsg, error);
  throw new Error(message);
};

/**
 * Fetch payments list with filters, pagination, and sorting
 * @param {Object} filters - Filtering and pagination options
 * @returns {Promise<Object>} Paginated { data, pagination, stats }
 */
export const getPayments = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.search) params.append("search", filters.search);
    if (filters.page) params.append("page", String(filters.page));
    if (filters.limit) params.append("limit", String(filters.limit));
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

    if (filters.filterOptions) {
      for (const [key, value] of Object.entries(filters.filterOptions)) {
        if (value !== undefined && value !== null && value !== "") params.append(key, value);
      }
    }

    const { data } = await axiosInstance.get("/payments", { params });
    return data;
  } catch (error) {
    handleAxiosError(error, "Failed to fetch payments");
  }
};

/**
 * Fetch a single payment by ID
 */
export const getPayment = async id => {
  if (!id) throw new Error("Payment ID is required");
  try {
    const { data } = await axiosInstance.get(`/payments/${id}`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) throw new Error(`Payment with ID ${id} not found`);
    handleAxiosError(error, `Failed to fetch payment ${id}`);
  }
};

/**
 * Create a new payment
 */
export const createPayment = async paymentData => {
  try {
    const { data } = await axiosInstance.post("/payments", paymentData);
    return data;
  } catch (error) {
    if (error.response?.status === 422) {
      const validationErrors = error.response.data?.errors || {};
      const message = Object.values(validationErrors).flat().join(", ");
      throw new Error(message || "Validation failed");
    }
    handleAxiosError(error, "Failed to create payment");
  }
};

/**
 * Update existing payment
 */
export const updatePayment = async (id, updateData) => {
  if (!id) throw new Error("Payment ID is required");
  try {
    const { data } = await axiosInstance.put(`/payments/${id}`, updateData);
    return data;
  } catch (error) {
    if (error.response?.status === 404) throw new Error("Payment not found or already deleted");
    if (error.response?.status === 409)
      throw new Error("Payment has been modified. Please refresh.");
    handleAxiosError(error, `Failed to update payment ${id}`);
  }
};

/**
 * Delete a payment by ID
 */
export const deletePayment = async id => {
  if (!id) throw new Error("Payment ID is required");
  try {
    const { data } = await axiosInstance.delete(`/payments/${id}`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) throw new Error("Payment not found or already deleted");
    handleAxiosError(error, `Failed to delete payment ${id}`);
  }
};

export const paymentsApi = {
  getPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment
};

export default paymentsApi;
