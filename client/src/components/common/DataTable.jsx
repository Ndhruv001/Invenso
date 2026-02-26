import React, { useState, useEffect } from "react";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";

import useTheme from "@/hooks/useTheme";
import DataErrorPage from "@/components/common/DataErrorPage";
import LoadingPage from "@/components/common/LoadingPage";
import NoDataPage from "@/components/common/NoDataPage";
import PageSizeDropdown from "@/components/common/PageSizeDropdown";

/* -----------------------------------------------------------------------------
 * DataTable Component
 *
 * A wrapper around TanStack React Table (v8) with the following features:
 * - Controlled pagination and sorting
 * - Optional row selection with Alt+S toggle
 * - Theme integration and responsive design
 * - Keyboard accessibility and interactive pagination
 * - Loading, error, and empty states
 *
 * Props:
 *  - data: Array of rows
 *  - columns: Column definitions (TanStack format)
 *  - error: Error object from query
 *  - refetch: Function to retry fetching data
 *  - isLoading, isError, isSuccess, isFetching: Query states
 *  - totalRows: Total rows for pagination
 *  - sorting, onSortingChange: Controlled sorting
 *  - pagination, onPaginationChange: Controlled pagination
 *  - manualPagination, manualSorting: Booleans for manual control
 *  - enableRowSelection, enableSorting: Feature toggles
 *  - maxHeight: Table container max height
 *  - tableClassName: Extra class for table wrapper
 *  - selectedRowClassName: CSS class for highlighting selected rows
 *  - showSelection: Show checkbox column initially
 *  - onSelectionChange: Callback for row selection
 *  - onRowDoubleClick: Callback for double-click on row
 * ---------------------------------------------------------------------------*/

