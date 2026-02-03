// src/scenes/sales/Sales.js
import React, { useState, useMemo, useCallback } from "react";
import { toast } from "react-toastify";

import { useSales, useUpdateSale, useDeleteSale } from "@/hooks/useSales";
import { useTableControls } from "@/hooks/useTableControls";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import { useTheme } from "@/hooks/useTheme";
import { useSaleFilterOptions } from "@/hooks/useSaleFilterOptions";

import Columns from "./Columns";
import SaleModal from "./SaleModal";
import SalesSummaryStats from "./SalesSummaryStats";
import ActionRibbon from "@/components/common/ActionRibbon";
import DataTable from "@/components/common/DataTable";
import DataFilter from "@/components/common/DataFilter";
import ConfirmationModal from "@/components/common/ConfirmationModal";

// Filters synced with URL state for Sale
const FILTER_KEYS = ["partyId", "dateFrom", "dateTo"];

/**
 * Normalize a sale for modal use.
 * Prevents runtime issues when opening view/edit forms with incomplete data.
 */
function normalizeSaleForModal(sale) {
  if (!sale) return null;
  return {
    id: sale.id ?? undefined,
    invoiceNumber: sale.invoiceNumber ?? "",
    ...sale
  };
}

const Sales = () => {
  const { theme } = useTheme();

  // Unified table controls for filters, pagination, sorting, selection
  const { filters, selection, tableState, handlers } = useTableControls({
    FILTER_KEYS,
    resourceName: "Sale"
  });

  const { showSelection, setShowSelection, selectedRows, handleSelectionChange } = selection;
  const { pagination, sorting } = tableState;
  const { handleFiltersChange, handleClearFilters, handlePaginationChange, handleSortingChange } =
    handlers;

  // Modal state
  const [activeSale, setActiveSale] = useState(null);
  const [modalMode, setModalMode] = useState(null); // "view" | "edit" | "create"

  // Confirmation dialog hook
  const { dialogConfig, openDialog, closeDialog } = useConfirmationDialog();

  // Sale data query
  const { data: salesData, refetch, ...queryStatus } = useSales(filters);
  const sales = salesData?.data ?? [];
  const totalRows = salesData?.pagination?.totalRows ?? 0;

  // Mutations
  const updateSaleMutation = useUpdateSale();
  const deleteSaleMutation = useDeleteSale();

  // Filter options
  const filterOptions = useSaleFilterOptions();

  /** ---- Handlers ---- **/

  const openModalWith = useCallback((sale, mode) => {
    setActiveSale(normalizeSaleForModal(sale));
    setModalMode(mode);
  }, []);

  const handleView = useCallback(
    sale => {
      if (!sale?.id) return toast.error("Unable to view: missing sale information");
      openModalWith(sale, "view");
    },
    [openModalWith]
  );

  const handleEdit = useCallback(
    sale => {
      if (!sale?.id) return toast.error("Unable to edit: missing sale information");
      openModalWith(sale, "edit");
    },
    [openModalWith]
  );

  const handleCancel = useCallback(() => {
    setActiveSale(null);
    setModalMode(null);
  }, []);

  const handleSubmit = useCallback(
    async saleData => {
      if (!activeSale?.id) {
        toast.error("Cannot save: missing sale context");
        return;
      }

      await updateSaleMutation.mutateAsync(
        { id: activeSale.id, data: saleData },
        {
          onSuccess: () => {
            toast.success("Sale updated successfully");
            handleCancel();
          },
          onError: err => toast.error(err?.message || "Failed to update sale")
        }
      );
    },
    [activeSale, updateSaleMutation, handleCancel]
  );

  const handleDelete = useCallback(() => {
    if (!selectedRows?.length) {
      toast.error("No sales selected");
      return;
    }

    openDialog({
      title: "Delete Selected Sales",
      message: `Are you sure you want to delete ${selectedRows.length} sale(s)?`,
      onConfirm: async () => {
        try {
          const results = await Promise.allSettled(
            selectedRows.map(s => deleteSaleMutation.mutateAsync(s.id))
          );

          const successCount = results.filter(r => r.status === "fulfilled").length;
          const failedCount = results.length - successCount;

          if (successCount > 0) {
            toast.success(`${successCount} sale(s) deleted successfully`);
            handleSelectionChange([]);
            refetch();
          }

          if (failedCount > 0) {
            toast.error(`${failedCount} sale(s) failed to delete`);
          }
        } catch (err) {
          toast.error(err?.message || "Unexpected error during deletion");
        }
      }
    });
  }, [selectedRows, deleteSaleMutation, openDialog, handleSelectionChange, refetch]);

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
        searchPlaceholder="Search sales, customers, invoices..."
        className="sticky top-0 z-10 bg-inherit"
      />

      <SalesSummaryStats stats={salesData?.stats} />

      <ActionRibbon
        resourceName="Sale"
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
        data={sales}
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

      {activeSale && (
        <SaleModal
          initialData={activeSale}
          isViewOnly={modalMode === "view"}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      )}

      {dialogConfig.isOpen && <ConfirmationModal {...dialogConfig} onCancel={closeDialog} />}
    </div>
  );
};

Sales.displayName = "Sales";

export default Sales;
