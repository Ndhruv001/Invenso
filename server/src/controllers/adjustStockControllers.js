/**
 * adjustStockControllers.js
 * Controller responsible for Stock adjustment operations.
 * Only supports creating adjustments (add/subtract).
 */

import asyncHandler from "../utils/asyncHandlerUtils.js";
import * as adjustStockServices from "../services/adjustStockServices.js";
import {successResponse} from "../utils/responseUtils.js";

/**
 * POST /adjust-stock
 * Create stock adjustment log and update product stock.
 */
const createAdjustStock = asyncHandler(async (req, res) => {
  const adjustmentData = req.body;
  const userId = req.user?.id || null;

  const result = await adjustStockServices.createAdjustStock(adjustmentData, userId);
  return successResponse(res, "Stock adjusted successfully", result, 201);
});

export default {
  createAdjustStock
};
export { createAdjustStock };
