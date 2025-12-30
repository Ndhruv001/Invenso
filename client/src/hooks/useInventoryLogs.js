import { useQuery } from "@tanstack/react-query";
import {
  getInventoryLogs,
} from "@/services/inventoryLogServices";

/**
 * For inventory logs: only read/list and single detail view.
 * No mutations, no filters.
 */

// Table list with pagination/cursor/sorting
export const useInventoryLogs = (params = {}) =>
  useQuery({
    queryKey: ["inventories", params],
    queryFn: () => getInventoryLogs(params),
    keepPreviousData: true
  });


export default {
  useInventoryLogs,
};
