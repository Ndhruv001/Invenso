// src/hooks/useTableControls.js
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { filtersToParams } from "@/lib/helpers/filtersToParams";

/**
 * Generic Table Controls Hook
 * - Syncs filters, pagination, and sorting with URL
 * - Manages row selection and keyboard shortcuts
 *
 * @param {Object} options
 * @param {string[]} options.FILTER_KEYS - keys to read from URL
 * @param {string} [options.defaultSortBy='createdAt']
 * @param {string} [options.resourceName] - optional for debugging/logging
 */
function useTableControls({
  FILTER_KEYS = [],
  defaultSortBy = "createdAt",
  resourceName = "Resource"
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  /* ------------------ 1️⃣ FILTERS STATE ------------------ */
  const [filters, setFilters] = useState(() => {
    const filterOptions = {};
    FILTER_KEYS.forEach(key => {
      const val = searchParams.get(key);
      if (val) filterOptions[key] = val;
    });
    return {
      search: searchParams.get("search") || "",
      filterOptions,
      sortBy: searchParams.get("sortBy") || defaultSortBy,
      sortOrder: searchParams.get("sortOrder") || "desc",
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 20
    };
  });

  // Sync state → URL
  useEffect(() => {
    const params = filtersToParams(filters);
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  /* ------------------ 2️⃣ SELECTION STATE ------------------ */
  const [showSelection, setShowSelection] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  // Clear selection whenever filters change (data changes)
  useEffect(() => setSelectedRows([]), [filters]);

  // Keyboard shortcut: Alt + S to toggle selection mode
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.altKey && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        setShowSelection(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* ------------------ 3️⃣ TABLE STATE (derived) ------------------ */
  const pagination = useMemo(
    () => ({ pageIndex: filters.page - 1, pageSize: filters.limit }),
    [filters.page, filters.limit]
  );

  const sorting = useMemo(
    () => [{ id: filters.sortBy, desc: filters.sortOrder === "desc" }],
    [filters.sortBy, filters.sortOrder]
  );

  /* ------------------ 4️⃣ HANDLERS ------------------ */
  const handleFiltersChange = useCallback(updates => {
    setFilters(prev => ({
      ...prev,
      ...updates,
      page: 1 // reset to first page
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(prev => ({
      search: "",
      filterOptions: {},
      sortBy: defaultSortBy,
      sortOrder: "desc",
      page: 1,
      limit: prev.limit // keep current limit
    }));
  }, [defaultSortBy]);

  const handlePaginationChange = useCallback(
    updater => {
      const next = typeof updater === "function" ? updater(pagination) : updater;
      setFilters(prev => ({
        ...prev,
        page: next.pageIndex + 1,
        limit: next.pageSize
      }));
    },
    [pagination]
  );

  const handleSortingChange = useCallback(
    updater => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      if (next.length > 0) {
        const { id, desc } = next[0];
        setFilters(prev => ({
          ...prev,
          sortBy: id,
          sortOrder: desc ? "desc" : "asc",
          page: 1
        }));
      }
    },
    [sorting]
  );

  const handleSelectionChange = useCallback(({ selectedRows }) => {
    setSelectedRows(selectedRows);
  }, []);

  /* ------------------ 5️⃣ RETURN STRUCTURE ------------------ */
  return {
    filters,
    selection: {
      showSelection,
      setShowSelection,
      selectedRows,
      handleSelectionChange
    },
    tableState: { pagination, sorting },
    handlers: {
      handleFiltersChange,
      handleClearFilters,
      handlePaginationChange,
      handleSortingChange
    }
  };
}

export default useTableControls;
export { useTableControls };
