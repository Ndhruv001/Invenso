import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Filter, X, ChevronDown } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import CustomDropdown from "./CustomDropdown";
import { debounce } from "@/lib/helpers/debounce";
import { usePartySuggestions } from "@/hooks/useParties";

// ─────────────────────────────────────────────
// Sub-components (same as DataFilter)
// ─────────────────────────────────────────────
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
      max={new Date().toISOString().split("T")[0]}
      placeholder={option.placeholder || "Select date"}
      value={value || ""}
      onChange={e => onChange(option.key, e.target.value)}
      className={`w-full rounded-lg border px-3 py-2.5 text-sm transition-colors duration-200 
        ${theme.card} ${theme.border} ${theme.text.primary} 
        focus:outline-none focus:ring-1 focus:${theme.border}`}
      aria-label={option.label}
    />
  </div>
));

const PartySearchFilter = React.memo(({ theme, option, value, onChange }) => {
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data: partySuggestionsData } = usePartySuggestions(searchQuery);

  const debouncedSearch = useMemo(
    () =>
      debounce(val => {
        if (!val) {
          setSuggestions([]);
          setShowSuggestions(false);
          return;
        }
        setSearchQuery(val);
        setShowSuggestions(true);
      }, 600),
    []
  );

  useEffect(() => {
    if (partySuggestionsData) {
      setSuggestions(partySuggestionsData);
    }
  }, [partySuggestionsData]);

  return (
    <div className="space-y-2 w-full min-w-0 relative">
      <label className={`block text-sm font-medium ${theme.text.primary}`}>{option.label}</label>

      <input
        type="text"
        placeholder={option.placeholder || "Search party..."}
        value={inputValue}
        onChange={e => {
          const val = e.target.value;
          setInputValue(val);
          onChange(option.key, ""); // reset partyId
          debouncedSearch(val);
        }}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm ${theme.card} ${theme.border} ${theme.text.primary}`}
      />

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow max-h-60 overflow-auto">
          {suggestions.map(party => (
            <li
              key={party.id}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
              onClick={() => {
                setInputValue(party.name);
                onChange(option.key, party.id); // store ID only
                setShowSuggestions(false);
              }}
            >
              {party.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

const FILTER_TYPE_MAP = {
  select: SelectFilter,
  input: InputFilter,
  date: DateFilter,
  partySearch: PartySearchFilter
};

// ─────────────────────────────────────────────
// Module Dropdown
// ─────────────────────────────────────────────
const ModuleDropdown = React.memo(({ theme, moduleOptions, selectedModule, onChange }) => (
  <div className="space-y-2 w-full min-w-0 max-w-xs">
    <div className="relative">
      <select
        value={selectedModule}
        onChange={e => onChange(e.target.value)}
        className={`
          w-full appearance-none rounded-lg border px-3 py-2.5 pr-9 text-sm font-medium
          transition-colors duration-200 cursor-pointer
          ${theme.card} ${theme.border} ${theme.text.primary}
          focus:outline-none focus:ring-1 focus:${theme.border}
        `}
        aria-label="Select report module"
      >
        <option value="" disabled>
          — Select module —
        </option>
        {moduleOptions.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {/* Custom chevron so it respects theme */}
      <ChevronDown
        className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 ${theme.text.primary} opacity-60`}
      />
    </div>
  </div>
));

