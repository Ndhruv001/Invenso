import axiosInstance from "@/lib/config/axiosInstance";

/**
 * Sale Service Layer
 * Handles HTTP requests related to sales.
 * Each function returns parsed data, errors rethrown for caller.
 */

// Helper for error handling
const handleAxiosError = (error, defaultMsg) => {
  const message =
    error.response?.data?.message || error.response?.data?.error || error.message || defaultMsg;

  console.error(defaultMsg, error);
  throw new Error(message);
};

// Fetch paginated sale list with filters, sort, search etc.
export const getSales = async (filters = {}) => {
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

    const { data } = await axiosInstance.get("/sales", { params });
    return data;
  } catch (error) {
    handleAxiosError(error, "Failed to fetch sales");
  }
};

// Fetch sale by ID
export const getSale = async id => {
  if (!id) throw new Error("Sale ID is required");

  try {
    const { data } = await axiosInstance.get(`/sales/${id}`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`Sale with ID ${id} not found`);
    }
    handleAxiosError(error, `Failed to fetch sale ${id}`);
  }
};

// Create new sale
export const createSale = async saleData => {
  try {
    const { data } = await axiosInstance.post("/sales", saleData);
    return data;
  } catch (error) {
    if (error.response?.status === 422) {
      const validationErrors = error.response.data?.errors || {};
      const message = Object.values(validationErrors).flat().join(", ");
      throw new Error(message || "Validation failed");
    }
    handleAxiosError(error, "Failed to create sale");
  }
};

// Update existing sale
export const updateSale = async (id, updateData) => {
  if (!id) throw new Error("Sale ID is required");

  try {
    const { data } = await axiosInstance.put(`/sales/${id}`, updateData);
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error("Sale not found or already deleted");
    }
    if (error.response?.status === 409) {
      throw new Error("Sale has been modified. Please refresh.");
    }
    handleAxiosError(error, `Failed to update sale ${id}`);
  }
};

// Soft delete sale
export const deleteSale = async id => {
  if (!id) throw new Error("Sale ID is required");

  try {
    const { data } = await axiosInstance.delete(`/sales/${id}`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error("Sale not found or already deleted");
    }
    if (error.response?.status === 409) {
      throw new Error("Cannot delete sale. It may be referenced.");
    }
    handleAxiosError(error, `Failed to delete sale ${id}`);
  }
};

// Fetch sale suggestions by partyId (for dropdown / selection)
export const getSaleSuggestionsByPartyId = async partyId => {
  if (!partyId) return [];

  try {
    const { data } = await axiosInstance.get(`/sales/party-id/${partyId}`);
    return data ?? [];
  } catch (error) {
    handleAxiosError(error, "Failed to fetch sale suggestions");
  }
};

export const salesApi = {
  getSales,
  getSale,
  createSale,
  updateSale,
  deleteSale,
  getSaleSuggestionsByPartyId
};

export default salesApi;
