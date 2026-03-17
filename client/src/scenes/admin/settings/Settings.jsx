// src/scenes/system/System.js

import React, { useState, useCallback } from "react";
import { toast } from "react-toastify";
import {
  Send,
  Trash2,
  BarChart3,
  Database,
  Bell,
  MessageCircle,
  Archive,
  ClipboardList,
  QrCode
} from "lucide-react";

import { useTheme } from "@/hooks/useTheme";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import QRModal from "@/components/common/QRModal";
import {
  useDeleteOldAuditLogsAndInventoryLogs,
  useSentInvoicesOnWhatsApp,
  useGetQRCode
} from "@/hooks/useAdmin";

// ---------------------------
// Config
// ---------------------------

const CRON_JOBS = [
  {
    key: "pendingInvoices",
    label: "Pending Invoices",
    description: "Dispatch all unsent invoices to parties via WhatsApp",
    icon: Send,
    confirmTitle: "Send Pending Invoices",
    confirmMessage:
      "This will dispatch all pending invoices to their respective parties via WhatsApp. Continue?"
  },
  {
    key: "deleteOldAuditLogsAndInventoryLogs",
    label: "Delete Old Audit Logs & Inventory Logs ",
    description: "Delete all audit logs & inventory logs which are older than 14 days.",
    icon: Trash2,
    confirmTitle: "Delete Old Audit Logs & Inventory Logs",
    confirmMessage: "This will delete all audit logs which are older than 14 days. Continue?"
  },
  {
    key: "weeklyLedger",
    label: "Weekly Ledger",
    description: "Send the weekly ledger summary to all active parties",
    icon: BarChart3,
    confirmTitle: "Send Weekly Ledger",
    confirmMessage: "This will send the weekly ledger to all active parties. Continue?"
  },
  {
    key: "backup",
    label: "Database Backup",
    description: "Trigger a full snapshot backup of the database",
    icon: Database,
    confirmTitle: "Run Database Backup",
    confirmMessage: "This will initiate a full database backup. It may take a few minutes."
  }
];

const SETTINGS_ITEMS = [
  {
    key: "notifications",
    label: "Notification Preferences",
    description: "Configure alerts for invoices, ledgers and system events",
    icon: Bell
  },
  {
    key: "whatsapp",
    label: "WhatsApp Integration",
    description: "Manage WhatsApp API credentials and templates",
    icon: MessageCircle
  },
  {
    key: "retention",
    label: "Data Retention",
    description: "Set how long records and logs are kept before purging",
    icon: Archive
  },
  {
    key: "auditLog",
    label: "Audit Log",
    description: "View a full trail of system and user activity",
    icon: ClipboardList
  },
];

// ---------------------------
// Shared sub-components
// ---------------------------

const SectionLabel = ({ theme, children }) => (
  <p className={`text-[11px] font-semibold uppercase tracking-widest mb-3 ${theme.text.muted}`}>
    {children}
  </p>
);

