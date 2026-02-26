import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Filter, X, ChevronDown } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useDebounce } from "@/hooks/useDebounce";
import SearchBar from "@/components/common/SearchBar";
import CustomDropdown from "./CustomDropdown";

// --- Sub-Components for Rendering Filters ---
// These are defined outside the main component to prevent re-creation on every render.
const InputFilter = React.memo(({ theme, option, value, onChange }) => (
  <div className="space-y-2 w-full min-w-0">
    <label className={`block text-sm font-medium ${theme.text.primary}`}>{option.label}</label>
    <input
      type={option.inputType || "text"}
      placeholder={option.placeholder}
      value={value}
      onChange={e => onChange(option.key, e.target.value)}
      className={`w-full rounded-lg border px-3 py-2.5 text-sm transition-colors duration-200 ${theme.card} ${theme.border} ${theme.text.primary} focus:outline-none focus:ring-1 focus:${theme.border}`}
      aria-label={option.label}
    />
  </div>
));

const SelectFilter = React.memo(({ theme, option, value, onChange }) => (
  <div className="space-y-2 w-full min-w-0">
    <label
      id={`dropdown-${option.key}-label`}
      className={`block text-sm font-medium ${theme.text.primary}`}
    >
      {option.label}
    </label>
    <CustomDropdown option={option} value={value} onChange={v => onChange(option.key, v)} />
  </div>
));

const DateFilter = React.memo(({ theme, option, value, onChange }) => (
  <div className="space-y-2 w-full min-w-0">
    <label
      className={`block text-sm font-medium ${theme.text.primary}`}
      id={`date-${option.key}-label`}
    >
      {option.label}
    </label>

    <input
      type="date"
      max={new Date().toISOString().split("T")[0]} //` Prevent future dates
      placeholder={option.placeholder || "Select date"}
      value={value || ""} // Changed from value[option.key]
      onChange={e => onChange(option.key, e.target.value)}
      className={`w-full rounded-lg border px-3 py-2.5 text-sm transition-colors duration-200 
        ${theme.card} ${theme.border} ${theme.text.primary} 
        focus:outline-none focus:ring-1 focus:${theme.border}`}
      aria-label={option.label}
    />
  </div>
));

// This map makes the component declarative and easily extensible.
const FILTER_TYPE_MAP = {
  select: SelectFilter,
  input: InputFilter,
  date: DateFilter
};