const DataTable = ({
  data = [],
  columns,
  error,
  refetch,
  isLoading = false,
  isError = false,
  isSuccess = true,
  isFetching = false,
  totalRows = 0,

  sorting,
  onSortingChange,

  pagination,
  onPaginationChange,

  manualPagination = true,
  manualSorting = true,
  enableRowSelection = true,
  enableSorting = true,

  maxHeight = "calc(100vh - 210px)",
  showSelection = false,

  onSelectionChange,
  onRowDoubleClick
}) => {
  /* ---------------------------------------------------------------------------
   * Hooks and State
   * -------------------------------------------------------------------------*/
  const { theme } = useTheme();

  // Track selected rows
  const [rowSelection, setRowSelection] = useState({});

  // Control visibility of selection column (Alt+S toggles this)
  const [selectionVisible, setSelectionVisible] = useState(showSelection);

  // Total number of pages for controlled pagination
  const pageCount = Math.ceil(totalRows / (pagination.pageSize || 10));

  /* ---------------------------------------------------------------------------
   * Keyboard Shortcuts
   * -------------------------------------------------------------------------*/
  useEffect(() => {
    const onKeyDown = event => {
      if (event.altKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        setSelectionVisible(visible => !visible);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /* ---------------------------------------------------------------------------
   * Row Selection Handler
   * -------------------------------------------------------------------------*/
  const handleRowSelectionChange = updater => {
    const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;

    setRowSelection(newSelection);

    if (onSelectionChange) {
      const selectedRows = Object.entries(newSelection)
        .filter(([, selected]) => selected)
        .map(([index]) => data[parseInt(index, 10)]);

      onSelectionChange({
        selectedRows,
        selectedIndices: newSelection,
        count: selectedRows.length
      });
    }
  };

  /* ---------------------------------------------------------------------------
   * React Table Configuration
   * -------------------------------------------------------------------------*/
  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      pagination,
      sorting,
      rowSelection
    },
    onPaginationChange,
    onSortingChange,
    onRowSelectionChange: handleRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination,
    manualSorting,
    enableRowSelection,
    enableSorting
  });

  // Sorting icon for column headers
  const SortIcon = ({ column }) => {
    if (!column.getCanSort()) return null;
    const sorted = column.getIsSorted();
    if (sorted === "asc") return <ChevronUp className="h-4 w-4 flex-shrink-0" aria-hidden="true" />;
    if (sorted === "desc")
      return <ChevronDown className="h-4 w-4 flex-shrink-0" aria-hidden="true" />;
    return <ChevronsUpDown className="h-4 w-4 opacity-50 flex-shrink-0" aria-hidden="true" />;
  };

  // Render loading, error, no data states early
  if (isLoading) return <LoadingPage />;
  if (isError)
    return (
      <DataErrorPage errorMessage={error?.message} onRetry={refetch} isFetching={isFetching} />
    );
  if (isSuccess && totalRows === 0) return <NoDataPage />;

  // Pagination change handlers for buttons (first, prev, next, last)
  const goToFirstPage = () => onPaginationChange({ pageIndex: 0, pageSize: pagination.pageSize });
  const goToPrevPage = () =>
    onPaginationChange({
      pageIndex: Math.max(pagination.pageIndex - 1, 0),
      pageSize: pagination.pageSize
    });
  const goToNextPage = () =>
    onPaginationChange({
      pageIndex: Math.min(pagination.pageIndex + 1, pageCount - 1),
      pageSize: pagination.pageSize
    });
  const goToLastPage = () =>
    onPaginationChange({ pageIndex: pageCount - 1, pageSize: pagination.pageSize });

  return (
    <div
      className={`rounded-xl border shadow-sm ${theme.card} ${theme.border} max-w-full`}
      style={{ height: maxHeight }}
      role="region"
      aria-label="Data Table"
    >
      <div className="flex flex-col h-full min-h-0">
        {/* TABLE */}
        <div className="flex-1 min-h-0 overflow-auto" role="table" aria-rowcount={totalRows}>
          <table className="w-full min-w-max table-fixed border-collapse" role="grid">
            {/* HEADER */}
            <thead className={`${theme.border} ${theme.bg}  sticky top-0 z-20 shadow-md`}>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} role="row">
                  {headerGroup.headers.map(header => {
                    if (header.column.id === "select" && !selectionVisible) return null;

                    const ariaSort =
                      header.column.getIsSorted() === "asc"
                        ? "ascending"
                        : header.column.getIsSorted() === "desc"
                          ? "descending"
                          : "none";

                    return (
                      <th
                        key={header.id}
                        className={`px-5 py-3 text-center text-xs font-medium uppercase tracking-wider ${theme.text.secondary} ${theme.border}  whitespace-nowrap`}
                        style={{
                          minWidth: header.column.columnDef.minSize || 120,
                          width: header.getSize() !== 150 ? header.getSize() : "auto",
                          textAlign: header.column.columnDef.meta?.align || "center"
                        }}
                        role="columnheader"
                        aria-sort={ariaSort}
                        tabIndex={header.column.getCanSort() ? 0 : undefined}
                        onKeyDown={e => {
                          if (header.column.getCanSort() && (e.key === "Enter" || e.key === " ")) {
                            e.preventDefault();
                            header.column.getToggleSortingHandler()(e);
                          }
                        }}
                        onClick={
                          header.column.getCanSort()
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                      >
                        {!header.isPlaceholder && (
                          <div
                            className={`flex items-center gap-2 min-w-0 pb-1 pt-1 ${
                              header.column.getCanSort()
                                ? "cursor-pointer select-none transition-colors duration-200 hover:text-purple-600"
                                : ""
                            }`}
                          >
                            <span>
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </span>
                            <SortIcon column={header.column} />
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            {/* BODY */}
            <tbody className={`border-b ${theme.border}`}>
              {table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className={`transition-colors duration-150 ${theme.hover} border-b ${theme.border} cursor-pointer ${
                    row.getIsSelected() ? `${theme.bg}` : ""
                  }`}
                  onDoubleClick={() => onRowDoubleClick?.(row.original)}
                  title="Double-click to view details"
                  role="row"
                  aria-selected={row.getIsSelected()}
                >
                  {row.getVisibleCells().map((cell, idx) => {
                    if (cell.column.id === "select" && !selectionVisible) return null;

                    const header = table.getHeaderGroups()[0].headers[idx];

                    return (
                      <td
                        key={cell.id}
                        className={`px-4 py-4 text-sm ${theme.text.primary} ${theme.border} whitespace-nowrap`}
                        style={{
                          minWidth: header?.column.columnDef.minSize || 120,
                          width: header?.getSize() !== 150 ? header.getSize() : "auto",
                          textAlign: header?.column.columnDef.meta?.align || "left"
                        }}
                        role="gridcell"
                      >
                        <div className="min-w-0">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER - Pagination & Selection Info */}
        <div
          className={`flex flex-col items-center justify-end gap-4 border-t px-4 py-3 sm:flex-row ${theme.border}`}
        >
          {/* Selected rows count */}
          {selectionVisible && Object.keys(rowSelection).length > 0 && (
            <div
              className={`text-sm ${theme.text.secondary}`}
              aria-live="polite"
              aria-atomic="true"
            >
              {Object.values(rowSelection).filter(Boolean).length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected
            </div>
          )}

          {/* Pagination controls */}
          <nav className="flex items-center gap-2" aria-label="Table navigation">
            <span className={`mr-4 text-sm ${theme.text.secondary}`}>
              Page {pagination.pageIndex + 1} of {pageCount || 1}
            </span>

            <button
              onClick={goToFirstPage}
              disabled={pagination.pageIndex === 0}
              className={`rounded-lg p-2 transition-all cursor-pointer duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${theme.hover}`}
              title="Go to first page"
              aria-label="Go to first page"
            >
              <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              onClick={goToPrevPage}
              disabled={pagination.pageIndex === 0}
              className={`rounded-lg p-2 transition-all cursor-pointer duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${theme.hover}`}
              title="Go to previous page"
              aria-label="Go to previous page"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              onClick={goToNextPage}
              disabled={pagination.pageIndex >= pageCount - 1}
              className={`rounded-lg p-2 transition-all cursor-pointer duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${theme.hover}`}
              title="Go to next page"
              aria-label="Go to next page"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              onClick={goToLastPage}
              disabled={pagination.pageIndex >= pageCount - 1}
              className={`rounded-lg p-2 transition-all cursor-pointer duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${theme.hover}`}
              title="Go to last page"
              aria-label="Go to last page"
            >
              <ChevronsRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>

          {/* Page size selector */}
          <PageSizeDropdown pageSize={pagination.pageSize} onChange={onPaginationChange} />
        </div>
      </div>
    </div>
  );
};

export { DataTable };
export default DataTable;
