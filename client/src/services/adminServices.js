import axiosInstance from "@/lib/config/axiosInstance";

export const sentInvoicesOnWhatsApp = async () => {
  try {
    await axiosInstance.post("/admin/run-whatsapp-invoices");
    return;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error?.message || "Failed to send invoices");
  }
};
export const deleteOldAuditLogsAndInventoryLogs = async () => {
  try {
    await axiosInstance.post("/admin/run-delete-old-audit-and-inventory-logs");
    return;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error?.message || "Failed to delete audit logs & inventory logs.");
  }
};

 export const healthCheckEndPoint = async () => {
  try {
    return  await axiosInstance.get("/health");
  } catch (error) {
    console.error("Server is down:", error);
    throw new Error(error.message || "Server is down");
  }
};

export default { sentInvoicesOnWhatsApp, deleteOldAuditLogsAndInventoryLogs, healthCheckEndPoint };