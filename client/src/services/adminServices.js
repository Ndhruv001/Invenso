import axiosInstance from "@/lib/config/axiosInstance";

export const sentInvoicesOnWhatsApp = async () => {
  try {
    await axiosInstance.post("/admin/run-whatsapp-invoices");
    return;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error?.message || "Failed to send invoices");
  }
};
export const deleteOldAuditLogs = async () => {
  try {
    await axiosInstance.post("/admin/run-delete-old-audit-logs");
    return;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error?.message || "Failed to delete audit logs.");
  }
};

export default { sentInvoicesOnWhatsApp, deleteOldAuditLogs };
