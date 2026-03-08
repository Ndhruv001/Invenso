import prisma from "../config/prisma.js";

/**
 * List all audit logs with pagination and sorting.
 * No filters/search/stats required.
 */
async function listAuditLogs({ page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc" }) {
  const skip = (page - 1) * limit;
  const take = limit;

  const totalRows = await prisma.auditLog.count({});
  const totalPages = Math.ceil(totalRows / limit);

  const allowedSortFields = ["tableName", "id", "recordId", "createdAt"];

  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

  const data = await prisma.auditLog.findMany({
    orderBy: { [safeSortBy]: sortOrder },
    skip,
    take,
    include: { user: true } // so you can display user details if required
  });

  return {
    data,
    pagination: { page, limit, totalRows, totalPages }
  };
}

async function deleteOldAuditLogsAndInventoryLogs() {
  try {
    console.log("🧹 Cleaning old audit logs & inventory logs...");

    // Date 14 days ago
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 14);

    const auditResult = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });
    const inventoryResult = await prisma.inventoryLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    const result = auditResult.count + inventoryResult.count;
    console.log(`✅ Deleted ${result} audit logs & inventory logs older than 14 days`);

    return result;
  } catch (error) {
    console.error("❌ Audit log cleanup failed:", error);
    throw error;
  }
}

export { listAuditLogs, deleteOldAuditLogsAndInventoryLogs };
export default {
  listAuditLogs,
  deleteOldAuditLogsAndInventoryLogs
};