// ─────────────────────────────────────────────
// ReportDataFilter — main export
// ─────────────────────────────────────────────
const ReportDataFilter = ({
  // Module props
  moduleOptions = [], // [{ value, label }]
  selectedModule = "",
  onModuleChange, // (moduleValue) => void

  // Filter props (controlled by parent)
  filters = {}, // { filterOptions: { key: value } }
  filterOptions = [], // driven by selected module
  onFiltersChange,
  onClearFilters,

  // Misc
  totalRows = 0,
  showTotalRows = true,
  className = "",
  collapsible = true,
  defaultExpanded = false
}) => {
  const { theme } = useTheme();
  const [isFilterExpanded, setIsFilterExpanded] = useState(defaultExpanded);

  // ── Active filter calculation ──────────────────────────────
  const activeFilters = useMemo(() => {
    const active = {};
    for (const [key, value] of Object.entries(filters.filterOptions ?? {})) {
      if (value && value.toString().trim() !== "") {
        active[key] = value;
      }
    }
    return active;
  }, [filters.filterOptions]);

  const activeFilterCount = Object.keys(activeFilters).length;
  const hasActiveFilters = activeFilterCount > 0;

  // ── Handlers ──────────────────────────────────────────────
  const handleFilterChange = useCallback(
    (key, value) => {
      onFiltersChange?.({ filterOptions: { ...filters.filterOptions, [key]: value || "" } });
    },
    [filters.filterOptions, onFiltersChange]
  );

  const handleClearSpecificFilter = useCallback(
    key => handleFilterChange(key, ""),
    [handleFilterChange]
  );

  const toggleFilterPanel = useCallback(() => setIsFilterExpanded(e => !e), []);

  // ── Grid cols ──────────────────────────────────────────────
  const getGridCols = useMemo(() => {
    const count = filterOptions.length;
    if (count <= 2) return "grid-cols-1 md:grid-cols-2";
    if (count <= 3) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    if (count <= 4) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";
  }, [filterOptions.length]);

  // ── Render individual filter ───────────────────────────────
  const renderFilter = useCallback(
    option => {
      const Component = FILTER_TYPE_MAP[option.type];
      if (!Component) return null;
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

  // ──────────────────────────────────────────────────────────
  return (
    <div
      className={`mb-6 rounded-xl border shadow-sm ${theme.card} ${theme.border} ${className} max-w-full`}
      style={{ position: "relative", zIndex: "auto" }}
    >
      {/* ── Header row: Module dropdown + controls ── */}
      <div className="p-4 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          {/* Left — Module selector */}
          <ModuleDropdown
            theme={theme}
            moduleOptions={moduleOptions}
            selectedModule={selectedModule}
            onChange={onModuleChange}
          />

          {/* Right — total rows + filter toggle + clear */}
          <div className="flex flex-wrap items-center gap-3 justify-start lg:justify-end">
            {showTotalRows && selectedModule && (
              <span
                className={`text-sm font-medium ${theme.text.primary} opacity-70 whitespace-nowrap flex-shrink-0`}
              >
                {totalRows.toLocaleString()} results
              </span>
            )}

            {collapsible && filterOptions.length > 0 && (
              <button
                onClick={toggleFilterPanel}
                className={`relative flex items-center gap-2 cursor-pointer rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-300 ease-in-out
                  ${theme.card} ${theme.border} ${theme.text.primary} ${theme.hover}
                  ${isFilterExpanded ? `ring-1 ${theme.border} ring-opacity-50` : ""}
                  whitespace-nowrap flex-shrink-0`}
                aria-expanded={isFilterExpanded}
                aria-controls="report-filter-panel"
              >
                <Filter className="h-4 w-4 flex-shrink-0" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span
                    className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r ${theme.accentFrom} ${theme.accentTo} text-xs font-bold text-white shadow-sm`}
                    style={{ animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}
                    aria-live="polite"
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
                onClick={onClearFilters}
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

      {/* ── Expandable filter panel ── */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          isFilterExpanded ? "max-h-[1000px]" : "max-h-0 overflow-hidden"
        }`}
        id="report-filter-panel"
      >
        {filterOptions.length > 0 && (
          <div className={`border-t p-4 ${theme.border}`}>
            <div className={`grid gap-4 ${getGridCols}`}>{filterOptions.map(renderFilter)}</div>

            {/* Active filter chips */}
            {hasActiveFilters && (
              <section className="mt-6 pt-4 border-t border-gray-200" aria-label="Active filters">
                <h4 className={`text-sm font-medium mb-3 ${theme.text.primary}`}>
                  Active Filters ({activeFilterCount})
                </h4>
                <div className="flex flex-wrap gap-2 max-w-full overflow-x-auto">
                  {Object.entries(activeFilters).map(([key, value]) => {
                    const option = filterOptions.find(opt => opt.key === key);
                    const displayValue =
                      option?.options?.find(opt => opt.value === value)?.label ?? value;
                    return (
                      <span
                        key={key}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all duration-200 bg-gradient-to-r ${theme.accent} text-white shadow-sm flex-shrink-0`}
                      >
                        <span className="opacity-80 truncate">{option?.label ?? key}:</span>
                        <span className="font-semibold truncate max-w-24">{displayValue}</span>
                        <button
                          onClick={() => handleClearSpecificFilter(key)}
                          className="ml-1 p-0.5 rounded-full transition-all duration-200 cursor-pointer hover:bg-red-300 hover:bg-opacity-20 flex-shrink-0"
                          aria-label={`Remove ${option?.label ?? key} filter`}
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

export default ReportDataFilter;
