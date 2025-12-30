import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getParties,
  getPurchases,
  getPurchase,
  createPurchase,
  updatePurchase,
  deletePurchase,
  bulkDeletePurchases
} from "@/services/purchaseServices";

/**
 * React Query Hooks for Purchase Data
 * -----------------------------------
 * Handles cache, background updates, and invalidation.
 * Wraps purchaseServices for React Query integration.
 */

// --------------------------------------------------
// QUERY KEYS (Centralized)
export const PURCHASE_KEYS = {
  all: ["purchases"],
  list: (filters = {}) => ["purchases", "list", filters],
  detail: id => ["purchases", "detail", id]
};

export const useParties = () => {
  return useQuery({
    queryKey: ["parties", "list"],
    queryFn: () => getParties(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 60 * 60 * 1000 // 1 hour
  });
}

// --------------------------------------------------
// QUERIES
export const usePurchases = (filters = {}) => {
    return useQuery({
        queryKey: PURCHASE_KEYS.list(filters),
        queryFn: () => {
          return getPurchases(filters);
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 30 * 60 * 1000, // 30 minutes
        keepPreviousData: true
    });
};

export const usePurchase = id =>
  useQuery({
    queryKey: PURCHASE_KEYS.detail(id),
    queryFn: () => getPurchase(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000
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
    }
  });
};

export const useBulkDeletePurchases = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["bulk-delete-purchases"],
    mutationFn: bulkDeletePurchases,
    onSuccess: ids => {
      queryClient.invalidateQueries({ queryKey: PURCHASE_KEYS.all });
      ids?.forEach(id => queryClient.removeQueries({ queryKey: PURCHASE_KEYS.detail(id) }));
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
  useBulkDeletePurchases,
  PURCHASE_KEYS
};
