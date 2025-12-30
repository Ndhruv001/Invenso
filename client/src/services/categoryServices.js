import axiosInstance from "@/lib/config/axiosInstance";

// ---------------------- GET: All Categories ----------------------
const getCategories = async type => {
  try {
    const response = await axiosInstance.get("/categories", {
      params: { type }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw new Error(error.message || "Failed to fetch categories");
  }
};

// ---------------------- GET: Single Category ----------------------
const getCategory = async id => {
  try {
    if (!id) throw new Error("Category ID is required");
    const response = await axiosInstance.get(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch category ${id}:`, error);
    if (error.response?.status === 404) throw new Error(`Category with ID ${id} not found`);
    throw new Error(error.message || "Failed to fetch category");
  }
};

// ---------------------- POST: Create Category ----------------------
const createCategory = async categoryData => {
  try {
    const response = await axiosInstance.post("/categories", categoryData);
    return response.data;
  } catch (error) {
    console.error("Failed to create category:", error);
    if (error.response?.status === 422) {
      const validationErrors = error.response.data?.errors || {};
      const errorMessage = Object.values(validationErrors).flat().join(", ");
      throw new Error(errorMessage || "Validation failed");
    }
    throw new Error(error.message || "Failed to create category");
  }
};

// ---------------------- PUT: Update Category ----------------------
const updateCategory = async (id, updateData) => {
  try {
    const response = await axiosInstance.put(`/categories/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update category ${id}:`, error);
    if (error.response?.status === 404)
      throw new Error("Category not found or may have been deleted");
    if (error.response?.status === 409)
      throw new Error("Category has been modified. Please refresh and try again.");
    throw new Error(error.message || "Failed to update category");
  }
};

// ---------------------- DELETE: Delete Category ----------------------
const deleteCategory = async id => {
  try {
    const response = await axiosInstance.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete category ${id}:`, error);
    if (error.response?.status === 404) throw new Error("Category not found or already deleted");
    if (error.response?.status === 409)
      throw new Error("Cannot delete category. It may be in use.");
    throw new Error(error.message || "Failed to delete category");
  }
};

// ---------------------- BULK DELETE: Delete Multiple Categories ----------------------
const bulkDeleteCategories = async ids => {
  try {
    if (!Array.isArray(ids) || ids.length === 0)
      throw new Error("IDs array is required for bulk delete");
    const response = await axiosInstance.delete(`/categories/bulk-delete`, {
      data: { ids }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to bulk delete categories:", error);
    throw new Error(error.message || "Failed to bulk delete categories");
  }
};

// ────────────────────────────────────────────────────────────
// Final Export Object
// ────────────────────────────────────────────────────────────
export const categoriesApi = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  bulkDeleteCategories
};

export {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  bulkDeleteCategories
};
