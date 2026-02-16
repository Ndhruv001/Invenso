// src/scenes/purchases/Purchases.js
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "react-toastify";

import {
  usePurchases,
  useCreatePurchase,
  useUpdatePurchase,
  useDeletePurchase
} from "@/hooks/usePurchases";
import { useTableControls } from "@/hooks/useTableControls";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import { useTheme } from "@/hooks/useTheme";
import { useUIAction } from "@/context/UIActionContext";
import { usePurchaseFilterOptions } from "@/hooks/usePurchaseFilterOptions";

import Columns from "./Columns";
import PurchaseModal from "./PurchaseModal";
import PurchasesSummaryStats from "./PurchasesSummaryStats";
import ActionRibbon from "@/components/common/ActionRibbon";
import DataTable from "@/components/common/DataTable";
import DataFilter from "@/components/common/DataFilter";
import ConfirmationModal from "@/components/common/ConfirmationModal";

// Filters synced with URL state for Purchase
const FILTER_KEYS = ["partyId", "dateFrom", "dateTo"];

/**
 * Normalize a purchase for modal use.
 * Prevents runtime issues when opening view/edit forms with incomplete data.
 */
function normalizePurchaseForModal(purchase) {
  if (!purchase) return null;
  return {
    id: purchase.id ?? undefined,
    invoiceNumber: purchase.invoiceNumber ?? "",
    ...purchase
  };
}

const Purchases = () => {
  const { theme } = useTheme();

  // Unified table controls for filters, pagination, sorting, selection
  const { filters, selection, tableState, handlers } = useTableControls({
    FILTER_KEYS,
    resourceName: "Purchase"
  });

  const { showSelection, setShowSelection, selectedRows, handleSelectionChange } = selection;
  const { pagination, sorting } = tableState;
  const { handleFiltersChange, handleClearFilters, handlePaginationChange, handleSortingChange } =
    handlers;

  // Modal state
  const [activePurchase, setActivePurchase] = useState(null);
  const [modalMode, setModalMode] = useState(null); // "view" | "edit" | "create"

  // Confirmation dialog hook
  const { dialogConfig, openDialog, closeDialog } = useConfirmationDialog();

  // Purchase data query
  const { data: purchasesData, refetch, ...queryStatus } = usePurchases(filters);
  const purchases = purchasesData?.data ?? [];
  const totalRows = purchasesData?.pagination?.totalRows ?? 0;

  // Mutations
  const updatePurchaseMutation = useUpdatePurchase();
  const deletePurchaseMutation = useDeletePurchase();
  const createPurchaseMutation = useCreatePurchase();

  // Filter options
  const filterOptions = usePurchaseFilterOptions();

  /** ---- Handlers ---- **/

  const openModalWith = useCallback((purchase, mode) => {
    setActivePurchase(normalizePurchaseForModal(purchase));
    setModalMode(mode);
  }, []);

    // ---------------------------
    // UIAction (CREATE only)
    // ---------------------------
    const { action, clearAction } = useUIAction();
  
    useEffect(() => {
      if (!action) return;
  
      if (action.resource !== "purchase") return;
  
      if (action.type === "CREATE") {
        openModalWith({}, "create");
        clearAction();
      }
    }, [action, openModalWith, clearAction]);

  const handleView = useCallback(
    purchase => {
      if (!purchase?.id) return toast.error("Unable to view: missing purchase information");
      openModalWith(purchase, "view");
    },
    [openModalWith]
  );

  const handleEdit = useCallback(
    purchase => {
      if (!purchase?.id) return toast.error("Unable to edit: missing purchase information");
      openModalWith(purchase, "edit");
    },
    [openModalWith]
  );

  const handleCancel = useCallback(() => {
    setActivePurchase(null);
    setModalMode(null);
  }, []);

  const handleSubmit = useCallback(
    async purchaseData => {
      try {
        // 🟢 CREATE
        if (modalMode === "create") {
          await createPurchaseMutation.mutateAsync(purchaseData, {
            onSuccess: () => {
              toast.success("Purchase created successfully");
              handleCancel();
            },
            onError: err => toast.error(err?.message || "Failed to create purchase")
          });

          return; // stop execution after create
        }

        // 🔵 EDIT
        if (modalMode === "edit") {
          if (!activePurchase?.id) {
            toast.error("Cannot save: missing purchase context");
            return;
          }

          await updatePurchaseMutation.mutateAsync(
            { id: activePurchase.id, data: purchaseData },
            {
              onSuccess: () => {
                toast.success("Purchase updated successfully");
                handleCancel();
              },
              onError: err => toast.error(err?.message || "Failed to update purchase")
            }
          );

          return;
        }
      } catch (error) {
        toast.error(error?.message || "Something went wrong");
      }
    },
    [modalMode, activePurchase, createPurchaseMutation, updatePurchaseMutation, handleCancel]
  );

  const handleDelete = useCallback(() => {
    if (!selectedRows?.length) {
      toast.error("No purchases selected");
      return;
    }

    openDialog({
      title: "Delete Selected Purchases",
      message: `Are you sure you want to delete ${selectedRows.length} purchase(s)?`,
      onConfirm: async () => {
        try {
          const results = await Promise.allSettled(
            selectedRows.map(p => deletePurchaseMutation.mutateAsync(p.id))
          );

          const successCount = results.filter(r => r.status === "fulfilled").length;
          const failedCount = results.length - successCount;

          if (successCount > 0) {
            toast.success(`${successCount} purchase(s) deleted successfully`);
            handleSelectionChange([]);
            refetch();
          }

          if (failedCount > 0) {
            toast.error(`${failedCount} purchase(s) failed to delete`);
          }
        } catch (err) {
          toast.error(err?.message || "Unexpected error during deletion");
        }
      }
    });
  }, [selectedRows, deletePurchaseMutation, openDialog, handleSelectionChange, refetch]);

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
        searchPlaceholder="Search purchases, parties, invoices..."
        className="sticky top-0 z-10 bg-inherit"
      />

      <PurchasesSummaryStats stats={purchasesData?.stats} />

      <ActionRibbon
        resourceName="Purchase"
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
        data={purchases}
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
        <PurchaseModal
          initialData={modalMode === "edit" || modalMode === "view" ? activePurchase : null}
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

Purchases.displayName = "Purchases";

export default Purchases;
