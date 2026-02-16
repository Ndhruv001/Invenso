// src/scenes/purchaseReturns/PurchaseReturns.js
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "react-toastify";

import {
  usePurchaseReturns,
  useCreatePurchaseReturn,
  useUpdatePurchaseReturn,
  useDeletePurchaseReturn
} from "@/hooks/usePurchaseReturns";
import { useTableControls } from "@/hooks/useTableControls";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import { useUIAction } from "@/context/UIActionContext";
import { useTheme } from "@/hooks/useTheme";
import { usePurchaseReturnFilterOptions } from "@/hooks/usePurchaseReturnFilterOptions";

import Columns from "./Columns";
import PurchaseReturnModal from "./PurchaseReturnModal";
import PurchaseReturnSummaryStats from "./PurchaseReturnSummaryStats";
import ActionRibbon from "@/components/common/ActionRibbon";
import DataTable from "@/components/common/DataTable";
import DataFilter from "@/components/common/DataFilter";
import ConfirmationModal from "@/components/common/ConfirmationModal";

// Filters synced with URL state for Purchase Return
const FILTER_KEYS = ["partyId", "dateFrom", "dateTo"];

/**
 * Normalize a purchase return for modal use.
 * Prevents runtime issues when opening view/edit forms with incomplete data.
 */
function normalizePurchaseReturnForModal(purchaseReturn) {
  if (!purchaseReturn) return null;
  return {
    id: purchaseReturn.id ?? undefined,
    ...purchaseReturn
  };
}

const PurchaseReturns = () => {
  const { theme } = useTheme();

  // Unified table controls for filters, pagination, sorting, selection
  const { filters, selection, tableState, handlers } = useTableControls({
    FILTER_KEYS,
    resourceName: "PurchaseReturn"
  });

  const { showSelection, setShowSelection, selectedRows, handleSelectionChange } = selection;
  const { pagination, sorting } = tableState;
  const { handleFiltersChange, handleClearFilters, handlePaginationChange, handleSortingChange } =
    handlers;

  // Modal state
  const [activePurchaseReturn, setActivePurchaseReturn] = useState(null);
  const [modalMode, setModalMode] = useState(null); // "view" | "edit" | "create"

  // Confirmation dialog hook
  const { dialogConfig, openDialog, closeDialog } = useConfirmationDialog();

  // Purchase Return data query
  const { data: purchaseReturnsData, refetch, ...queryStatus } = usePurchaseReturns(filters);

  const purchaseReturns = purchaseReturnsData?.data ?? [];
  const totalRows = purchaseReturnsData?.pagination?.totalRows ?? 0;

  // Mutations
  const updatePurchaseReturnMutation = useUpdatePurchaseReturn();
  const deletePurchaseReturnMutation = useDeletePurchaseReturn();
  const createPurchaseReturnMutation = useCreatePurchaseReturn();

  // Filter options
  const filterOptions = usePurchaseReturnFilterOptions();

  /** ---- Handlers ---- **/

  const openModalWith = useCallback((purchaseReturn, mode) => {
    setActivePurchaseReturn(normalizePurchaseReturnForModal(purchaseReturn));
    setModalMode(mode);
  }, []);

    // ---------------------------
    // UIAction (CREATE only)
    // ---------------------------
    const { action, clearAction } = useUIAction();
  
    useEffect(() => {
      if (!action) return;
  
      if (action.resource !== "purchaseReturn") return;
  
      if (action.type === "CREATE") {
        openModalWith({}, "create");
        clearAction();
      }
    }, [action, openModalWith, clearAction]);

  const handleView = useCallback(
    purchaseReturn => {
      if (!purchaseReturn?.id)
        return toast.error("Unable to view: missing purchase return information");
      openModalWith(purchaseReturn, "view");
    },
    [openModalWith]
  );

  const handleEdit = useCallback(
    purchaseReturn => {
      if (!purchaseReturn?.id)
        return toast.error("Unable to edit: missing purchase return information");
      openModalWith(purchaseReturn, "edit");
    },
    [openModalWith]
  );

  const handleCancel = useCallback(() => {
    setActivePurchaseReturn(null);
    setModalMode(null);
  }, []);

  const handleSubmit = useCallback(
     async purchaseData => {
       try {
         // 🟢 CREATE
         if (modalMode === "create") {
           await createPurchaseReturnMutation.mutateAsync(purchaseData, {
             onSuccess: () => {
               toast.success("Purchase return created successfully");
               handleCancel();
             },
             onError: err => toast.error(err?.message || "Failed to create purchase return")
           });
 
           return; // stop execution after create
         }
 
         // 🔵 EDIT
         if (modalMode === "edit") {
           if (!activePurchaseReturn?.id) {
             toast.error("Cannot save: missing purchase return context");
             return;
           }
 
           await updatePurchaseReturnMutation.mutateAsync(
             { id: activePurchaseReturn.id, data: purchaseData },
             {
               onSuccess: () => {
                 toast.success("Purchase return updated successfully");
                 handleCancel();
               },
               onError: err => toast.error(err?.message || "Failed to update purchase return")
             }
           );
 
           return;
         }
       } catch (error) {
         toast.error(error?.message || "Something went wrong");
       }
     },
     [modalMode, activePurchaseReturn, createPurchaseReturnMutation, updatePurchaseReturnMutation, handleCancel]
   );

  const handleDelete = useCallback(() => {
    if (!selectedRows?.length) {
      toast.error("No purchase returns selected");
      return;
    }

    openDialog({
      title: "Delete Selected Purchase Returns",
      message: `Are you sure you want to delete ${selectedRows.length} purchase return(s)?`,
      onConfirm: async () => {
        try {
          const results = await Promise.allSettled(
            selectedRows.map(pr => deletePurchaseReturnMutation.mutateAsync(pr.id))
          );

          const successCount = results.filter(r => r.status === "fulfilled").length;
          const failedCount = results.length - successCount;

          if (successCount > 0) {
            toast.success(`${successCount} purchase return(s) deleted successfully`);
            handleSelectionChange([]);
            refetch();
          }

          if (failedCount > 0) {
            toast.error(`${failedCount} purchase return(s) failed to delete`);
          }
        } catch (err) {
          toast.error(err?.message || "Unexpected error during deletion");
        }
      }
    });
  }, [selectedRows, deletePurchaseReturnMutation, openDialog, handleSelectionChange, refetch]);

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
        searchPlaceholder="Search purchase returns, parties..."
        className="sticky top-0 z-10 bg-inherit"
      />

      <PurchaseReturnSummaryStats stats={purchaseReturnsData?.stats} />

      <ActionRibbon
        resourceName="Purchase Return"
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
        data={purchaseReturns}
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
        <PurchaseReturnModal
          initialData={modalMode === "edit" || modalMode === "view" ? activePurchaseReturn : null}
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

PurchaseReturns.displayName = "PurchaseReturns";

export default PurchaseReturns;
