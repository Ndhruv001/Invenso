import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSales,
  getSale,
  createSale,
  updateSale,
  deleteSale,
  getSaleSuggestionsByPartyId,
  downloadSaleInvoicePdf,
} from "@/services/saleServices";

/**
 * React Query Hooks for Sale Data
 * -------------------------------
 * Handles cache, background updates, and invalidation.
 * Wraps saleServices for React Query integration.
 */

// --------------------------------------------------
// QUERY KEYS (Centralized)
const SALE_KEYS = {
  all: ["sales"],
  list: (filters = {}) => ["sales", "list", filters],
  detail: id => ["sales", "detail", id],
  byParty: partyId => ["sales", "by-party", partyId]
};

// --------------------------------------------------
// QUERIES
export const useSales = (filters = {}) => {
  return useQuery({
    queryKey: SALE_KEYS.list(filters),
    queryFn: () => {
      return getSales(filters);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    keepPreviousData: true
  });
};

export const useSale = id =>
  useQuery({
    queryKey: SALE_KEYS.detail(id),
    queryFn: () => getSale(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000
  });

// --------------------------------------------------
// MUTATIONS
export const useCreateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-sale"],
    mutationFn: createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALE_KEYS.all });
    }
  });
};

export const useUpdateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-sale"],
    mutationFn: ({ id, data }) => updateSale(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: SALE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: SALE_KEYS.detail(id) });
    }
  });
};

export const useDeleteSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete-sale"],
    mutationFn: id => deleteSale(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: SALE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: SALE_KEYS.detail(id) });
    }
  });
};

export const useSaleSuggestionsByPartyId = (partyId, options = {}) => {
  return useQuery({
    queryKey: SALE_KEYS.byParty(partyId),
    queryFn: () => getSaleSuggestionsByPartyId(partyId),
    enabled: !!partyId,
    staleTime: 5 * 60 * 1000,
    ...options
  });
};

export const useDownloadSaleInvoice = () => {
  return useMutation({
    mutationKey: ["download-sale-invoice"],
    mutationFn: downloadSaleInvoicePdf,
    onSuccess: (blob, id) => {
      // Create temporary link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `invoice-${id}.pdf`;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    }
  });
};

// --------------------------------------------------
// Default export
export default {
  useSales,
  useSale,
  useCreateSale,
  useUpdateSale,
  useDeleteSale,
  useSaleSuggestionsByPartyId,
  useDownloadSaleInvoice
};
