import axiosInstance from "@/lib/config/axiosInstance";

/**
 * Cheque Service Layer
 * Handles all HTTP requests related to cheques.
 * Returns parsed data — not full Axios responses.
 */

const handleAxiosError = (error, defaultMsg) => {
  const message =
    error.response?.data?.message || error.response?.data?.error || error.message || defaultMsg;

  console.error(defaultMsg, error);
  throw new Error(message);
};

/**
 * Fetch cheques with filters
 */
export const getCheques = async (filters = {}) => {
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

    const { data } = await axiosInstance.get("/cheques", { params });
    return data;
  } catch (error) {
    handleAxiosError(error, "Failed to fetch cheques");
  }
};

/**
 * Fetch single cheque
 */
export const getCheque = async id => {
  if (!id) throw new Error("Cheque ID is required");

  try {
    const { data } = await axiosInstance.get(`/cheques/${id}`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) throw new Error(`Cheque with ID ${id} not found`);

    handleAxiosError(error, `Failed to fetch cheque ${id}`);
  }
};

export const createCheque = async data => {
  if (!data) throw new Error("Cheque data is required");

  try {
    const { result } = await axiosInstance.post(`/cheques`, data);
    return result;
  } catch (error) {
    console.log("🚀 ~ createCheque ~ error:", error);
    handleAxiosError(error, `Failed to create cheque`);
  }
};

/**
 * Update cheque
 *
 * IMPORTANT:
 * If status changes to CLEARED or ENCASHED,
 * backend automatically:
 *  - creates payment entry
 *  - adjusts party balance
 *
 * Frontend DOES NOT handle payment logic anymore.
 */
export const updateCheque = async (id, updateData) => {
  if (!id) throw new Error("Cheque ID is required");

  try {
    const { data } = await axiosInstance.put(`/cheques/${id}`, updateData);
    return data;
  } catch (error) {
    if (error.response?.status === 404) throw new Error("Cheque not found or already deleted");

    if (error.response?.status === 409)
      throw new Error("Cheque has been modified. Please refresh.");

    handleAxiosError(error, `Failed to update cheque ${id}`);
  }
};

/**
 * Delete cheque
 *
 * Backend now:
 *  - Reverts party balance if cleared
 *  - Deletes related payment if exists
 */
export const deleteCheque = async id => {
  if (!id) throw new Error("Cheque ID is required");

  try {
    const { data } = await axiosInstance.delete(`/cheques/${id}`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) throw new Error("Cheque not found or already deleted");

    handleAxiosError(error, `Failed to delete cheque ${id}`);
  }
};

export const chequesApi = {
  getCheques,
  getCheque,
  updateCheque,
  deleteCheque,
  createCheque
};

export default chequesApi;
