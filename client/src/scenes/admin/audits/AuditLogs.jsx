import React, { useMemo } from "react";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import Columns from "./Columns";
import DataTable from "@/components/common/DataTable";
import { useTheme } from "@/hooks/useTheme";
import { useTableControls } from "@/hooks/useTableControls";

/**
 * Main page for displaying AuditLog table (no filters, actions, stats).
 */
const FILTER_KEYS = []; // None

const AuditLogs = () => {
  const { theme } = useTheme();
  // Table controls (pagination/sorting only)
  const { tableState, handlers } = useTableControls({
    FILTER_KEYS,
    resourceName: "AuditLog",
  });
  const { pagination, sorting } = tableState;
  const { handlePaginationChange, handleSortingChange } = handlers;

  // Query audit logs with current table state as params
  const { data: logsData, ...queryStatus } = useAuditLogs({
    page: pagination.page,
    limit: pagination.limit,
    sortBy: sorting.sortBy,
    sortOrder: sorting.sortOrder,
  });

  const logs = logsData?.data ?? [];
  const totalRows = logsData?.pagination?.totalRows ?? 0;

  // Memoize column definitions
  const columns = useMemo(() => Columns(), []);

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
        {...queryStatus}
      />
    </div>
  );
};

AuditLogs.displayName = "AuditLogs";

export default AuditLogs;
