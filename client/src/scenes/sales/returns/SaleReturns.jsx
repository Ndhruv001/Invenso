import React, { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "react-toastify";

import {
  useSaleReturns,
  useUpdateSaleReturn,
  useDeleteSaleReturn,
  useCreateSaleReturn,
  useDownloadSaleReturnInvoice
} from "@/hooks/useSaleReturns";
import { useTableControls } from "@/hooks/useTableControls";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import { useTheme } from "@/hooks/useTheme";
import { useUIAction } from "@/context/UIActionContext";
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
  const createSaleReturnMutation = useCreateSaleReturn();
  const downloadInvoiceMutation = useDownloadSaleReturnInvoice();

  // Filter options
  const filterOptions = useSaleReturnFilterOptions();

  /** ---- Handlers ---- **/

  const openModalWith = useCallback((saleReturn, mode) => {
    setActiveSaleReturn(normalizeSaleReturnForModal(saleReturn));
    setModalMode(mode);
  }, []);

  // ---------------------------
  // UIAction (CREATE only)
  // ---------------------------
  const { action, clearAction } = useUIAction();

  useEffect(() => {
    if (!action) return;

    if (action.resource !== "saleReturn") return;

    if (action.type === "CREATE") {
      openModalWith({}, "create");
      clearAction();
    }
  }, [action, openModalWith, clearAction]);

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
    async purchaseData => {
      try {
        // 🟢 CREATE
        if (modalMode === "create") {
          await createSaleReturnMutation.mutateAsync(purchaseData, {
            onSuccess: () => {
              toast.success("Sale return created successfully");
              handleCancel();
            },
            onError: err => toast.error(err?.message || "Failed to create sale return")
          });

          return; // stop execution after create
        }

        // 🔵 EDIT
        if (modalMode === "edit") {
          if (!activeSaleReturn?.id) {
            toast.error("Cannot save: missing sale return context");
            return;
          }

          await updateSaleReturnMutation.mutateAsync(
            { id: activeSaleReturn.id, data: purchaseData },
            {
              onSuccess: () => {
                toast.success("Sale return updated successfully");
                handleCancel();
              },
              onError: err => toast.error(err?.message || "Failed to update sale return")
            }
          );

          return;
        }
      } catch (error) {
        toast.error(error?.message || "Something went wrong");
      }
    },
    [modalMode, activeSaleReturn, createSaleReturnMutation, updateSaleReturnMutation, handleCancel]
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

  const handleDownload = useCallback(() => {
    if (!selectedRows?.length) {
      toast.error("No sales returns selected");
      return;
    }

    openDialog({
      title: "Download Selected Invoices",
      message: `Download invoice for ${selectedRows.length} sale return(s)?`,
      onConfirm: async () => {
        try {
          const results = await Promise.allSettled(
            selectedRows.map(s => downloadInvoiceMutation.mutateAsync(s.id))
          );

          const successCount = results.filter(r => r.status === "fulfilled").length;

          const failedCount = results.length - successCount;

          if (successCount > 0) {
            toast.success(`${successCount} invoice(s) downloaded successfully`);
          }

          if (failedCount > 0) {
            toast.error(`${failedCount} invoice(s) failed to download`);
          }
        } catch (err) {
          toast.error(err?.message || "Unexpected error during download");
        }
      }
    });
  }, [selectedRows, downloadInvoiceMutation, openDialog]);

  const handlePrint = saleReturnId => {
    if (!saleReturnId) return;

    const url = `${import.meta.env.VITE_API_BASE_URL}/sale-returns/print/invoice/${saleReturnId}`;

    window.open(url, "_blank");
  };

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
          print: () => handlePrint(selectedRows?.[0].id),
          download: handleDownload
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

      {modalMode && (
        <SaleReturnModal
          initialData={modalMode === "edit" || modalMode === "view" ? activeSaleReturn : null}
          mode={modalMode}
          setMode={setModalMode}
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
