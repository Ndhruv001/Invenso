import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTransports,
  getTransport,
  createTransport,
  updateTransport,
  deleteTransport,
} from "@/services/transportServices";

/**
 * React Query Hooks for Transport Data
 */

export const TRANSPORT_KEYS = {
  all: ["transports"],
  list: (filters = {}) => ["transports", "list", filters],
  detail: (id) => ["transports", "detail", id],
};

// QUERIES
export const useTransports = (filters = {}) =>
  useQuery({
    queryKey: TRANSPORT_KEYS.list(filters),
    queryFn: () => getTransports(filters),
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    keepPreviousData: true,
  });

export const useTransport = (id) =>
  useQuery({
    queryKey: TRANSPORT_KEYS.detail(id),
    queryFn: () => getTransport(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });

// MUTATIONS
export const useCreateTransport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-transport"],
    mutationFn: createTransport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSPORT_KEYS.all });
    },
  });
};

export const useUpdateTransport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-transport"],
    mutationFn: ({ id, data }) => updateTransport(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: TRANSPORT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TRANSPORT_KEYS.detail(id) });
    },
  });
};

export const useDeleteTransport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-transport"],
    mutationFn: (id) => deleteTransport(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: TRANSPORT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TRANSPORT_KEYS.detail(id) });
    },
  });
};

// Default export
export default {
  useTransports,
  useTransport,
  useCreateTransport,
  useUpdateTransport,
  useDeleteTransport,
};