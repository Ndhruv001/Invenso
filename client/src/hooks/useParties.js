import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getParty,
  getParties,
  createParty,
  updateParty,
  deleteParty,
  bulkDeleteParties,
  suggestParties
} from "@/services/partyServices";

/**
 * React Query Hooks for Party Data
 * ---------------------------------
 * Handles cache, background updates, and invalidation.
 * These hooks wrap around partyServices for React Query.
 */

// --------------------------------------------------
// QUERY KEYS (Centralized for consistency)
// --------------------------------------------------
export const PARTY_KEYS = {
  all: ["parties"], // Root
  list: (filters = {}) => ["parties", "list", filters], // Paginated/List query
  detail: id => ["parties", "detail", id] // Single party
};

// --------------------------------------------------
// QUERIES
// --------------------------------------------------
export const useParties = (filters = {}) => {
  return useQuery({
    queryKey: PARTY_KEYS.list(filters),
    queryFn: () => getParties(filters),
    staleTime: 5 * 60 * 1000, // 5 mins fresh cache
    cacheTime: 30 * 60 * 1000, // 30 mins kept in memory
    keepPreviousData: true // Prevent flicker during pagination/filtering
  });
};

export const useParty = id =>
  useQuery({
    queryKey: PARTY_KEYS.detail(id),
    queryFn: () => getParty(id),
    enabled: !!id, // Only fetch if ID is provided
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000
  });

// --------------------------------------------------
// MUTATIONS
// --------------------------------------------------
export const useCreateParty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-party"],
    mutationFn: createParty,
    onSuccess: () => {
      // Invalidate party list to get updated data
      queryClient.invalidateQueries({ queryKey: PARTY_KEYS.all });
    }
  });
};

export const useUpdateParty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-party"],
    mutationFn: ({ id, data }) => updateParty(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate both party list + individual party cache
      queryClient.invalidateQueries({ queryKey: PARTY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PARTY_KEYS.detail(id) });
    }
  });
};

export const useDeleteParty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete-party"],
    mutationFn: id => deleteParty(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: PARTY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PARTY_KEYS.detail(id) });
    }
  });
};

export const useBulkDeleteParties = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["bulk-delete-parties"],
    mutationFn: bulkDeleteParties,
    onSuccess: ids => {
      queryClient.invalidateQueries({ queryKey: PARTY_KEYS.all });
      ids?.forEach(id => queryClient.removeQueries({ queryKey: PARTY_KEYS.detail(id) }));
    }
  });
};

export const usePartySuggestions = query => {
  return useQuery({
    queryKey: ["party-suggestions", query],
    queryFn: () => suggestParties(query),
    enabled: !!query && query.length >= 2, // ⬅ important
    staleTime: 60 * 1000,
  });
};

// --------------------------------------------------
// DEFAULT EXPORT
// --------------------------------------------------
export default {
  useParties,
  useParty,
  useCreateParty,
  useUpdateParty,
  useDeleteParty,
  useBulkDeleteParties,
  usePartySuggestions,
  PARTY_KEYS
};
