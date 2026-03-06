import { useQuery, useMutation } from "@tanstack/react-query";
import { getReport, downloadPartyLedgerPdf } from "@/services/reportServices";

// -----------------------------------------
// Query Keys
// -----------------------------------------
export const REPORT_KEYS = {
  all: ["reports"],
  ledger: (module, filters = {}) => ["reports", module, filters]
};

// -----------------------------------------
// Party Ledger Hook
// -----------------------------------------
export const useReports = (module, filters = {}) => {
  return useQuery({
    queryKey: REPORT_KEYS.ledger(module, filters.filterOptions),

    queryFn: () =>
      getReport({
        module,
        filters: filters.filterOptions
      }),

    enabled: !!module && !!filters?.filterOptions?.partyId && !!filters?.filterOptions?.dateFrom && !!filters?.filterOptions?.dateTo, // Only fetch if module selected

    staleTime: 30 * 60 * 1000
  });
};

export const useDownloadPartyLedger = () => {
    
  return useMutation({
    mutationKey: ["download-party-ledger"],

    mutationFn: (filters) => {
      return downloadPartyLedgerPdf(filters);
    },

    onSuccess: (blob, variables) => {
      const { partyId } = variables;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `party-ledger-${partyId}.pdf`;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    }
  });
};

export default {
  useReports,
  useDownloadPartyLedger
};
