// src/scenes/reports/Reports.jsx

import React, { useState, useCallback } from "react";
import { FolderOpen } from "lucide-react";
import { toast } from "react-toastify";

import { useDownloadPartyLedger, useDownloadTransportLedger, useReports } from "@/hooks/useReports";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import { useTheme } from "@/hooks/useTheme";
import { useTableControls } from "@/hooks/useTableControls";

import ReportDataFilter from "@/components/common/ReportDataFilter";
import ActionRibbon from "@/components/common/ActionRibbon";
import DataTable from "@/components/common/DataTable";
import { MODULE_OPTIONS } from "@/constants/MODULE_OPTIONS";

import PartyLedgerColumns from "./parties/Columns";
import PartyLedgerSummaryStats from "./parties/PartyLedgerSummaryStats";
import TransportLedgerColumns from "./transport/Columns";
import TransportLedgerSummaryStats from "./transport/TransportLedgerSummaryStats";

// ─────────────────────────────────────────────────────────────
// SHARED FILTER OPTIONS
// Both party and transport ledgers use the same filter shape.
// ─────────────────────────────────────────────────────────────
const LEDGER_FILTER_KEYS = ["partyId", "dateFrom", "dateTo"];

const LEDGER_FILTER_OPTIONS = [
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
];

// ─────────────────────────────────────────────────────────────
// MODULE REGISTRY
// Add new modules here. Each entry is self-contained.
// ─────────────────────────────────────────────────────────────
const MODULE_REGISTRY = {
  party: {
    filterKeys: LEDGER_FILTER_KEYS,
    filterOptions: LEDGER_FILTER_OPTIONS,
    getColumns: PartyLedgerColumns,
    SummaryStats: PartyLedgerSummaryStats,
    printPath: "party-ledger"
  },
  transport: {
    filterKeys: LEDGER_FILTER_KEYS,
    filterOptions: LEDGER_FILTER_OPTIONS,
    getColumns: TransportLedgerColumns,
    SummaryStats: TransportLedgerSummaryStats,
    printPath: "transport-ledger"
  }
};

function getModuleConfig(moduleKey) {
  return MODULE_REGISTRY[moduleKey] ?? null;
}

// ─────────────────────────────────────────────────────────────
// DOWNLOAD MUTATION MAP
// Maps moduleKey → the correct download mutation hook result.
// Keeps ReportView free of per-module conditionals.
// ─────────────────────────────────────────────────────────────
function useDownloadMutations() {
  return {
    party: useDownloadPartyLedger(),
    transport: useDownloadTransportLedger()
  };
}

// ─────────────────────────────────────────────────────────────
// EmptyState
// ─────────────────────────────────────────────────────────────
function EmptyState({ theme }) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-24 gap-3 ${
        theme.text?.secondary ?? "text-gray-400"
      }`}
    >
      <FolderOpen className="w-12 h-12 opacity-40" strokeWidth={1.2} />
      <p className="text-base font-medium">Select a report module to get started</p>
      <p className="text-sm opacity-60">Choose a module from the dropdown above</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Helper — extract & validate common ledger filter params
// Returns { partyId, dateFrom, dateTo } or null if incomplete.
// ─────────────────────────────────────────────────────────────
function extractLedgerFilters(filters) {
  const partyId = filters?.filterOptions?.partyId || "";
  const dateFrom = filters?.filterOptions?.dateFrom;
  const dateTo = filters?.filterOptions?.dateTo;

  if (!partyId || !dateFrom || !dateTo) return null;

  return { partyId, dateFrom, dateTo };
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
  const { SummaryStats, printPath } = config;

  // Confirmation dialog
  const { dialogConfig, openDialog, closeDialog } = useConfirmationDialog();

  // All download mutations — pick the right one by moduleKey
  const downloadMutations = useDownloadMutations();
  const downloadMutation = downloadMutations[moduleKey];

  // ── Generic download handler ──────────────────────────────
  const handleDownload = useCallback(() => {
    const params = extractLedgerFilters(filters);

    if (!params) {
      toast.error("Please select party and date range");
      return;
    }

    openDialog({
      title: "Download Ledger",
      message: "Download ledger for the selected filters?",
      onConfirm: async () => {
        try {
          await downloadMutation.mutateAsync(params);
          toast.success("Ledger downloaded successfully");
        } catch (err) {
          toast.error(err?.message || "Failed to download ledger");
        }
      }
    });
  }, [downloadMutation, openDialog, filters]);

  // ── Generic print handler ─────────────────────────────────
  const handlePrint = useCallback(() => {
    const params = extractLedgerFilters(filters);

    if (!params) {
      toast.error("Please select party and date range");
      return;
    }

    const { partyId, dateFrom, dateTo } = params;
    const url = `${import.meta.env.VITE_API_BASE_URL}/reports/print/${printPath}?partyId=${partyId}&dateFrom=${dateFrom}&dateTo=${dateTo}`;

    window.open(url, "_blank");
  }, [filters, printPath]);

  return (
    <div className="space-y-6">
      {/* Filter bar — module dropdown + dynamic filters */}
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

      {/* Per-module summary stats */}
      <SummaryStats stats={stats} />

      {/* Action ribbon */}
      <ActionRibbon
        resourceName={moduleKey}
        actions={["print", "download"]}
        handlers={{ print: handlePrint, download: handleDownload }}
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
// Owns only module-selection state; all else lives in ReportView.
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
         * the module changes — filters, pagination, and sorting all reset.
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
          {/* Keep module dropdown visible before a module is selected */}
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
