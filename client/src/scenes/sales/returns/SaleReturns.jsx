import React, { useState, useMemo, useCallback } from "react";
import { toast } from "react-toastify";

import {
  useSaleReturns,
  useUpdateSaleReturn,
  useDeleteSaleReturn
} from "@/hooks/useSaleReturns";
import { useTableControls } from "@/hooks/useTableControls";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import { useTheme } from "@/hooks/useTheme";
import { useSaleReturnFilterOptions } from "@/hooks/useSaleReturnFilterOptions";

import Columns from "./Columns";
import SaleReturnModal from "./SaleReturnModal";
import SaleReturnSummaryStats from "./SaleReturnsSummaryStats";
import ActionRibbon from "@/components/common/ActionRibbon";
import DataTable from "@/components/common/DataTable";
import DataFilter from "@/components/common/DataFilter";
import ConfirmationModal from "@/components/common/ConfirmationModal";

// Filters synced with URL state for Sale Return
const FILTER_KEYS = ["partyId", "saleId", "dateFrom", "dateTo"];

/**
 * Normalize a sale return for modal use.
 * Prevents runtime issues when opening view/edit forms with incomplete data.
 */
function normalizeSaleReturnForModal(saleReturn) {
  if (!saleReturn) return null;
  return {
    id: saleReturn.id ?? undefined,
    ...saleReturn
  };
}

const SaleReturns = () => {
  const { theme } = useTheme();

  // Unified table controls
  const { filters, selection, tableState, handlers } = useTableControls({
    FILTER_KEYS,
    resourceName: "Sale Return"
  });

  const { showSelection, setShowSelection, selectedRows, handleSelectionChange } = selection;
  const { pagination, sorting } = tableState;
  const { handleFiltersChange, handleClearFilters, handlePaginationChange, handleSortingChange } =
    handlers;

  // Modal state
  const [activeSaleReturn, setActiveSaleReturn] = useState(null);
  const [modalMode, setModalMode] = useState(null); // "view" | "edit"

  // Confirmation dialog
  const { dialogConfig, openDialog, closeDialog } = useConfirmationDialog();

  // Sale Return data query
  const { data: saleReturnsData, refetch, ...queryStatus } = useSaleReturns(filters);
  const saleReturns = saleReturnsData?.data ?? [];
  const totalRows = saleReturnsData?.pagination?.totalRows ?? 0;

  // Mutations
  const updateSaleReturnMutation = useUpdateSaleReturn();
  const deleteSaleReturnMutation = useDeleteSaleReturn();

  // Filter options
  const filterOptions = useSaleReturnFilterOptions();

  /** ---- Handlers ---- **/

  const openModalWith = useCallback((saleReturn, mode) => {
    setActiveSaleReturn(normalizeSaleReturnForModal(saleReturn));
    setModalMode(mode);
  }, []);

  const handleView = useCallback(
    saleReturn => {
      if (!saleReturn?.id) return toast.error("Unable to view: missing sale return information");
      openModalWith(saleReturn, "view");
    },
    [openModalWith]
  );

  const handleEdit = useCallback(
    saleReturn => {
      if (!saleReturn?.id) return toast.error("Unable to edit: missing sale return information");
      openModalWith(saleReturn, "edit");
    },
    [openModalWith]
  );

  const handleCancel = useCallback(() => {
    setActiveSaleReturn(null);
    setModalMode(null);
  }, []);

  const handleSubmit = useCallback(
    async saleReturnData => {
      if (!activeSaleReturn?.id) {
        toast.error("Cannot save: missing sale return context");
        return;
      }

      await updateSaleReturnMutation.mutateAsync(
        { id: activeSaleReturn.id, data: saleReturnData },
        {
          onSuccess: () => {
            toast.success("Sale return updated successfully");
            handleCancel();
          },
          onError: err => toast.error(err?.message || "Failed to update sale return")
        }
      );
    },
    [activeSaleReturn, updateSaleReturnMutation, handleCancel]
  );

  const handleDelete = useCallback(() => {
    if (!selectedRows?.length) {
      toast.error("No sale returns selected");
      return;
    }

    openDialog({
      title: "Delete Selected Sale Returns",
      message: `Are you sure you want to delete ${selectedRows.length} sale return(s)?`,
      onConfirm: async () => {
        try {
          const results = await Promise.allSettled(
            selectedRows.map(r => deleteSaleReturnMutation.mutateAsync(r.id))
          );

          const successCount = results.filter(r => r.status === "fulfilled").length;
          const failedCount = results.length - successCount;

          if (successCount > 0) {
            toast.success(`${successCount} sale return(s) deleted successfully`);
            handleSelectionChange([]);
            refetch();
          }

          if (failedCount > 0) {
            toast.error(`${failedCount} sale return(s) failed to delete`);
          }
        } catch (err) {
          toast.error(err?.message || "Unexpected error during deletion");
        }
      }
    });
  }, [selectedRows, deleteSaleReturnMutation, openDialog, handleSelectionChange, refetch]);

  // Memoized column definitions
  const columns = useMemo(() => Columns(showSelection), [showSelection]);

  return (
    <div
      className={`space-y-6 overflow-auto max-h-[calc(100vh-100px)] min-h-0 ${theme.bg} ${theme.text.primary}`}
    >
      <DataFilter
        filters={filters}
        filterOptions={filterOptions}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        totalRows={totalRows}
        searchPlaceholder="Search sale returns, customers, invoices..."
        className="sticky top-0 z-10 bg-inherit"
      />

      <SaleReturnSummaryStats stats={saleReturnsData?.stats} />

      <ActionRibbon
        resourceName="Sale Return"
        actions={["edit", "delete", "print", "download"]}
        selectionOpen={showSelection}
        selectedCount={selectedRows?.length}
        onToggleSelection={() => setShowSelection(prev => !prev)}
        handlers={{
          edit: () => handleEdit(selectedRows?.[0]),
          delete: handleDelete,
          print: null,
          download: null
        }}
      />

      <DataTable
        data={saleReturns}
        columns={columns}
        totalRows={totalRows}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        showSelection={showSelection}
        onSelectionChange={handleSelectionChange}
        onRowDoubleClick={handleView}
        refetch={refetch}
        {...queryStatus}
      />

      {activeSaleReturn && (
        <SaleReturnModal
          initialData={activeSaleReturn}
          isViewOnly={modalMode === "view"}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      )}

      {dialogConfig.isOpen && <ConfirmationModal {...dialogConfig} onCancel={closeDialog} />}
    </div>
  );
};

SaleReturns.displayName = "SaleReturns";

export default SaleReturns;
