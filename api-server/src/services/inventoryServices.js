// src/services/inventoryLogService.js
import prisma from "../config/prisma.js";

/**
 * List all inventory logs with pagination and sorting.
 * No filters/search/stats required.
 */
async function listInventoryLogs({
  page = 1,
  limit = 20,
  sortBy = "createdAt",
  sortOrder = "desc"
}) {
  const skip = (page - 1) * limit;
  const take = limit;

  const totalRows = await prisma.inventoryLog.count({});
  const totalPages = Math.ceil(totalRows / limit);

  const allowedSortFields = ["id", "type", "quantity", "remark", "referenceType"];

  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

  const data = await prisma.inventoryLog.findMany({
    orderBy: { [safeSortBy]: sortOrder },
    skip,
    take,
    include: { product: true } // for showing product.name
  });

  return {
    data,
    pagination: { page, limit, totalRows, totalPages }
  };
}

export { listInventoryLogs };
export default {
  listInventoryLogs
};
