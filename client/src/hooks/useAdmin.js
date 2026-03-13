import { useMutation, useQuery } from "@tanstack/react-query";
import { sentInvoicesOnWhatsApp, deleteOldAuditLogsAndInventoryLogs, healthCheckEndPoint, getQRCode } from "@/services/adminServices";

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

const useGetQRCode = () => {
  return useQuery({
    queryKey: ["qrCode"],
    queryFn: () => getQRCode(),  // your axios/fetch call
    enabled: false,   // don't fetch on mount, only on demand
  });
};

export default {useSentInvoicesOnWhatsApp, useDeleteOldAuditLogsAndInventoryLogs, useHealthCheckEndPoint, useGetQRCode};
export { useSentInvoicesOnWhatsApp, useDeleteOldAuditLogsAndInventoryLogs, useHealthCheckEndPoint, useGetQRCode };