const Spinner = () => (
  <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

// ---------------------------
// Main Component
// ---------------------------

const System = () => {
  const { theme } = useTheme();
  const { dialogConfig, openDialog, closeDialog } = useConfirmationDialog();
  const [loading, setLoading] = useState({});
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [whatsappData, setWhatsappData] = useState(null)
  const [qrImageUrl, setQrImageUrl] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

  const { refetch: fetchQRCode } = useGetQRCode();
  const sentInvoicesOnWhatsAppMutation = useSentInvoicesOnWhatsApp();
  const deleteOldAuditLogsAndInventoryLogs = useDeleteOldAuditLogsAndInventoryLogs();

  const handleRun = useCallback(
    job => {
      openDialog({
        title: job.confirmTitle,
        message: job.confirmMessage,
        onConfirm: async () => {
          setLoading(prev => ({ ...prev, [job.key]: true }));
          try {
            if (job.key === "pendingInvoices") {
              await sentInvoicesOnWhatsAppMutation.mutateAsync();
            }
            if (job.key === "deleteOldAuditLogsAndInventoryLogs") {
              await deleteOldAuditLogsAndInventoryLogs.mutateAsync();
            }
            toast.success(`${job.label} completed successfully`);
          } catch (err) {
            toast.error(err?.message || `${job.label} failed`);
          } finally {
            setLoading(prev => ({ ...prev, [job.key]: false }));
          }
        }
      });
    },
    [openDialog, sentInvoicesOnWhatsAppMutation, deleteOldAuditLogsAndInventoryLogs]
  );

  const handleSetting = useCallback(async key => {
    if (key === "whatsapp") {
      setQrLoading(true);
      setQrModalOpen(true); // open modal immediately with a spinner
      const { data } = await fetchQRCode();
      setWhatsappData(data)
      setQrImageUrl(data?.qr); // once resolved, set the URL
      setQrLoading(false);
      return;
    }
    // TODO: wire individual setting handlers
    toast.info("Coming soon");
  }, []);

  const handleQrClose = () => {
    setQrModalOpen(false);
    setQrImageUrl(null); // clear so stale QR isn't shown on next open
    setQrLoading(false); // safety reset
  };

  return (
    <div
      className={`space-y-8 overflow-auto max-h-[calc(100vh-100px)] min-h-0 px-0.5 ${theme.bg} ${theme.text.primary}`}
    >
      {/* ── Cron Jobs ── */}
      <section>
        <SectionLabel theme={theme}>Cron Jobs</SectionLabel>

        <div
          className={`rounded-xl border ${theme.border} divide-y ${theme.border} overflow-hidden`}
        >
          {CRON_JOBS.map(job => (
            <div
              key={job.key}
              className={`flex items-center justify-between gap-4 px-4 py-3 ${theme.card}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-base shrink-0">
                  {React.createElement(job.icon, { size: 20 })}
                </span>
                <div className="min-w-0">
                  <p className={`text-sm font-medium leading-snug ${theme.text.primary}`}>
                    {job.label}
                  </p>
                  <p className={`text-xs mt-0.5 truncate ${theme.text.muted}`}>{job.description}</p>
                </div>
              </div>

              <button
                onClick={() => handleRun(job)}
                disabled={!!loading[job.key]}
                className={`
                  cursor-pointer shrink-0 flex items-center gap-1.5
                  text-xs font-medium
                  px-3 py-1.5 rounded-lg border ${theme.border}
                  ${theme.card} ${theme.text.secondary} ${theme.hover}
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-colors duration-150
                `}
              >
                {loading[job.key] ? (
                  <>
                    <Spinner />
                    <span>Running</span>
                  </>
                ) : (
                  "Run"
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Settings ── */}
      <section>
        <SectionLabel theme={theme}>Settings</SectionLabel>

        <div
          className={`rounded-xl border ${theme.border} divide-y ${theme.border} overflow-hidden`}
        >
          {SETTINGS_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={() => handleSetting(item.key)}
              className={`
                cursor-pointer w-full flex items-center justify-between gap-4
                px-4 py-3 text-left group
                ${theme.card} ${theme.hover}
                transition-colors duration-150
              `}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-base shrink-0">
                  {React.createElement(item.icon, { size: 20 })}
                </span>
                <div className="min-w-0">
                  <p className={`text-sm font-medium leading-snug ${theme.text.primary}`}>
                    {item.label}
                  </p>
                  <p className={`text-xs mt-0.5 truncate ${theme.text.muted}`}>
                    {item.description}
                  </p>
                </div>
              </div>

              {/* chevron */}
              <svg
                className={`w-4 h-4 shrink-0 transition-colors ${theme.text.muted}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </section>

      {dialogConfig.isOpen && <ConfirmationModal {...dialogConfig} onCancel={closeDialog} />}

      <QRModal
        isOpen={qrModalOpen}
        onClose={handleQrClose}
        imageUrl={qrImageUrl}
        isLoading={qrLoading}
        message={whatsappData?.status === "connected" ? "Authentication successful" : "Scan this QR code to pair your device" }
      />
    </div>
  );
};

System.displayName = "System";

export default System;
