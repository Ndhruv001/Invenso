import { useQuery } from "@tanstack/react-query";
import {
  getAuditLogs,
} from "@/services/auditLogServices";

/**
 * For audit logs: only list and single detail view.
 * No mutations, no filters.
 */

// Table list with pagination/sorting
export const useAuditLogs = (params = {}) =>
  useQuery({
    queryKey: ["audits", params],
    queryFn: () => getAuditLogs(params),
    keepPreviousData: true
  });


export default {
  useAuditLogs,
};
