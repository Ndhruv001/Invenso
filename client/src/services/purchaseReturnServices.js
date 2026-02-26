import axiosInstance from "@/lib/config/axiosInstance";

/**
 * Purchase Return Service Layer
 * Handles HTTP requests related to purchase returns.
 * Each function returns parsed data, errors rethrown for caller.
 */

// Helper for error handling
const handleAxiosError = (error, defaultMsg) => {
  const message =
    error.response?.data?.message || error.response?.data?.error || error.message || defaultMsg;

  console.error(defaultMsg, error);
  throw new Error(message);
};

// -------------------------------------
// Fetch paginated purchase return list
export const getPurchaseReturns = async (filters = {}) => {
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

    const { data } = await axiosInstance.get("/purchase-returns", { params });
    return data;
  } catch (error) {
    handleAxiosError(error, "Failed to fetch purchase returns");
  }
};

// -------------------------------------
// Fetch purchase return by ID
export const getPurchaseReturn = async id => {
  if (!id) throw new Error("Purchase return ID is required");

  try {
    const { data } = await axiosInstance.get(`/purchase-returns/${id}`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`Purchase return with ID ${id} not found`);
    }
    handleAxiosError(error, `Failed to fetch purchase return ${id}`);
  }
};

// -------------------------------------
// Create new purchase return
export const createPurchaseReturn = async purchaseReturnData => {
  try {
    const { data } = await axiosInstance.post("/purchase-returns", purchaseReturnData);
    return data;
  } catch (error) {
    if (error.response?.status === 422) {
      const validationErrors = error.response.data?.errors || {};
      const message = Object.values(validationErrors).flat().join(", ");
      throw new Error(message || "Validation failed");
    }
    handleAxiosError(error, "Failed to create purchase return");
  }
};

// -------------------------------------
// Update purchase return
export const updatePurchaseReturn = async (id, updateData) => {
  if (!id) throw new Error("Purchase return ID is required");

  try {
    const { data } = await axiosInstance.put(`/purchase-returns/${id}`, updateData);
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error("Purchase return not found or already deleted");
    }
    if (error.response?.status === 409) {
      throw new Error("Purchase return has been modified. Please refresh.");
    }
    handleAxiosError(error, `Failed to update purchase return ${id}`);
  }
};

// -------------------------------------
// Delete purchase return
export const deletePurchaseReturn = async id => {
  if (!id) throw new Error("Purchase return ID is required");

  try {
    const { data } = await axiosInstance.delete(`/purchase-returns/${id}`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error("Purchase return not found or already deleted");
    }
    if (error.response?.status === 409) {
      throw new Error("Cannot delete purchase return. It may be referenced.");
    }
    handleAxiosError(error, `Failed to delete purchase return ${id}`);
  }
};

// Download Sale Invoice PDF
export const downloadPurchaseReturnInvoicePdf = async id => {
  if (!id) throw new Error("Purchase return ID is required");

  try {
    const response = await axiosInstance.get(`/purchase-returns/download/invoice/${id}`, {
      responseType: "blob" // 🔥 IMPORTANT for file download
    });

    return response; // returns Blob
  } catch (error) {
    handleAxiosError(error, `Failed to download invoice for purchase return ${id}`);
  }
};

// -------------------------------------
// Named export bundle
export const purchaseReturnApi = {
  getPurchaseReturns,
  getPurchaseReturn,
  createPurchaseReturn,
  updatePurchaseReturn,
  deletePurchaseReturn,
  downloadPurchaseReturnInvoicePdf
};

export default purchaseReturnApi;
