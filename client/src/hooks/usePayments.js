import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment
} from "@/services/paymentServices";

/**
 * React Query Hooks for Payment Data
 */

export const PAYMENT_KEYS = {
  all: ["payments"],
  list: (filters = {}) => ["payments", "list", filters],
  detail: id => ["payments", "detail", id]
};

// QUERIES
export const usePayments = (filters = {}) =>
  useQuery({
    queryKey: PAYMENT_KEYS.list(filters),
    queryFn: () => getPayments(filters)
  });

export const usePayment = id =>
  useQuery({
    queryKey: PAYMENT_KEYS.detail(id),
    queryFn: () => getPayment(id),
    enabled: !!id
  });

// MUTATIONS
export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-payment"],
    mutationFn: createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.all });
    }
  });
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-payment"],
    mutationFn: ({ id, data }) => updatePayment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.detail(id) });
    }
  });
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-payment"],
    mutationFn: id => deletePayment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.detail(id) });
    }
  });
};

// Default export
export default {
  usePayments,
  usePayment,
  useCreatePayment,
  useUpdatePayment,
  useDeletePayment
};
