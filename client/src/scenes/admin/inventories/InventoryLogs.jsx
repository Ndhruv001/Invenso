import React, { useMemo, useState, useEffect } from "react";
import { useInventoryLogs } from "@/hooks/useInventoryLogs";
import InventoryLogColumns from "./Columns";
import DataTable from "@/components/common/DataTable";
import { useUIAction } from "@/context/UIActionContext";
import { useStockAdjustments } from "@/hooks/useStockAdjustments";
import { useTheme } from "@/hooks/useTheme";
import { useTableControls } from "@/hooks/useTableControls";
import { toast } from "react-toastify";
import StockAdjustmentModal from "@/scenes/stock-adjustments/StockAdjustmentModal";

/**
 * Main page for displaying InventoryLog table (no filters, actions, stats).
 */
const FILTER_KEYS = []; // None

const InventoryLogs = () => {
  const { theme } = useTheme();
  // Table controls (pagination/sorting only)
  const { tableState, handlers, filters } = useTableControls({
    FILTER_KEYS,
    resourceName: "InventoryLog"
  });
  const { pagination, sorting } = tableState;
  const { handlePaginationChange, handleSortingChange } = handlers;

  // Query inventory logs with current table state as params
  const { data: logsData, ...queryStatus } = useInventoryLogs(filters);
  const [isStockAdjustmentModalOpen, setIsStockAdjustmentModalOpen] = useState(false);
  const createStockAdjustments = useStockAdjustments();

  // ---------------------------
  // UIAction (CREATE only)
  // ---------------------------
  const { action, clearAction } = useUIAction();

  useEffect(() => {
    if (!action) return;

    if (action.resource !== "stockAdjustment") return;

    if (action.type === "CREATE") {
      setIsStockAdjustmentModalOpen(true);
      clearAction();
    }
  }, [action, isStockAdjustmentModalOpen, clearAction]);

  const handleSubmitStockAdjustments = async stockAdjustmentData => {
    try {
      await createStockAdjustments.mutateAsync(stockAdjustmentData);

      toast.success("Stock Adjusted successfully");

      setIsStockAdjustmentModalOpen(false);
    } catch (err) {
      toast.error(err?.message || "Failed to create category");
    }
  };

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

      {isStockAdjustmentModalOpen && (
        <StockAdjustmentModal
          mode="create"
          onCancel={() => setIsStockAdjustmentModalOpen(false)}
          onSubmit={handleSubmitStockAdjustments}
        />
      )}
    </div>
  );
};

InventoryLogs.displayName = "InventoryLogs";

export default InventoryLogs;
