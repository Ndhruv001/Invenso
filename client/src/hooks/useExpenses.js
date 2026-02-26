import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense
} from "@/services/expenseServices";

/**
 * React Query Hooks for Expense Data
 * -----------------------------------
 * Handles cache, background updates, and invalidation.
 * These hooks wrap around expenseServices for React Query.
 */

// --------------------------------------------------
// QUERY KEYS (Centralized for consistency)
// --------------------------------------------------
export const EXPENSE_KEYS = {
  all: ["expenses"], // Root
  list: (filters = {}) => ["expenses", "list", filters], // Paginated/List query
  detail: id => ["expenses", "detail", id] // Single expense
};

// --------------------------------------------------
// QUERIES
// --------------------------------------------------
export const useExpenses = (filters = {}) => {
  return useQuery({
    queryKey: EXPENSE_KEYS.list(filters),
    queryFn: () => getExpenses(filters)
  });
};

export const useExpense = id =>
  useQuery({
    queryKey: EXPENSE_KEYS.detail(id),
    queryFn: () => getExpense(id),
    enabled: !!id // Only fetch if ID is provided
  });

// --------------------------------------------------
// MUTATIONS
// --------------------------------------------------
export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-expense"],
    mutationFn: createExpense,
    onSuccess: () => {
      // Invalidate expense list to get updated data
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.all });
    }
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-expense"],
    mutationFn: ({ id, data }) => updateExpense(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate both expense list + individual expense cache
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.detail(id) });
    }
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete-expense"],
    mutationFn: id => deleteExpense(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.detail(id) });
    }
  });
};

// --------------------------------------------------
// DEFAULT EXPORT
// --------------------------------------------------
export default {
  useExpenses,
  useExpense,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense
};
