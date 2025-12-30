import React, { useMemo } from "react";
import { useInventoryLogs } from "@/hooks/useInventoryLogs";
import InventoryLogColumns from "./Columns";
import DataTable from "@/components/common/DataTable";
import { useTheme } from "@/hooks/useTheme";
import { useTableControls } from "@/hooks/useTableControls";

/**
 * Main page for displaying InventoryLog table (no filters, actions, stats).
 */
const FILTER_KEYS = []; // None

const InventoryLogs = () => {
  const { theme } = useTheme();
  // Table controls (pagination/sorting only)
  const { tableState, handlers } = useTableControls({
    FILTER_KEYS,
    resourceName: "InventoryLog",
  });
  const { pagination, sorting } = tableState;
  const { handlePaginationChange, handleSortingChange } = handlers;

  // Query inventory logs with current table state as params
  const { data: logsData, ...queryStatus } = useInventoryLogs({
    page: pagination.page,
    limit: pagination.limit,
    sortBy: sorting.sortBy,
    sortOrder: sorting.sortOrder,
  });

  const logs = logsData?.data ?? [];
  const totalRows = logsData?.pagination?.totalRows ?? 0;

  // Memoize column definitions
  const columns = useMemo(() => InventoryLogColumns(), []);

  return (
    <div
      className={`space-y-6 overflow-auto max-h-[calc(100vh-100px)] min-h-0 ${theme.bg} ${theme.text.primary}`}
    >
      <DataTable
        data={logs}
        columns={columns}
        totalRows={totalRows}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        showSelection={false}
        // No filters, no action ribbon, no search, read-only
        {...queryStatus}
      />
    </div>
  );
};

InventoryLogs.displayName = "InventoryLogs";

export default InventoryLogs;
