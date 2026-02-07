import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getHsnCodes,
  getProduct,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  suggestProducts
} from "@/services/productServices";

/**
 * React Query Hooks for Product Data
 * -----------------------------------
 * Handles cache, background updates, and invalidation.
 * These hooks wrap around productServices for React Query.
 */

// --------------------------------------------------
// QUERY KEYS (Centralized for consistency)
// --------------------------------------------------
export const PRODUCT_KEYS = {
  all: ["products"], // Root
  list: (filters = {}) => ["products", "list", filters], // Paginated/List query
  detail: id => ["products", "detail", id] // Single product
};

// --------------------------------------------------
// QUERIES
// --------------------------------------------------
export const useHsnCodes = () =>
  useQuery({
    queryKey: PRODUCT_KEYS.list("hsn-codes"),
    queryFn: () => getHsnCodes(),
    staleTime: 5 * 60 * 1000, // 5 mins fresh cache
    cacheTime: 30 * 60 * 1000, // 30 mins kept in memory
    keepPreviousData: true // Prevent flicker during pagination/filtering
  });

export const useProducts = (filters = {}) => {
  return useQuery({
    queryKey: PRODUCT_KEYS.list(filters),
    queryFn: () => getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 mins fresh cache
    cacheTime: 30 * 60 * 1000, // 30 mins kept in memory
    keepPreviousData: true // Prevent flicker during pagination/filtering
  });
};

export const useProduct = id =>
  useQuery({
    queryKey: PRODUCT_KEYS.detail(id),
    queryFn: () => getProduct(id),
    enabled: !!id, // Only fetch if ID is provided
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000
  });

// --------------------------------------------------
// MUTATIONS
// --------------------------------------------------
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-product"],
    mutationFn: createProduct,
    onSuccess: () => {
      // Invalidate product list to get updated data
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
    }
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-product"],
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate both product list + individual product cache
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.detail(id) });
    }
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete-product"],
    mutationFn: id => deleteProduct(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.detail(id) });
    }
  });
};

export const useProductSuggestions = query => {
  return useQuery({
    queryKey: ["product-suggestions", query],
    queryFn: () => suggestProducts(query),
    enabled: !!query && query.length >= 2, // ⬅ important
    staleTime: 60 * 1000
  });
};

// --------------------------------------------------
// DEFAULT EXPORT
// --------------------------------------------------
export default {
  useProducts,
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useProductSuggestions,
};
