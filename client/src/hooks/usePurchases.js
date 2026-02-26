import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPurchases,
  getPurchase,
  createPurchase,
  updatePurchase,
  deletePurchase,
  getPurchaseSuggestionsByPartyId,
  downloadPurchaseInvoicePdf
} from "@/services/purchaseServices";

/**
 * React Query Hooks for Purchase Data
 * -----------------------------------
 * Handles cache, background updates, and invalidation.
 * Wraps purchaseServices for React Query integration.
 */

// --------------------------------------------------
// QUERY KEYS (Centralized)
const PURCHASE_KEYS = {
  all: ["purchases"],
  list: (filters = {}) => ["purchases", "list", filters],
  detail: id => ["purchases", "detail", id],
  byParty: partyId => ["purchases", "by-party", partyId]
};

// --------------------------------------------------
// QUERIES
export const usePurchases = (filters = {}) => {
  return useQuery({
    queryKey: PURCHASE_KEYS.list(filters),
    queryFn: () => {
      return getPurchases(filters);
    }
  });
};

export const usePurchase = id =>
  useQuery({
    queryKey: PURCHASE_KEYS.detail(id),
    queryFn: () => getPurchase(id),
    enabled: !!id
  });

// --------------------------------------------------
// MUTATIONS
export const useCreatePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-purchase"],
    mutationFn: createPurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PURCHASE_KEYS.all });
      // 🔥 Because delete may revert balance + delete payment
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    }
  });
};

export const useUpdatePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-purchase"],
    mutationFn: ({ id, data }) => updatePurchase(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PURCHASE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PURCHASE_KEYS.detail(id) });
      // 🔥 Because delete may revert balance + delete payment
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    }
  });
};

export const useDeletePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete-purchase"],
    mutationFn: id => deletePurchase(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: PURCHASE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PURCHASE_KEYS.detail(id) });
      // 🔥 Because delete may revert balance + delete payment
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    }
  });
};

export const usePurchaseSuggestionsbyPartyId = (partyId, options = {}) => {
  return useQuery({
    queryKey: PURCHASE_KEYS.byParty(partyId),
    queryFn: () => getPurchaseSuggestionsByPartyId(partyId),
    enabled: !!partyId,
    staleTime: 30 * 60 * 1000,
    ...options
  });
};

export const useDownloadPurchaseInvoice = () => {
  return useMutation({
    mutationKey: ["download-purchase-invoice"],
    mutationFn: downloadPurchaseInvoicePdf,
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
  usePurchases,
  usePurchase,
  useCreatePurchase,
  useUpdatePurchase,
  useDeletePurchase,
  usePurchaseSuggestionsbyPartyId,
  useDownloadPurchaseInvoice
};
