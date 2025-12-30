import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  bulkDeleteCategories,
} from "@/services/categoryServices";

// ---------------------------------------------
// CATEGORY HOOKS
// ---------------------------------------------

const QUERY_KEYS = {
  PRODUCTS: "products",
  PRODUCT: "product",
  CATEGORIES: "categories",
  CATEGORY: "category",
};

const useCategories = (type) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES, type],
    queryFn: () => getCategories(type),
    staleTime: 10 * 60 * 1000, // longer cache since categories change less frequently
    cacheTime: 60 * 60 * 1000,
  });
};

const useCategory = (id) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CATEGORY, id],
    queryFn: () => getCategory(id),
    enabled: !!id,
  });
};

const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryData) => createCategory(categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
    },
  });
};

const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORY, id] });
    },
  });
};

const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId) => deleteCategory(categoryId),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
      queryClient.removeQueries({ queryKey: [QUERY_KEYS.CATEGORY, id] });
    },
  });
};

const useBulkDeleteCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids) => bulkDeleteCategories(ids),
    onSuccess: (ids) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
      ids.forEach((id) => {
        queryClient.removeQueries({ queryKey: [QUERY_KEYS.CATEGORY, id] });
      });
    },
  });
};

export default {
  useCategories,
  useCategory,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useBulkDeleteCategories,
};

export {
  useCategories,
  useCategory,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useBulkDeleteCategories,
};