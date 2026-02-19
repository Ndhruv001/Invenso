import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSaleReturns,
  getSaleReturn,
  createSaleReturn,
  updateSaleReturn,
  deleteSaleReturn,
  downloadSaleReturnInvoicePdf
} from "@/services/saleReturnServices";

/**
 * React Query Hooks for Sale Return Data
 * -------------------------------------
 * Handles cache, background updates, and invalidation.
 * Wraps saleReturnServices for React Query integration.
 */

// --------------------------------------------------
// QUERY KEYS (Centralized)
const SALE_RETURN_KEYS = {
  all: ["sale-returns"],
  list: (filters = {}) => ["sale-returns", "list", filters],
  detail: id => ["sale-returns", "detail", id]
};

// --------------------------------------------------
// QUERIES
export const useSaleReturns = (filters = {}) => {
  return useQuery({
    queryKey: SALE_RETURN_KEYS.list(filters),
    queryFn: () => {
      return getSaleReturns(filters);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    keepPreviousData: true
  });
};

export const useSaleReturn = id =>
  useQuery({
    queryKey: SALE_RETURN_KEYS.detail(id),
    queryFn: () => getSaleReturn(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000
  });

// --------------------------------------------------
// MUTATIONS
export const useCreateSaleReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-sale-return"],
    mutationFn: createSaleReturn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SALE_RETURN_KEYS.all
      });
    }
  });
};

export const useUpdateSaleReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-sale-return"],
    mutationFn: ({ id, data }) => updateSaleReturn(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: SALE_RETURN_KEYS.all
      });
      queryClient.invalidateQueries({
        queryKey: SALE_RETURN_KEYS.detail(id)
      });
    }
  });
};

export const useDeleteSaleReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete-sale-return"],
    mutationFn: id => deleteSaleReturn(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: SALE_RETURN_KEYS.all
      });
      queryClient.invalidateQueries({
        queryKey: SALE_RETURN_KEYS.detail(id)
      });
    }
  });
};

export const useDownloadSaleReturnInvoice = () => {
  return useMutation({
    mutationKey: ["download-sale-return-invoice"],
    mutationFn: downloadSaleReturnInvoicePdf,
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
  useSaleReturns,
  useSaleReturn,
  useCreateSaleReturn,
  useUpdateSaleReturn,
  useDeleteSaleReturn,
  useDownloadSaleReturnInvoice
};
