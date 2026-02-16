// src/scenes/transports/Transports.js
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "react-toastify";

import { useTransports, useUpdateTransport, useDeleteTransport, useCreateTransport } from "@/hooks/useTransports";
import { useTableControls } from "@/hooks/useTableControls";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import { useTheme } from "@/hooks/useTheme";
import { useUIAction } from "@/context/UIActionContext";
import { useTransportFilterOptions } from "@/hooks/useTransportFilterOptions";

import Columns from "./Columns";
import TransportModal from "./TransportModal";
import TransportsSummaryStats from "./TransportsSummaryStats";
import ActionRibbon from "../../components/common/ActionRibbon";
import DataTable from "@/components/common/DataTable";
import DataFilter from "@/components/common/DataFilter";
import ConfirmationModal from "@/components/common/ConfirmationModal";

// Filters synced with URL state
const FILTER_KEYS = ["paymentMode", "dateFrom", "dateTo"];

/**
 * Normalize a transport for modal use.
 * Prevents runtime issues when opening view/edit forms with incomplete data.
 */
function normalizeTransportForModal(transport) {
  if (!transport) return null;
  return {
    id: transport.id ?? undefined,
    partyId: transport.partyId ?? "",
    driverId: transport.driverId ?? "",
    date: transport.date ?? new Date(),
    ...transport
  };
}

const Transports = () => {
  const { theme } = useTheme();

  // Unified table controls (filters, pagination, sorting, selection)
  const { filters, selection, tableState, handlers } = useTableControls({
    FILTER_KEYS,
    resourceName: "Transport"
  });

  const { showSelection, setShowSelection, selectedRows, handleSelectionChange } = selection;
  const { pagination, sorting } = tableState;
  const { handleFiltersChange, handleClearFilters, handlePaginationChange, handleSortingChange } =
    handlers;

  // Modal state
  const [activeTransport, setActiveTransport] = useState(null);
  const [modalMode, setModalMode] = useState(null); // "view" | "edit" | "create"

  // Confirmation dialog hook
  const { dialogConfig, openDialog, closeDialog } = useConfirmationDialog();

  // Transport data
  const { data: transportsData, refetch, ...queryStatus } = useTransports(filters);
  const transports = transportsData?.data ?? [];
  const totalRows = transportsData?.pagination?.totalRows ?? 0;

  // Mutations
  const updateTransportMutation = useUpdateTransport();
  const deleteTransportMutation = useDeleteTransport();
  const createTransportMutation = useCreateTransport();

  // Filter options
  const filterOptions = useTransportFilterOptions();

  /** ---- Handlers ---- **/

  const openModalWith = useCallback((transport, mode) => {
    setActiveTransport(normalizeTransportForModal(transport));
    setModalMode(mode);
  }, []);

    // ---------------------------
      // UIAction (CREATE only)
      // ---------------------------
      const { action, clearAction } = useUIAction();
    
      useEffect(() => {
        if (!action) return;
    
        if (action.resource !== "transport") return;
    
        if (action.type === "CREATE") {
          openModalWith({}, "create");
          clearAction();
        }
      }, [action, openModalWith, clearAction]);

  const handleView = useCallback(
    transport => {
      if (!transport?.id) return toast.error("Unable to view: missing transport info");
      openModalWith(transport, "view");
    },
    [openModalWith]
  );

  const handleEdit = useCallback(
    transport => {
      if (!transport?.id) return toast.error("Unable to edit: missing transport info");
      openModalWith(transport, "edit");
    },
    [openModalWith]
  );

  const handleCancel = useCallback(() => {
    setActiveTransport(null);
    setModalMode(null);
  }, []);

  const handleSubmit = useCallback(
     async purchaseData => {
       try {
         // 🟢 CREATE
         if (modalMode === "create") {
           await createTransportMutation.mutateAsync(purchaseData, {
             onSuccess: () => {
               toast.success("Transport created successfully");
               handleCancel();
             },
             onError: err => toast.error(err?.message || "Failed to create transport")
           });
 
           return; // stop execution after create
         }
 
         // 🔵 EDIT
         if (modalMode === "edit") {
           if (!activeTransport?.id) {
             toast.error("Cannot save: missing transport context");
             return;
           }

           await updateTransportMutation.mutateAsync(
             { id: activeTransport.id, data: purchaseData },
             {
               onSuccess: () => {
                 toast.success("Transport updated successfully");
                 handleCancel();
               },
               onError: err => toast.error(err?.message || "Failed to update transport")
             }
           );
 
           return;
         }
       } catch (error) {
         toast.error(error?.message || "Something went wrong");
       }
     },
     [modalMode, activeTransport, createTransportMutation,updateTransportMutation, handleCancel]
   );

  const handleDelete = useCallback(() => {
    if (!selectedRows?.length) {
      toast.error("No transports selected");
      return;
    }

    openDialog({
      title: "Delete Selected Transports",
      message: `Are you sure you want to delete ${selectedRows.length} transport(s)?`,
      onConfirm: async () => {
        try {
          // Use Promise.allSettled to handle each delete safely
          const results = await Promise.allSettled(
            selectedRows.map(t => deleteTransportMutation.mutateAsync(t.id))
          );

          const successCount = results.filter(r => r.status === "fulfilled").length;
          const failedCount = results.length - successCount;

          if (successCount > 0) {
            toast.success(`${successCount} transport(s) deleted successfully`);
            handleSelectionChange([]);
            refetch();
          }

          if (failedCount > 0) {
            toast.error(`${failedCount} transport(s) failed to delete`);
          }
        } catch (err) {
          toast.error(err?.message || "Unexpected error during deletion");
        }
      }
    });
  }, [selectedRows, deleteTransportMutation, openDialog, handleSelectionChange, refetch]);

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
        searchPlaceholder="Search transports, parties, drivers..."
        className="sticky top-0 z-10 bg-inherit"
      />

      <TransportsSummaryStats stats={transportsData?.stats} />

      <ActionRibbon
        resourceName="Transport"
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
        data={transports}
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
        <TransportModal
          initialData={modalMode === "edit" || modalMode === "view" ? activeTransport : null}
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

Transports.displayName = "Transports";

export default Transports;