import asyncHandler from "../utils/asyncHandlerUtils.js";
import * as inventoryServices from "../services/inventoryServices.js";
import { successResponse } from "../utils/responseUtils.js";

const listInventories = asyncHandler(async (req, res) => {

    const { page, limit, sortBy, sortOrder, search } = req.query;

  const query = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sortBy: sortBy || "createdAt",
    sortOrder: sortOrder || "desc",
    search: search || "",
  };

  const result = await inventoryServices.listInventoryLogs(query);
  return successResponse(res, "Inventories fetched successfully", result, 200);
});

export default {
  listInventories,
};
export {
  listInventories,
};
