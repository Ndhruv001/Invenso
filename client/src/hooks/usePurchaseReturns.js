import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPurchaseReturns,
  getPurchaseReturn,
  createPurchaseReturn,
  updatePurchaseReturn,
  deletePurchaseReturn
} from "@/services/purchaseReturnServices";

/**
 * React Query Hooks for Purchase Return Data
 * -----------------------------------------
 * Handles cache, background updates, and invalidation.
 * Wraps purchaseReturnServices for React Query integration.
 */

// --------------------------------------------------
// QUERY KEYS (Centralized)
const PURCHASE_RETURN_KEYS = {
  all: ["purchase-returns"],
  list: (filters = {}) => ["purchase-returns", "list", filters],
  detail: id => ["purchase-returns", "detail", id]
};

// --------------------------------------------------
// QUERIES
export const usePurchaseReturns = (filters = {}) => {
  return useQuery({
    queryKey: PURCHASE_RETURN_KEYS.list(filters),
    queryFn: () => {
      return getPurchaseReturns(filters);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    keepPreviousData: true
  });
};

export const usePurchaseReturn = id =>
  useQuery({
    queryKey: PURCHASE_RETURN_KEYS.detail(id),
    queryFn: () => getPurchaseReturn(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000
  });

// --------------------------------------------------
// MUTATIONS
export const useCreatePurchaseReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-purchase-return"],
    mutationFn: createPurchaseReturn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PURCHASE_RETURN_KEYS.all
      });
    }
  });
};

export const useUpdatePurchaseReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-purchase-return"],
    mutationFn: ({ id, data }) => updatePurchaseReturn(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: PURCHASE_RETURN_KEYS.all
      });
      queryClient.invalidateQueries({
        queryKey: PURCHASE_RETURN_KEYS.detail(id)
      });
    }
  });
};

export const useDeletePurchaseReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete-purchase-return"],
    mutationFn: id => deletePurchaseReturn(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: PURCHASE_RETURN_KEYS.all
      });
      queryClient.invalidateQueries({
        queryKey: PURCHASE_RETURN_KEYS.detail(id)
      });
    }
  });
};

// --------------------------------------------------
// Default export
export default {
  usePurchaseReturns,
  usePurchaseReturn,
  useCreatePurchaseReturn,
  useUpdatePurchaseReturn,
  useDeletePurchaseReturn
};
