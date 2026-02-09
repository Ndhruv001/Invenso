import axiosInstance from "@/lib/config/axiosInstance";

/**
 * Transport Service Layer
 * Handles all HTTP requests related to transports (logistics).
 * Returns parsed data — not full Axios responses.
 */

const handleAxiosError = (error, defaultMsg) => {
  const message =
    error.response?.data?.message || error.response?.data?.error || error.message || defaultMsg;
  console.error(defaultMsg, error);
  throw new Error(message);
};

/**
 * Fetch transports list with filters, pagination, and sorting
 * @param {Object} filters - Filtering and pagination options
 * @returns {Promise<Object>} Paginated { data, pagination, stats }
 */
export const getTransports = async (filters = {}) => {
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

    const { data } = await axiosInstance.get("/transports", { params });
    return data;
  } catch (error) {
    handleAxiosError(error, "Failed to fetch transports");
  }
};

/**
 * Fetch a single transport by ID
 */
export const getTransport = async id => {
  if (!id) throw new Error("Transport ID is required");
  try {
    const { data } = await axiosInstance.get(`/transports/${id}`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) throw new Error(`Transport with ID ${id} not found`);
    handleAxiosError(error, `Failed to fetch transport ${id}`);
  }
};

/**
 * Create a new transport
 */
export const createTransport = async transportData => {
  try {
    const { data } = await axiosInstance.post("/transports", transportData);
    return data;
  } catch (error) {
    if (error.response?.status === 422) {
      const validationErrors = error.response.data?.errors || {};
      const message = Object.values(validationErrors).flat().join(", ");
      throw new Error(message || "Validation failed");
    }
    handleAxiosError(error, "Failed to create transport");
  }
};

/**
 * Update existing transport
 */
export const updateTransport = async (id, updateData) => {
  if (!id) throw new Error("Transport ID is required");
  try {
    const { data } = await axiosInstance.put(`/transports/${id}`, updateData);
    return data;
  } catch (error) {
    if (error.response?.status === 404) throw new Error("Transport not found or already deleted");
    if (error.response?.status === 409)
      throw new Error("Transport record has been modified. Please refresh.");
    handleAxiosError(error, `Failed to update transport ${id}`);
  }
};

/**
 * Delete a transport by ID
 */
export const deleteTransport = async id => {
  if (!id) throw new Error("Transport ID is required");
  try {
    const { data } = await axiosInstance.delete(`/transports/${id}`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) throw new Error("Transport not found or already deleted");
    handleAxiosError(error, `Failed to delete transport ${id}`);
  }
};

export const transportsApi = {
  getTransports,
  getTransport,
  createTransport,
  updateTransport,
  deleteTransport
};

export default transportsApi;
