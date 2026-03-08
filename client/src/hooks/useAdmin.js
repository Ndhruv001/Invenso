import { useMutation } from "@tanstack/react-query";
import { sentInvoicesOnWhatsApp, deleteOldAuditLogsAndInventoryLogs } from "@/services/adminServices";

const useSentInvoicesOnWhatsApp = () => {
  return useMutation({
    mutationFn: () => sentInvoicesOnWhatsApp()
  });
};
const useDeleteOldAuditLogsAndInventoryLogs = () => {
  return useMutation({
    mutationFn: () => deleteOldAuditLogsAndInventoryLogs()
  });
};

export default {useSentInvoicesOnWhatsApp, useDeleteOldAuditLogsAndInventoryLogs};
export { useSentInvoicesOnWhatsApp, useDeleteOldAuditLogsAndInventoryLogs };
