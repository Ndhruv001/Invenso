import axiosInstance from "@/lib/config/axiosInstance";

/**
 * Sale Return Service Layer
 * Handles HTTP requests related to sale returns.
 * Each function returns parsed data, errors rethrown for caller.
 */

// Helper for error handling
const handleAxiosError = (error, defaultMsg) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    defaultMsg;

  console.error(defaultMsg, error);
  throw new Error(message);
};

// -------------------------------------
// Fetch paginated sale return list
export const getSaleReturns = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.search) params.append("search", filters.search);
    if (filters.page) params.append("page", String(filters.page));
    if (filters.limit) params.append("limit", String(filters.limit));
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

    if (filters.filterOptions) {
      for (const [key, value] of Object.entries(filters.filterOptions)) {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value);
        }
      }
    }

    const { data } = await axiosInstance.get("/sale-returns", { params });
    return data;
  } catch (error) {
    handleAxiosError(error, "Failed to fetch sale returns");
  }
};

// -------------------------------------
// Fetch sale return by ID
export const getSaleReturn = async id => {
  if (!id) throw new Error("Sale return ID is required");

  try {
    const { data } = await axiosInstance.get(`/sale-returns/${id}`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`Sale return with ID ${id} not found`);
    }
    handleAxiosError(error, `Failed to fetch sale return ${id}`);
  }
};

// -------------------------------------
// Create new sale return
export const createSaleReturn = async saleReturnData => {
  try {
    const { data } = await axiosInstance.post("/sale-returns", saleReturnData);
    return data;
  } catch (error) {
    if (error.response?.status === 422) {
      const validationErrors = error.response.data?.errors || {};
      const message = Object.values(validationErrors).flat().join(", ");
      throw new Error(message || "Validation failed");
    }
    handleAxiosError(error, "Failed to create sale return");
  }
};

// -------------------------------------
// Update sale return
export const updateSaleReturn = async (id, updateData) => {
  if (!id) throw new Error("Sale return ID is required");

  try {
    const { data } = await axiosInstance.put(`/sale-returns/${id}`, updateData);
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error("Sale return not found or already deleted");
    }
    if (error.response?.status === 409) {
      throw new Error("Sale return has been modified. Please refresh.");
    }
    handleAxiosError(error, `Failed to update sale return ${id}`);
  }
};

// -------------------------------------
// Delete sale return
export const deleteSaleReturn = async id => {
  if (!id) throw new Error("Sale return ID is required");

  try {
    const { data } = await axiosInstance.delete(`/sale-returns/${id}`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error("Sale return not found or already deleted");
    }
    if (error.response?.status === 409) {
      throw new Error("Cannot delete sale return. It may be referenced.");
    }
    handleAxiosError(error, `Failed to delete sale return ${id}`);
  }
};

// -------------------------------------
// Named export bundle
export const saleReturnApi = {
  getSaleReturns,
  getSaleReturn,
  createSaleReturn,
  updateSaleReturn,
  deleteSaleReturn
};

export default saleReturnApi;
