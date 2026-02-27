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

async function deleteOldAuditLogs() {
  try {
    console.log("🧹 Cleaning old audit logs...");

    // Date 14 days ago
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 14);

    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    console.log(`✅ Deleted ${result.count} audit logs older than 14 days`);

    return result.count;
  } catch (error) {
    console.error("❌ Audit log cleanup failed:", error);
    throw error;
  }
}

export { listAuditLogs, deleteOldAuditLogs };
export default {
  listAuditLogs,
  deleteOldAuditLogs
};
