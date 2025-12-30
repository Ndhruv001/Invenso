import asyncHandler from "../utils/asyncHandlerUtils.js";
import * as auditServices from "../services/auditServices.js";
import { successResponse } from "../utils/responseUtils.js";

const listAudits = asyncHandler(async (req, res) => {

    const { page, limit, sortBy, sortOrder, search } = req.query;

  const query = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sortBy: sortBy || "createdAt",
    sortOrder: sortOrder || "desc",
    search: search || "",
  };

  const result = await auditServices.listAuditLogs(query);
  return successResponse(res, "Audits fetched successfully", result, 200);
});

export default {
  listAudits,
};
export {
  listAudits,
};
