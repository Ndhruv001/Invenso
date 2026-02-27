import React from "react";
import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from "@tanstack/react-query";
import { toast } from "react-toastify";

// Mutation cache for global mutation events
const mutationCache = new MutationCache({
  onError: error => {
    console.error("Mutation Error:", error);
    toast.error(error.message || "Something went wrong");
  },
  //& learn all the params here and why not fifth param - queryClient
  onSuccess: (data, variables, context, mutation) => {
    const mutationKey = mutation.options.mutationKey;
    // queryClient.invalidateQueries(mutationKey);
    if (mutationKey?.includes("create")) {
      toast.success("Item created successfully!");
    } else if (mutationKey?.includes("update")) {
      toast.success("Item updated successfully!");
    } else if (mutationKey?.includes("delete")) {
      toast.success("Item deleted successfully!");
    }
  }
});

// Query cache for global query events
const queryCache = new QueryCache({
  onError: (error, query) => {
    if (query.state.fetchFailureCount === 1) {
      toast.error(error.message || "Failed to load data");
    }
  }
});

// Main QueryClient configuration
const queryClient = new QueryClient({
  mutationCache,
  queryCache,
  defaultOptions: {
    queries: {
      staleTime: 15 * 60 * 1000, 
      cacheTime: 45 * 60 * 1000, 
      retryOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      retry: (failureCount, error) => {
        if (error.type === "AUTH_ERROR") return false;
        if (error.status >= 400 && error.status < 500) return false;
        return failureCount < 3;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      keepPreviousData: true
    },
    mutations: {
      retry: (failureCount, error) => {
        if (error.type === "VALIDATION_ERROR") return false;
        if (error.type === "PERMISSION_ERROR") return false;
        return failureCount < 2;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000)
    }
  }
});

/**
 * Provides React Query client to the app.
 */
const QueryProvider = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

export default QueryProvider;
export { QueryProvider };
