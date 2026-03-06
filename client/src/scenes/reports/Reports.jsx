// src/scenes/reports/Reports.jsx

import React, { useState, useCallback } from "react";
import { FolderOpen } from "lucide-react";

import { useDownloadPartyLedger } from "@/hooks/useReports";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import { toast } from "react-toastify";

import { useTheme } from "@/hooks/useTheme";
import { useTableControls } from "@/hooks/useTableControls";
import { useReports } from "@/hooks/useReports";

import ReportDataFilter from "@/components/common/ReportDataFilter";
import ActionRibbon from "@/components/common/ActionRibbon";
import DataTable from "@/components/common/DataTable";
import { MODULE_OPTIONS } from "@/constants/MODULE_OPTIONS";

// Module-specific imports
import PartyLedgerColumns from "./parties/Columns";
import PartyLedgerSummaryStats from "./parties/PartyLedgerSummaryStats";
// import TransportLedgerColumns from "./transport/Columns";
// import TransportLedgerSummaryStats from "./transport/TransportLedgerSummaryStats";

// ─────────────────────────────────────────────────────────────
// getModuleConfig
// Single place that defines everything per module.
// Switch makes it easy to add new modules later.
// ─────────────────────────────────────────────────────────────
function getModuleConfig(moduleKey) {
  switch (moduleKey) {
    case "party":
      return {
        filterKeys: ["partyId", "dateFrom", "dateTo"],
        filterOptions: [
          {
            key: "partyId",
            label: "Party",
            type: "partySearch",
            placeholder: "Search party by name"
          },
          {
            key: "dateFrom",
            label: "Date From",
            type: "date"
          },
          {
            key: "dateTo",
            label: "Date To",
            type: "date"
          }
        ],
        getColumns: PartyLedgerColumns,
        SummaryStats: PartyLedgerSummaryStats
        // useData:   usePartyLedger,
      };

    // ── Add new modules below ──────────────────────────────
    // case "transport":
    //   return {
    //     filterKeys: ["transportId", "dateFrom", "dateTo"],
    //     filterOptions: [...],
    //     getColumns:   TransportLedgerColumns,
    //     SummaryStats: TransportLedgerSummaryStats,
    //     useData:      useTransportLedger,
    //   };

    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────
// EmptyState — shown before any module is selected
// ─────────────────────────────────────────────────────────────
function EmptyState({ theme }) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-24 gap-3 ${theme.text?.secondary ?? "text-gray-400"}`}
    >
      <FolderOpen className="w-12 h-12 opacity-40" strokeWidth={1.2} />
      <p className="text-base font-medium">Select a report module to get started</p>
      <p className="text-sm opacity-60">Choose a module from the dropdown above</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ReportView
// Renders filters + stats + ribbon + table for the active module.
// Remounted via key={moduleKey} on every module change so all
// internal state (pagination, sorting, filters) resets cleanly.
// ─────────────────────────────────────────────────────────────
function ReportView({ moduleKey, config, moduleOptions, onModuleChange }) {
  const { filters, tableState, handlers } = useTableControls({
    FILTER_KEYS: config.filterKeys,
    resourceName: moduleKey
  });

  const { pagination, sorting } = tableState;
  const { handleFiltersChange, handleClearFilters, handlePaginationChange, handleSortingChange } =
    handlers;

  const { data: reportData, refetch, ...queryStatus } = useReports(moduleKey, filters);

  const rows = reportData?.data ?? [];
  const totalRows = reportData?.pagination?.totalRows ?? 1;
  const stats = reportData?.stats ?? null;

  const columns = config.getColumns();
  const { SummaryStats } = config;

  // Confirmation dialog hook
    const { dialogConfig, openDialog, closeDialog } = useConfirmationDialog();
  const downloadLedgerMutation = useDownloadPartyLedger();

  const handleDownloadLedger = useCallback(() => {
    const partyId = filters?.filterOptions?.partyId || ""
  const dateFrom = filters?.filterOptions?.dateFrom;
  const dateTo = filters?.filterOptions?.dateTo;

    if (!partyId || !dateFrom || !dateTo) {
      toast.error("Please select party and date range");
      return;
    }

    openDialog({
      title: "Download Party Ledger",
      message: `Download ledger for selected party?`,
      onConfirm: async () => {
        try {
          await downloadLedgerMutation.mutateAsync({
            partyId,
            dateFrom,
            dateTo
          });

          toast.success("Ledger downloaded successfully");
        } catch (err) {
          toast.error(err?.message || "Failed to download ledger");
        }
      }
    });
  }, [downloadLedgerMutation, openDialog, filters]);

  const handlePrintLedger = useCallback(() => {
    const partyId = filters?.filterOptions?.partyId || ""
  const dateFrom = filters?.filterOptions?.dateFrom;
  const dateTo = filters?.filterOptions?.dateTo;

    if (!partyId || !dateFrom || !dateTo) {
      toast.error("Please select party and date range");
      return;
    }

    const url = `${import.meta.env.VITE_API_BASE_URL}/reports/print/party-ledger?partyId=${partyId}&dateFrom=${dateFrom}&dateTo=${dateTo}`;

    window.open(url, "_blank");
  }, [filters]);

  return (
    <div className="space-y-6">
      {/* Filter bar — includes module dropdown + dynamic filters */}
      <ReportDataFilter
        moduleOptions={moduleOptions}
        selectedModule={moduleKey}
        onModuleChange={onModuleChange}
        filters={filters}
        filterOptions={config.filterOptions}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        totalRows={totalRows}
        className="sticky top-0 z-10 bg-inherit"
      />

      {/* Summary stats — each module supplies its own component */}
      <SummaryStats stats={stats} />

      {/* Action ribbon */}
      <ActionRibbon
        resourceName={moduleKey}
        actions={["print", "download"]}
        handlers={{ print: handlePrintLedger, download: handleDownloadLedger }}
      />

      {/* Ledger table */}
      <DataTable
        data={rows}
        columns={columns}
        totalRows={totalRows}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        refetch={refetch}
        {...queryStatus}
      />

      {dialogConfig.isOpen && <ConfirmationModal {...dialogConfig} onCancel={closeDialog} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Reports — root component
// Only owns module selection state.
// Everything else lives in ReportView (per-module).
// ─────────────────────────────────────────────────────────────
function Reports() {
  const { theme } = useTheme();

  const [selectedModule, setSelectedModule] = useState("");

  const handleModuleChange = useCallback(moduleKey => {
    setSelectedModule(moduleKey);
  }, []);

  const config = getModuleConfig(selectedModule);

  return (
    <div
      className={`space-y-4 overflow-auto max-h-[calc(100vh-100px)] min-h-0 ${theme.bg} ${theme.text?.primary}`}
    >
      {config ? (
        /*
         * key={selectedModule} forces a full remount of ReportView whenever
         * the module changes — filters, pagination, and sorting all reset cleanly.
         */
        <ReportView
          key={selectedModule}
          moduleKey={selectedModule}
          config={config}
          moduleOptions={MODULE_OPTIONS}
          onModuleChange={handleModuleChange}
        />
      ) : (
        <>
          {/* Keep the filter bar visible (module dropdown only) before selection */}
          <ReportDataFilter
            moduleOptions={MODULE_OPTIONS}
            selectedModule={selectedModule}
            onModuleChange={handleModuleChange}
            filters={{}}
            filterOptions={[]}
            onFiltersChange={() => {}}
            onClearFilters={() => {}}
            className="sticky top-0 z-10 bg-inherit"
          />

          <EmptyState theme={theme} />
        </>
      )}
    </div>
  );
}

Reports.displayName = "Reports";

export default Reports;
