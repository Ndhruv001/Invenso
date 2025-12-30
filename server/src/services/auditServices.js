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

  const data = await prisma.auditLog.findMany({
    orderBy: { [sortBy]: sortOrder },
    skip,
    take,
    include: { user: true } // so you can display user details if required
  });

  return {
    data,
    pagination: { page, limit, totalRows, totalPages }
  };
}


export {
  listAuditLogs,
};
export default {
  listAuditLogs,
};
