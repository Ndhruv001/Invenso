import React, { useState, useMemo, useCallback } from "react";
import { toast } from "react-toastify";

import {
  useExpenses,
  useUpdateExpense,
  useDeleteExpense,
} from "@/hooks/useExpenses";
import { useTableControls } from "@/hooks/useTableControls";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import { useTheme } from "@/hooks/useTheme";
import { useExpenseFilterOptions } from "@/hooks/useExpenseFilterOptions";

import ExpenseColumns from "./Columns";
import ExpenseModal from "./ExpenseModal";
import ExpensesSummaryStats from "./ExpensesSummaryStats";
import ActionRibbon from "@/components/common/ActionRibbon";
import DataTable from "@/components/common/DataTable";
import DataFilter from "@/components/common/DataFilter";
import ConfirmationModal from "@/components/common/ConfirmationModal";

// Filters synced with URL state
const FILTER_KEYS = ["categoryId", "dateFrom", "dateTo"];

/**
 * Normalize an expense for modal use.
 * Prevents runtime issues when opening view/edit forms with incomplete data.
 */
function normalizeExpenseForModal(expense) {
  if (!expense) return null;
  return {
    id: expense.id ?? undefined,
    amount: expense.amount ?? "",
    ...expense,
  };
}

const Expenses = () => {
  const { theme } = useTheme();

  // Table controls: filters, selection, pagination, sorting
  const { filters, selection, tableState, handlers } = useTableControls({
    FILTER_KEYS,
    resourceName: "Expense",
  });

  const { showSelection, setShowSelection, selectedRows, handleSelectionChange } = selection;
  const { pagination, sorting } = tableState;
  const { handleFiltersChange, handleClearFilters, handlePaginationChange, handleSortingChange } =
    handlers;

  // Modal state
  const [activeExpense, setActiveExpense] = useState(null);
  const [modalMode, setModalMode] = useState(null); // "view" | "edit" | "create"

  // Confirmation dialog hook
  const { dialogConfig, openDialog, closeDialog } = useConfirmationDialog();

  // Query: Expense list
  const { data: expensesData, refetch, ...queryStatus } = useExpenses(filters);
  console.log("🚀 ~ Expenses ~ expensesData:", expensesData)
  const expenses = expensesData?.data ?? [];
  const totalRows = expensesData?.pagination?.totalRows ?? 0;

  // Mutations
  const updateExpenseMutation = useUpdateExpense();
  const deleteExpenseMutation = useDeleteExpense();

  // Filter options
  const filterOptions = useExpenseFilterOptions();

  /** ---- Handlers ---- **/

  const openModalWith = useCallback((expense, mode) => {
    setActiveExpense(normalizeExpenseForModal(expense));
    setModalMode(mode);
  }, []);

  const handleView = useCallback(
    (expense) => {
      if (!expense?.id) return toast.error("Unable to view: missing expense info");
      openModalWith(expense, "view");
    },
    [openModalWith]
  );

  const handleEdit = useCallback(
    (expense) => {
      if (!expense?.id) return toast.error("Unable to edit: missing expense info");
      openModalWith(expense, "edit");
    },
    [openModalWith]
  );

  const handleCancel = useCallback(() => {
    setActiveExpense(null);
    setModalMode(null);
  }, []);

  const handleSubmit = useCallback(
    async (expenseData) => {
      if (!activeExpense?.id) {
        toast.error("Cannot save: missing expense context");
        return;
      }

      await updateExpenseMutation.mutateAsync(
        { id: activeExpense.id, data: expenseData },
        {
          onSuccess: () => {
            toast.success("Expense updated successfully");
            handleCancel();
          },
          onError: (err) => toast.error(err?.message || "Failed to update expense"),
        }
      );
    },
    [activeExpense, updateExpenseMutation, handleCancel]
  );

  const handleDelete = useCallback(() => {
    if (!selectedRows?.length) {
      toast.error("No expenses selected");
      return;
    }

    openDialog({
      title: "Delete Selected Expenses",
      message: `Are you sure you want to delete ${selectedRows.length} expense(s)?`,
      onConfirm: async () => {
        try {
          const results = await Promise.allSettled(
            selectedRows.map((e) => deleteExpenseMutation.mutateAsync(e.id))
          );

          const successCount = results.filter((r) => r.status === "fulfilled").length;
          const failedCount = results.length - successCount;

          if (successCount > 0) {
            toast.success(`${successCount} expense(s) deleted successfully`);
            handleSelectionChange([]);
            refetch();
          }

          if (failedCount > 0) {
            toast.error(`${failedCount} expense(s) failed to delete`);
          }
        } catch (err) {
          toast.error(err?.message || "Unexpected error during deletion");
        }
      },
    });
  }, [selectedRows, deleteExpenseMutation, openDialog, handleSelectionChange, refetch]);

  // Memoized column definitions
  const columns = useMemo(() => ExpenseColumns(showSelection), [showSelection]);

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
        searchPlaceholder="Search expense remarks, references, or categories..."
        className="sticky top-0 z-10 bg-inherit"
      />

      <ExpensesSummaryStats stats={expensesData?.stats} />

      <ActionRibbon
        resourceName="Expense"
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
        data={expenses}
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

      {activeExpense && (
        <ExpenseModal
          initialData={activeExpense}
          isViewOnly={modalMode === "view"}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      )}

      {dialogConfig.isOpen && <ConfirmationModal {...dialogConfig} onCancel={closeDialog} />}
    </div>
  );
};

Expenses.displayName = "Expenses";

export default Expenses;
