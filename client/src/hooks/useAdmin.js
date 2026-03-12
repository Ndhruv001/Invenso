import { useMutation, useQuery } from "@tanstack/react-query";
import { sentInvoicesOnWhatsApp, deleteOldAuditLogsAndInventoryLogs, healthCheckEndPoint } from "@/services/adminServices";

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
const useHealthCheckEndPoint = () => {
  return useQuery({
    queryFn:  () =>  healthCheckEndPoint()
  });
};

export default {useSentInvoicesOnWhatsApp, useDeleteOldAuditLogsAndInventoryLogs, useHealthCheckEndPoint};
export { useSentInvoicesOnWhatsApp, useDeleteOldAuditLogsAndInventoryLogs, useHealthCheckEndPoint };
