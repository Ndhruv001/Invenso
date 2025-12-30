import axiosInstance from "@/lib/config/axiosInstance";

/**
 * Expense Service Layer
 * Handles all HTTP requests related to expenses.
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
 * Fetches expenses list with filters, pagination, and sorting.
 * @param {Object} filters - Filtering and pagination options.
 * @returns {Promise<Object>} Paginated { data, pagination, stats }
 */
export const getExpenses = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.search) params.append("search", filters.search);
    if (filters.page) params.append("page", String(filters.page));
    if (filters.limit) params.append("limit", String(filters.limit));
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

    // Flatten nested filterOptions to query params
    if (filters.filterOptions) {
      for (const [key, value] of Object.entries(filters.filterOptions)) {
        if (value !== undefined && value !== null && value !== "") params.append(key, value);
      }
    }

    const { data } = await axiosInstance.get("/expenses", { params });
    return data;
  } catch (error) {
    handleAxiosError(error, "Failed to fetch expenses");
  }
};

/**
 * Fetches a single expense by ID.
 * @param {number} id - Expense ID
 * @returns {Promise<Object>}
 */
export const getExpense = async id => {
  if (!id) throw new Error("Expense ID is required");

  try {
    const { data } = await axiosInstance.get(`/expenses/${id}`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) throw new Error(`Expense with ID ${id} not found`);
    handleAxiosError(error, `Failed to fetch expense ${id}`);
  }
};

/**
 * Creates a new expense.
 * @param {Object} expenseData - Expense details to create
 * @returns {Promise<Object>} Created expense
 */
export const createExpense = async expenseData => {
  try {
    const { data } = await axiosInstance.post("/expenses", expenseData);
    return data;
  } catch (error) {
    if (error.response?.status === 422) {
      const validationErrors = error.response.data?.errors || {};
      const message = Object.values(validationErrors).flat().join(", ");
      throw new Error(message || "Validation failed");
    }
    handleAxiosError(error, "Failed to create expense");
  }
};

/**
 * Updates an existing expense by ID.
 * @param {number} id - Expense ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} Updated expense
 */
export const updateExpense = async (id, updateData) => {
  if (!id) throw new Error("Expense ID is required");

  try {
    const { data } = await axiosInstance.put(`/expenses/${id}`, updateData);
    return data;
  } catch (error) {
    if (error.response?.status === 404) throw new Error("Expense not found or already deleted");
    if (error.response?.status === 409)
      throw new Error("Expense has been modified. Please refresh.");
    handleAxiosError(error, `Failed to update expense ${id}`);
  }
};

/**
 * Soft deletes an expense by ID.
 * @param {number} id - Expense ID
 * @returns {Promise<Object>}
 */
export const deleteExpense = async id => {
  if (!id) throw new Error("Expense ID is required");

  try {
    const { data } = await axiosInstance.delete(`/expenses/${id}`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) throw new Error("Expense not found or already deleted");
    handleAxiosError(error, `Failed to delete expense ${id}`);
  }
};

/**
 * Soft deletes multiple expenses by IDs.
 * @param {number[]} ids - Array of expense IDs
 * @returns {Promise<Object>}
 */
export const bulkDeleteExpenses = async ids => {
  if (!Array.isArray(ids) || ids.length === 0)
    throw new Error("IDs array is required for bulk delete");

  try {
    const { data } = await axiosInstance.delete(`/expenses/bulk-delete`, {
      data: { ids }
    });
    return data;
  } catch (error) {
    handleAxiosError(error, "Failed to bulk delete expenses");
  }
};

// Named export group
export const expensesApi = {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  bulkDeleteExpenses
};

export default expensesApi;
