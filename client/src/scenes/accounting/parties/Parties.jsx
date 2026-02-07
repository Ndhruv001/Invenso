import React, { useState, useMemo, useCallback } from "react";
import { toast } from "react-toastify";

import { useParties, useUpdateParty, useDeleteParty } from "@/hooks/useParties";
import { useTableControls } from "@/hooks/useTableControls";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import { useTheme } from "@/hooks/useTheme";
import { usePartyFilterOptions } from "@/hooks/usePartyFilterOptions";

import Columns from "./Columns";
import PartyModal from "./PartyModal";
import PartiesSummaryStats from "./PartiesSummaryStats";
import ActionRibbon from "@/components/common/ActionRibbon";
import DataTable from "@/components/common/DataTable";
import DataFilter from "@/components/common/DataFilter";
import ConfirmationModal from "@/components/common/ConfirmationModal";

const FILTER_KEYS = ["partyType", "balanceType"];

/**
 * Normalize a party for modal use.
 */
function normalizePartyForModal(party) {
  if (!party) return null;
  return {
    id: party.id ?? undefined,
    name: party.name ?? "",
    ...party
  };
}

const Parties = () => {
  const { theme } = useTheme();

  // Unified table controls (filters, pagination, sorting, selection)
  const { filters, selection, tableState, handlers } = useTableControls({
    FILTER_KEYS,
    resourceName: "Party"
  });

  const { showSelection, setShowSelection, selectedRows, handleSelectionChange } = selection;
  const { pagination, sorting } = tableState;
  const { handleFiltersChange, handleClearFilters, handlePaginationChange, handleSortingChange } =
    handlers;

  // Modal state
  const [activeParty, setActiveParty] = useState(null);
  const [modalMode, setModalMode] = useState(null); // "view" | "edit" | "create"

  // Confirmation dialog hook
  const { dialogConfig, openDialog, closeDialog } = useConfirmationDialog();

  // Party data
  const { data: partiesData, refetch, ...queryStatus } = useParties(filters);
  const parties = partiesData?.data ?? [];
  const totalRows = partiesData?.pagination?.totalRows ?? 0;

  // Mutations
  const updatePartyMutation = useUpdateParty();
  const deletePartyMutation = useDeleteParty();

  // Filter options
  const filterOptions = usePartyFilterOptions();

  /** ---- Handlers ---- **/

  const openModalWith = useCallback((party, mode) => {
    setActiveParty(normalizePartyForModal(party));
    setModalMode(mode);
  }, []);

  const handleView = useCallback(
    party => {
      if (!party?.id) return toast.error("Unable to view: missing party info");
      openModalWith(party, "view");
    },
    [openModalWith]
  );

  const handleEdit = useCallback(
    party => {
      if (!party?.id) return toast.error("Unable to edit: missing party info");
      openModalWith(party, "edit");
    },
    [openModalWith]
  );

  const handleCancel = useCallback(() => {
    setActiveParty(null);
    setModalMode(null);
  }, []);

  const handleSubmit = useCallback(
    async partyData => {
      if (!activeParty?.id) {
        toast.error("Cannot save: missing party context");
        return;
      }

      await updatePartyMutation.mutateAsync(
        { id: activeParty.id, data: partyData },
        {
          onSuccess: () => {
            toast.success("Party updated successfully");
            handleCancel();
          },
          onError: err => toast.error(err?.message || "Failed to update party")
        }
      );
    },
    [activeParty, updatePartyMutation, handleCancel]
  );

  const handleDelete = useCallback(() => {
    if (!selectedRows?.length) {
      toast.error("No parties selected");
      return;
    }

    openDialog({
      title: "Delete Selected Parties",
      message: `Are you sure you want to delete ${selectedRows.length} party(s)?`,
      onConfirm: async () => {
        try {
          const results = await Promise.allSettled(
            selectedRows.map(p => deletePartyMutation.mutateAsync(p.id))
          );

          const successCount = results.filter(r => r.status === "fulfilled").length;
          const failedCount = results.length - successCount;

          if (successCount > 0) {
            toast.success(`${successCount} party(s) deleted successfully`);
            handleSelectionChange([]);
            refetch();
          }

          if (failedCount > 0) {
            toast.error(`${failedCount} party(s) failed to delete`);
          }
        } catch (err) {
          toast.error(err?.message || "Unexpected error during deletion");
        }
      }
    });
  }, [selectedRows, deletePartyMutation, openDialog, handleSelectionChange, refetch]);

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
        searchPlaceholder="Search party name, city, type..."
        className="sticky top-0 z-10 bg-inherit"
      />

      <PartiesSummaryStats stats={partiesData?.stats} />

      <ActionRibbon
        resourceName="Party"
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
        data={parties}
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

      {activeParty && (
        <PartyModal
          initialData={activeParty}
          isViewOnly={modalMode === "view"}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      )}

      {dialogConfig.isOpen && <ConfirmationModal {...dialogConfig} onCancel={closeDialog} />}
    </div>
  );
};

Parties.displayName = "Parties";

export default Parties;
