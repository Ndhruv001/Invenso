import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCheques,
  getCheque,
  createCheque,
  updateCheque,
  deleteCheque
} from "@/services/chequeServices";

/**
 * React Query Hooks for Cheque Data
 */

export const CHEQUE_KEYS = {
  all: ["cheques"],
  list: (filters = {}) => ["cheques", "list", filters],
  detail: id => ["cheques", "detail", id]
};

// QUERIES

export const useCheques = (filters = {}) =>
  useQuery({
    queryKey: CHEQUE_KEYS.list(filters),
    queryFn: () => getCheques(filters)
  });

export const useCheque = id =>
  useQuery({
    queryKey: CHEQUE_KEYS.detail(id),
    queryFn: () => getCheque(id),
    enabled: !!id
  });

export const useCreateCheque = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-cheque"],
    mutationFn: data => createCheque(data),

    onSuccess: () => {
      // 🔥 IMPORTANT: Because cheque clearing affects payments + party balance
      queryClient.invalidateQueries({ queryKey: CHEQUE_KEYS.all });

      // 🔥 NEW — invalidate related systems
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    }
  });
};

// MUTATIONS

export const useUpdateCheque = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-cheque"],
    mutationFn: ({ id, data }) => updateCheque(id, data),

    onSuccess: (_, { id }) => {
      // 🔥 IMPORTANT: Because cheque clearing affects payments + party balance
      queryClient.invalidateQueries({ queryKey: CHEQUE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CHEQUE_KEYS.detail(id) });

      // 🔥 NEW — invalidate related systems
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    }
  });
};

export const useDeleteCheque = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete-cheque"],
    mutationFn: id => deleteCheque(id),

    onSuccess: (_, id) => {
      // Cheque list refresh
      queryClient.invalidateQueries({ queryKey: CHEQUE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CHEQUE_KEYS.detail(id) });

      // 🔥 Because delete may revert balance + delete payment
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    }
  });
};

// Default export
export default {
  useCheques,
  useCheque,
  useCreateCheque,
  useUpdateCheque,
  useDeleteCheque
};
