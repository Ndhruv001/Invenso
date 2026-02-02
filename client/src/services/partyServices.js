import axiosInstance from "@/lib/config/axiosInstance";

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
 * Fetches all parties with optional filters, pagination, and sorting.
 * @param {Object} filters - Filtering and pagination options.
 * @returns {Promise<Object>} Paginated { data, pagination, stats }
 */
export const getParties = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.search) params.append("search", filters.search);
    if (filters.page) params.append("page", String(filters.page));
    if (filters.limit) params.append("limit", String(filters.limit));
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

    // Flatten filterOptions object
    if (filters.filterOptions) {
      for (const [key, value] of Object.entries(filters.filterOptions)) {
        if (value !== undefined && value !== null && value !== "") params.append(key, value);
      }
    }

    const { data } = await axiosInstance.get("/parties", { params });
    return data;
  } catch (error) {
    handleAxiosError(error, "Failed to fetch parties");
  }
};

/**
 * Fetches a single party by ID.
 * @param {number} id - Party ID
 * @returns {Promise<Object>}
 */
export const getParty = async id => {
  if (!id) throw new Error("Party ID is required");

  try {
    const { data } = await axiosInstance.get(`/parties/${id}`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) throw new Error(`Party with ID ${id} not found`);
    handleAxiosError(error, `Failed to fetch party ${id}`);
  }
};

/**
 * Creates a new party.
 * @param {Object} partyData - Party details
 * @returns {Promise<Object>}
 */
export const createParty = async partyData => {
  try {
    const { data } = await axiosInstance.post("/parties", partyData);
    return data;
  } catch (error) {
    if (error.response?.status === 422) {
      const validationErrors = error.response.data?.errors || {};
      const message = Object.values(validationErrors).flat().join(", ");
      throw new Error(message || "Validation failed");
    }
    handleAxiosError(error, "Failed to create party");
  }
};

/**
 * Updates an existing party.
 * @param {number} id - Party ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>}
 */
export const updateParty = async (id, updateData) => {
  if (!id) throw new Error("Party ID is required");

  try {
    const { data } = await axiosInstance.put(`/parties/${id}`, updateData);
    return data;
  } catch (error) {
    if (error.response?.status === 404) throw new Error("Party not found or already deleted");
    if (error.response?.status === 409)
      throw new Error("Party has been modified. Please refresh.");
    handleAxiosError(error, `Failed to update party ${id}`);
  }
};

/**
 * Soft deletes a party by ID.
 * @param {number} id - Party ID
 * @returns {Promise<Object>}
 */
export const deleteParty = async id => {
  if (!id) throw new Error("Party ID is required");

  try {
    const { data } = await axiosInstance.delete(`/parties/${id}`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) throw new Error("Party not found or already deleted");
    if (error.response?.status === 409)
      throw new Error("Cannot delete party. It may be linked to purchases or sales.");
    handleAxiosError(error, `Failed to delete party ${id}`);
  }
};

/**
 * Soft deletes multiple parties by IDs.
 * @param {number[]} ids - Array of party IDs
 * @returns {Promise<Object>}
 */
export const bulkDeleteParties = async ids => {
  if (!Array.isArray(ids) || ids.length === 0)
    throw new Error("IDs array is required for bulk delete");

  try {
    const { data } = await axiosInstance.delete(`/parties/bulk-delete`, {
      data: { ids },
    });
    return data;
  } catch (error) {
    handleAxiosError(error, "Failed to bulk delete parties");
  }
};

export const suggestParties = async query => {
  if (!query) return [];

  try {
    const { data } = await axiosInstance.get(`/parties/suggest`, {
      params: { q: query },
    });
    return data;
  } catch (error) {
    handleAxiosError(error, "Failed to fetch party suggestions");
  }
};



// Named export group
export const partiesApi = {
  getParties,
  getParty,
  createParty,
  updateParty,
  deleteParty,
  bulkDeleteParties,
};

export default partiesApi;
