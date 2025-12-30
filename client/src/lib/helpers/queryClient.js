import { QueryClient } from "@tanstack/react-query";

/**
 * Invalidate all queries (global refresh).
 */
const invalidateAllQueries = () => {
  QueryClient.invalidateQueries();
};

/**
 * Clear all cache (useful for logout).
 */
const clearAllCache = () => {
  QueryClient.clear();
};

export { invalidateAllQueries, clearAllCache };
