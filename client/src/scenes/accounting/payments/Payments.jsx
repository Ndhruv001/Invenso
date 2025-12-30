import React, { useState, useMemo, useCallback } from "react";
import { toast } from "react-toastify";

import {
  usePayments,
  useUpdatePayment,
  useDeletePayment,
} from "@/hooks/usePayments";

import { useTableControls } from "@/hooks/useTableControls";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import { useTheme } from "@/hooks/useTheme";
import { usePaymentFilterOptions } from "@/hooks/usePaymentFilterOptions";

import Columns from "./Columns";
import PaymentModal from "./PaymentModal";
import PaymentsSummaryStats from "./PaymentsSummaryStats";
import ActionRibbon from "@/components/common/ActionRibbon";
import DataTable from "@/components/common/DataTable";
import DataFilter from "@/components/common/DataFilter";
import ConfirmationModal from "@/components/common/ConfirmationModal";

// Filters synced with URL state
const FILTER_KEYS = ["type", "dateFrom", "dateTo"];

/**
 * Normalize a payment record for modal use.
 */
function normalizePaymentForModal(payment) {
  if (!payment) return null;
  return {
    id: payment.id ?? undefined,
    amount: payment.amount ?? 0,
    ...payment,
  };
}

const Payments = () => {
  const { theme } = useTheme();

  // Unified table controls
  const { filters, selection, tableState, handlers } = useTableControls({
    FILTER_KEYS,
    resourceName: "Payment",
  });

  const { showSelection, setShowSelection, selectedRows, handleSelectionChange } = selection;
  const { pagination, sorting } = tableState;
  const { handleFiltersChange, handleClearFilters, handlePaginationChange, handleSortingChange } =
    handlers;

  // Modal management
  const [activePayment, setActivePayment] = useState(null);
  const [modalMode, setModalMode] = useState(null); // view | edit | create

  // Confirmation dialog
  const { dialogConfig, openDialog, closeDialog } = useConfirmationDialog();

  // Query: Payments list
  const { data: paymentsData, refetch, ...queryStatus } = usePayments(filters);
  const payments = paymentsData?.data ?? [];
  const totalRows = paymentsData?.pagination?.totalRows ?? 0;

  // Mutations
  const updatePaymentMutation = useUpdatePayment();
  const deletePaymentMutation = useDeletePayment();

  // Filter options
  const filterOptions = usePaymentFilterOptions();

  /** ---- Handlers ---- **/

  const openModalWith = useCallback((payment, mode) => {
    setActivePayment(normalizePaymentForModal(payment));
    setModalMode(mode);
  }, []);

  const handleView = useCallback(
    (payment) => {
      if (!payment?.id) return toast.error("Unable to view: missing payment info");
      openModalWith(payment, "view");
    },
    [openModalWith]
  );

  const handleEdit = useCallback(
    (payment) => {
      if (!payment?.id) return toast.error("Unable to edit: missing payment info");
      openModalWith(payment, "edit");
    },
    [openModalWith]
  );

  const handleCancel = useCallback(() => {
    setActivePayment(null);
    setModalMode(null);
  }, []);

  const handleSubmit = useCallback(
    async (paymentData) => {
      if (!activePayment?.id) {
        toast.error("Cannot save: missing payment context");
        return;
      }

      await updatePaymentMutation.mutateAsync(
        { id: activePayment.id, data: paymentData },
        {
          onSuccess: () => {
            toast.success("Payment updated successfully");
            handleCancel();
          },
          onError: (err) => toast.error(err?.message || "Failed to update payment"),
        }
      );
    },
    [activePayment, updatePaymentMutation, handleCancel]
  );

  const handleDelete = useCallback(() => {
    if (!selectedRows?.length) {
      toast.error("No payments selected");
      return;
    }

    openDialog({
      title: "Delete Selected Payments",
      message: `Are you sure you want to delete ${selectedRows.length} payment(s)?`,
      onConfirm: async () => {
        try {
          const results = await Promise.allSettled(
            selectedRows.map((p) => deletePaymentMutation.mutateAsync(p.id))
          );

          const successCount = results.filter((r) => r.status === "fulfilled").length;
          const failedCount = results.length - successCount;

          if (successCount > 0) {
            toast.success(`${successCount} payment(s) deleted successfully`);
            handleSelectionChange([]);
            refetch();
          }

          if (failedCount > 0) {
            toast.error(`${failedCount} payment(s) failed to delete`);
          }
        } catch (err) {
          toast.error(err?.message || "Unexpected error during deletion");
        }
      },
    });
  }, [selectedRows, deletePaymentMutation, openDialog, handleSelectionChange, refetch]);

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
        searchPlaceholder="Search payments, party, or references..."
        className="sticky top-0 z-10 bg-inherit"
      />

      <PaymentsSummaryStats stats={paymentsData?.stats} />

      <ActionRibbon
        resourceName="Payment"
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
        data={payments}
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

      {activePayment && (
        <PaymentModal
          initialData={activePayment}
          isViewOnly={modalMode === "view"}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      )}

      {dialogConfig.isOpen && <ConfirmationModal {...dialogConfig} onCancel={closeDialog} />}
    </div>
  );
};

Payments.displayName = "Payments";

export default Payments;