// --- Main DataFilter Component ---
const DataFilter = ({
  filters = {},
  filterOptions = [],
  onFiltersChange,
  onClearFilters,
  totalRows = 0,
  searchPlaceholder = "Search here...",
  showSearch = true,
  showTotalRows = true,
  className = "",
  collapsible = true,
  defaultExpanded = false,
  delay = 800
}) => {
  const { theme } = useTheme();
  const [isFilterExpanded, setIsFilterExpanded] = useState(defaultExpanded);
  const [localSearch, setLocalSearch] = useState(filters?.search || "");
  const debouncedSearch = useDebounce(localSearch, delay);

  // Sync debounced local search changes to the parent component
  useEffect(() => {
    // Don't sync if local is empty but debounced isn't (we're in the middle of clearing)
    if (
      debouncedSearch !== (filters.search || "") &&
      !(localSearch === "" && debouncedSearch !== "")
    ) {
      onFiltersChange?.({ search: debouncedSearch });
    }
  }, [debouncedSearch, onFiltersChange, filters.search, localSearch]);

  useEffect(() => {
    if (filters.search === "") {
      setLocalSearch("");
    }
  }, [filters.search]);

  // Memoized calculation of all active filters for display purposes
  const activeFilters = useMemo(() => {
    const active = {};
    const allFilters = { ...filters.filterOptions, search: filters.search };
    for (const [key, value] of Object.entries(allFilters)) {
      if (value && value.toString().trim() !== "") {
        active[key] = value;
      }
    }
    return active;
  }, [filters]);

  const activeFilterCount = Object.keys(activeFilters).length;
  const hasActiveFilters = activeFilterCount > 0;

  // --- Handlers ---
  const handleLocalSearchChange = useCallback(e => setLocalSearch(e.target.value), []);
  const clearSearch = useCallback(() => {
    setLocalSearch("");
    onFiltersChange?.({ search: "" });
  }, [onFiltersChange]);

  const handleFilterChange = useCallback(
    (key, value) => {
      onFiltersChange?.({ filterOptions: { ...filters.filterOptions, [key]: value || "" } });
    },
    [filters.filterOptions, onFiltersChange]
  );

  const handleClearSpecificFilter = useCallback(
    key => {
      if (key === "search") {
        clearSearch();
      } else {
        handleFilterChange(key, "");
      }
    },
    [clearSearch, handleFilterChange]
  );

  const toggleFilterPanel = useCallback(() => setIsFilterExpanded(e => !e), []);

  // --- Dynamic Calculations for Rendering ---
  const getGridCols = useMemo(() => {
    const count = filterOptions.length;
    if (count <= 2) return "grid-cols-1 md:grid-cols-2";
    if (count <= 3) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    if (count <= 4) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";
  }, [filterOptions.length]);

  const renderFilter = useCallback(
    option => {
      const Component = FILTER_TYPE_MAP[option.type];
      if (!Component) return null;

      // Consistent value extraction for all filter types
      const value = filters.filterOptions?.[option.key] || "";

      return (
        <Component
          key={option.key}
          theme={theme}
          option={option}
          value={value}
          onChange={handleFilterChange}
        />
      );
    },
    [filters.filterOptions, handleFilterChange, theme]
  );

  return (
    <div
      className={` mb-6 rounded-xl border shadow-sm ${theme.card} ${theme.border} ${className} max-w-full`}
      style={{ position: "relative", zIndex: "auto" }}
    >
      {/* Header */}
      <div className="p-4 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {showSearch && (
            <div className="flex-1 max-w-md lg:max-w-sm min-w-0">
              <SearchBar
                value={localSearch}
                onChange={handleLocalSearchChange}
                onClear={clearSearch}
                placeholder={searchPlaceholder}
              />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3 justify-start lg:justify-end">
            {showTotalRows && (
              <span
                className={`text-sm font-medium ${theme.text.primary} opacity-70 whitespace-nowrap flex-shrink-0`}
              >
                {totalRows.toLocaleString()} results
              </span>
            )}
            {collapsible && filterOptions.length > 0 && (
              <button
                onClick={toggleFilterPanel}
                className={`relative flex items-center gap-2 cursor-pointer rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-300 ease-in-out ${theme.card} ${theme.border} ${theme.text.primary} ${theme.hover} ${isFilterExpanded ? `ring-1 ${theme.border} ring-opacity-50` : ""} whitespace-nowrap flex-shrink-0`}
                aria-expanded={isFilterExpanded}
                aria-controls="filter-panel"
                aria-label="Toggle filter panel"
              >
                <Filter className="h-4 w-4 flex-shrink-0" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span
                    className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r ${theme.accentFrom} ${theme.accentTo} text-xs font-bold text-white shadow-sm transition-all duration-500 ease-in-out animate-bounce`}
                    style={{ animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-500 ease-in-out flex-shrink-0 ${isFilterExpanded ? "rotate-180" : ""}`}
                />
              </button>
            )}
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setLocalSearch("");
                  onClearFilters?.();
                }}
                className="flex items-center gap-2 cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-200 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 whitespace-nowrap flex-shrink-0"
                aria-label="Clear all filters"
              >
                <X className="h-4 w-4 flex-shrink-0" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expandable filter panel */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${isFilterExpanded ? "max-h-[500px]" : "max-h-0"}`}
        id="filter-panel"
      >
        {filterOptions.length > 0 && (
          <div className={`border-t p-4 ${theme.border}`}>
            <div className={`grid gap-4 ${getGridCols}`}>{filterOptions.map(renderFilter)}</div>
            {hasActiveFilters && (
              <section className="mt-6 pt-4 border-t border-gray-200" aria-label="Active filters">
                <h4 className={`text-sm font-medium mb-3 ${theme.text.primary}`}>
                  Active Filters ({activeFilterCount})
                </h4>
                <div className="flex flex-wrap gap-2 max-w-full overflow-x-auto">
                  {Object.entries(activeFilters).map(([key, value]) => {
                    const option = filterOptions.find(opt => opt.key === key);
                    let displayValue = value;
                    if (key === "search") displayValue = `"${value}"`;
                    else if (option?.options)
                      displayValue =
                        option.options.find(opt => opt.value === value)?.label || value;
                    return (
                      <span
                        key={key}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all duration-200 bg-gradient-to-r ${theme.accent} text-white shadow-sm flex-shrink-0`}
                      >
                        <span className="opacity-80 truncate">
                          {option?.label || (key === "search" ? "Search" : key)}:
                        </span>
                        <span className="font-semibold truncate max-w-24">{displayValue}</span>
                        <button
                          onClick={() => handleClearSpecificFilter(key)}
                          className="ml-1 p-0.5 rounded-full transition-all duration-200 cursor-pointer hover:bg-red-300 hover:bg-opacity-20 flex-shrink-0"
                          aria-label={`Remove ${option?.label || key} filter`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataFilter;
