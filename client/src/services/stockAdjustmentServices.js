import axiosInstance from "@/lib/config/axiosInstance";

// ---------------------- POST: Create Stock Adjustment ----------------------
const createStockAdjustment = async adjustData => {
  try {
    const response = await axiosInstance.post("/stock-adjustments", adjustData);
    return response.data;
  } catch (error) {
    console.error("Failed to create stock adjustment:", error);

    // Validation error
    if (error.response?.status === 422) {
      const validationErrors = error.response.data?.errors || {};
      const errorMessage = Object.values(validationErrors)
        .flat()
        .join(", ");
      throw new Error(errorMessage || "Validation failed");
    }

    // Conflict error (optional — if backend handles versioning / locking)
    if (error.response?.status === 409) {
      throw new Error(
        "Stock has been modified by another process. Please refresh and try again."
      );
    }

    throw new Error(error.message || "Failed to create stock adjustment");
  }
};

// ────────────────────────────────────────────────────────────
// Final Export Object
// ────────────────────────────────────────────────────────────
export default  createStockAdjustment;


export { createStockAdjustment };
