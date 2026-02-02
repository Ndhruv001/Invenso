import axiosInstance from "@/lib/config/axiosInstance";

/**
 * Purchase Service Layer
 * Handles HTTP requests related to purchases.
 * Each function returns parsed data, errors rethrown for caller.
 */

// Helper for error handling
const handleAxiosError = (error, defaultMsg) => {
  const message =
    error.response?.data?.message || error.response?.data?.error || error.message || defaultMsg;
  console.error(defaultMsg, error);
  throw new Error(message);
};

// Fetch paginated purchase list with filters, sort, search etc.
export const getPurchases = async (filters = {}) => {
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

    const { data } = await axiosInstance.get("/purchases", { params });
    return data;
  } catch (error) {
    handleAxiosError(error, "Failed to fetch purchases");
  }
};

// Fetch purchase by ID
export const getPurchase = async id => {
  if (!id) throw new Error("Purchase ID is required");
  try {
    const { data } = await axiosInstance.get(`/purchases/${id}`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) throw new Error(`Purchase with ID ${id} not found`);
    handleAxiosError(error, `Failed to fetch purchase ${id}`);
  }
};

// Create new purchase with data object
export const createPurchase = async purchaseData => {
  try {
    const { data } = await axiosInstance.post("/purchases", purchaseData);
    return data;
  } catch (error) {
    if (error.response?.status === 422) {
      const validationErrors = error.response.data?.errors || {};
      const message = Object.values(validationErrors).flat().join(", ");
      throw new Error(message || "Validation failed");
    }
    handleAxiosError(error, "Failed to create purchase");
  }
};

// Update existing purchase by ID with update data
export const updatePurchase = async (id, updateData) => {
  if (!id) throw new Error("Purchase ID is required");
  try {
    const { data } = await axiosInstance.put(`/purchases/${id}`, updateData);
    return data;
  } catch (error) {
    if (error.response?.status === 404) throw new Error("Purchase not found or already deleted");
    if (error.response?.status === 409)
      throw new Error("Purchase has been modified. Please refresh.");
    handleAxiosError(error, `Failed to update purchase ${id}`);
  }
};

// Soft delete purchase by ID
export const deletePurchase = async id => {
  if (!id) throw new Error("Purchase ID is required");
  try {
    const { data } = await axiosInstance.delete(`/purchases/${id}`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) throw new Error("Purchase not found or already deleted");
    if (error.response?.status === 409)
      throw new Error("Cannot delete purchase. It may be referenced.");
    handleAxiosError(error, `Failed to delete purchase ${id}`);
  }
};

// Fetch purchase suggestions by partyId (for dropdown / selection)
export const getPurchaseSuggestionsByPartyId = async (partyId) => {
  if (!partyId) return [];

  try {
    const { data } = await axiosInstance.get(`/purchases/party-id/${partyId}`);

    return data ?? [];
  } catch (error) {
    handleAxiosError(error, "Failed to fetch purchase suggestions");
  }
};


export const purchasesApi = {
  getPurchases,
  getPurchase,
  createPurchase,
  updatePurchase,
  deletePurchase,
  getPurchaseSuggestionsByPartyId
};

export default purchasesApi;
