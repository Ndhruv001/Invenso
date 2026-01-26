import axiosInstance from "@/lib/config/axiosInstance";

/**
 * Product Service Layer
 * Handles all HTTP requests related to products.
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
 * Fetches products list with filters, pagination, and sorting.
 * @param {Object} filters - Filtering and pagination options.
 * @returns {Promise<Object>} Paginated { data, pagination, stats }
 */

  // ---------------------- GET: All Categories ----------------------
  export const getHsnCodes = async () => {
    try {
      const response = await axiosInstance.get("/products/hsn-codes");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      throw new Error(error.message || "Failed to fetch categories");
    }
  };

export const getProducts = async (filters = {}) => {
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

    const { data } = await axiosInstance.get("/products", { params });
    return data;
  } catch (error) {
    handleAxiosError(error, "Failed to fetch products");
  }
};

/**
 * Fetches a single product by ID.
 * @param {number} id - Product ID
 * @returns {Promise<Object>}
 */
export const getProduct = async id => {
  if (!id) throw new Error("Product ID is required");

  try {
    const { data } = await axiosInstance.get(`/products/${id}`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) throw new Error(`Product with ID ${id} not found`);
    handleAxiosError(error, `Failed to fetch product ${id}`);
  }
};

/**
 * Creates a new product.
 * @param {Object} productData - Product details to create
 * @returns {Promise<Object>} Created product
 */
export const createProduct = async productData => {
  try {
    const { data } = await axiosInstance.post("/products", productData);
    return data;
  } catch (error) {
    if (error.response?.status === 422) {
      const validationErrors = error.response.data?.errors || {};
      const message = Object.values(validationErrors).flat().join(", ");
      throw new Error(message || "Validation failed");
    }
    handleAxiosError(error, "Failed to create product");
  }
};

/**
 * Updates an existing product by ID.
 * @param {number} id - Product ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} Updated product
 */
export const updateProduct = async (id, updateData) => {
  if (!id) throw new Error("Product ID is required");

  try {
    const { data } = await axiosInstance.put(`/products/${id}`, updateData);
    return data;
  } catch (error) {
    if (error.response?.status === 404) throw new Error("Product not found or already deleted");
    if (error.response?.status === 409)
      throw new Error("Product has been modified. Please refresh.");
    handleAxiosError(error, `Failed to update product ${id}`);
  }
};

/**
 * Soft deletes a product by ID.
 * @param {number} id - Product ID
 * @returns {Promise<Object>}
 */
export const deleteProduct = async id => {
  if (!id) throw new Error("Product ID is required");

  try {
    const { data } = await axiosInstance.delete(`/products/${id}`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) throw new Error("Product not found or already deleted");
    if (error.response?.status === 409)
      throw new Error("Cannot delete product. It may be used in orders.");
    handleAxiosError(error, `Failed to delete product ${id}`);
  }
};

/**
 * Soft deletes multiple products by IDs.
 * @param {number[]} ids - Array of product IDs
 * @returns {Promise<Object>}
 */
export const bulkDeleteProducts = async ids => {
  if (!Array.isArray(ids) || ids.length === 0)
    throw new Error("IDs array is required for bulk delete");

  try {
    const { data } = await axiosInstance.delete(`/products/bulk-delete`, {
      data: { ids }
    });
    return data;
  } catch (error) {
    handleAxiosError(error, "Failed to bulk delete products");
  }
};

export const suggestProducts = async query => {
  if (!query) return [];

  try {
    const { data } = await axiosInstance.get(`/products/suggest`, {
      params: { q: query },
    });
    return data;
  } catch (error) {
    handleAxiosError(error, "Failed to fetch party suggestions");
  }
};

// Named export group
export const productsApi = {
  getHsnCodes,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts
};

export default productsApi;
