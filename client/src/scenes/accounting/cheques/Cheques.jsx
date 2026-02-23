import React, { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "react-toastify";

import {
  useCheques,
  useUpdateCheque,
  useDeleteCheque,
  useCreateCheque
} from "@/hooks/useCheques"; // Assuming these hooks exist

import { useTableControls } from "@/hooks/useTableControls";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import { useTheme } from "@/hooks/useTheme";
import { useUIAction } from "@/context/UIActionContext";
import { useChequeFilterOptions } from "@/hooks/useChequeFilterOptions"; // Assuming this hook exists

import Columns from "./Columns";
import ChequeModal from "./ChequeModal";
import ChequesSummaryStats from "./ChequesSummaryStats";
import ActionRibbon from "@/components/common/ActionRibbon";
import DataTable from "@/components/common/DataTable";
import DataFilter from "@/components/common/DataFilter";
import ConfirmationModal from "@/components/common/ConfirmationModal";

// Filters synced with URL state for Cheques
const FILTER_KEYS = ["type", "status", "dateFrom", "dateTo"];

/**
 * Normalize a cheque record for modal use.
 */
function normalizeChequeForModal(cheque) {
  if (!cheque) return null;
  return {
    id: cheque.id ?? undefined,
    amount: cheque.amount ?? 0,
    ...cheque,
  };
}

const Cheques = () => {
  const { theme } = useTheme();

  // Unified table controls
  const { filters, selection, tableState, handlers } = useTableControls({
    FILTER_KEYS,
    resourceName: "Cheque",
  });

  const { showSelection, setShowSelection, selectedRows, handleSelectionChange } = selection;
  const { pagination, sorting } = tableState;
  const { handleFiltersChange, handleClearFilters, handlePaginationChange, handleSortingChange } =
    handlers;

  // Modal management
  const [activeCheque, setActiveCheque] = useState(null);
  const [modalMode, setModalMode] = useState(null); // view | edit | create

  // Confirmation dialog
  const { dialogConfig, openDialog, closeDialog } = useConfirmationDialog();

  // Query: Cheques list
  const { data: chequesData, refetch, ...queryStatus } = useCheques(filters);
  const cheques = chequesData?.data ?? [];
  const totalRows = chequesData?.pagination?.totalRows ?? 0;

  // Mutations
  const updateChequeMutation = useUpdateCheque();
  const deleteChequeMutation = useDeleteCheque();
  const createChequeMutation = useCreateCheque();

  // Filter options
  const filterOptions = useChequeFilterOptions();

  /** ---- Handlers ---- **/

  const openModalWith = useCallback((cheque, mode) => {
    setActiveCheque(normalizeChequeForModal(cheque));
    setModalMode(mode);
  }, []);

  // ---------------------------
  // UIAction (CREATE only)
  // ---------------------------
  const { action, clearAction } = useUIAction();

  useEffect(() => {
    if (!action) return;

    if (action.resource !== "cheque") return;

    if (action.type === "CREATE") {
      openModalWith({}, "create");
      clearAction();
    }
  }, [action, openModalWith, clearAction]);

  const handleView = useCallback(
    (cheque) => {
      if (!cheque?.id) return toast.error("Unable to view: missing cheque info");
      openModalWith(cheque, "view");
    },
    [openModalWith]
  );

  const handleEdit = useCallback(
    (cheque) => {
      if (!cheque?.id) return toast.error("Unable to edit: missing cheque info");
      openModalWith(cheque, "edit");
    },
    [openModalWith]
  );

  const handleCancel = useCallback(() => {
    setActiveCheque(null);
    setModalMode(null);
  }, []);

  const handleSubmit = useCallback(
    async chequeData => {
      try {
        // 🟢 CREATE
        if (modalMode === "create") {
          await createChequeMutation.mutateAsync(chequeData, {
            onSuccess: () => {
              toast.success("Cheque created successfully");
              handleCancel();
            },
            onError: err => toast.error(err?.message || "Failed to create cheque")
          });
          return;
        }

        // 🔵 EDIT
        if (modalMode === "edit") {
          if (!activeCheque?.id) {
            toast.error("Cannot save: missing cheque context");
            return;
          }

          await updateChequeMutation.mutateAsync(
            { id: activeCheque.id, data: chequeData },
            {
              onSuccess: () => {
                toast.success("Cheque updated successfully");
                handleCancel();
              },
              onError: err => toast.error(err?.message || "Failed to update cheque")
            }
          );
          return;
        }
      } catch (error) {
        toast.error(error?.message || "Something went wrong");
      }
    },
    [modalMode, activeCheque, createChequeMutation, updateChequeMutation, handleCancel]
  );

  const handleDelete = useCallback(() => {
    if (!selectedRows?.length) {
      toast.error("No cheques selected");
      return;
    }

    openDialog({
      title: "Delete Selected Cheques",
      message: `Are you sure you want to delete ${selectedRows.length} cheque(s)? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const results = await Promise.allSettled(
            selectedRows.map((c) => deleteChequeMutation.mutateAsync(c.id))
          );

          const successCount = results.filter((r) => r.status === "fulfilled").length;
          const failedCount = results.length - successCount;

          if (successCount > 0) {
            toast.success(`${successCount} cheque(s) deleted successfully`);
            handleSelectionChange([]);
            refetch();
          }

          if (failedCount > 0) {
            toast.error(`${failedCount} cheque(s) failed to delete`);
          }
        } catch (err) {
          toast.error(err?.message || "Unexpected error during deletion");
        }
      },
    });
  }, [selectedRows, deleteChequeMutation, openDialog, handleSelectionChange, refetch]);

  // Columns
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
        searchPlaceholder="Search cheque number, bank, or party..."
        className="sticky top-0 z-10 bg-inherit"
      />

      <ChequesSummaryStats stats={chequesData?.stats} />

      <ActionRibbon
        resourceName="Cheque"
        actions={["edit", "delete", "print", "download"]}
        selectionOpen={showSelection}
        selectedCount={selectedRows?.length}
        onToggleSelection={() => setShowSelection((prev) => !prev)}
        handlers={{
          edit: () => handleEdit(selectedRows?.[0]),
          delete: handleDelete,
          print: null,
          download: null,
        }}
      />

      <DataTable
        data={cheques}
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
        <ChequeModal
          initialData={modalMode === "edit" || modalMode === "view" ? activeCheque : null}
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

Cheques.displayName = "Cheques";

export default Cheques;