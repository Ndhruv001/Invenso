import { useMutation } from "@tanstack/react-query";
import { sentInvoicesOnWhatsApp, deleteOldAuditLogs } from "@/services/adminServices";

const useSentInvoicesOnWhatsApp = () => {
  return useMutation({
    mutationFn: () => sentInvoicesOnWhatsApp()
  });
};
const useDeleteOldAuditLogs = () => {
  return useMutation({
    mutationFn: () => deleteOldAuditLogs()
  });
};

export default {useSentInvoicesOnWhatsApp, useDeleteOldAuditLogs};
export { useSentInvoicesOnWhatsApp, useDeleteOldAuditLogs };
