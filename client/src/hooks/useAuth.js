// hooks/useAuth.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { login, logout, me } from "@/services/authServices";

/**
 * 🔐 LOGIN HOOK
 * - Calls backend login
 * - On success: invalidates "me" query to refetch authenticated user
 */
const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ username, password }) => login({ username, password }),

    onSuccess: async () => {
      // Refetch authenticated user
      await queryClient.invalidateQueries(["me"]);
    }
  });
};

/**
 * 🚪 LOGOUT HOOK
 * - Calls backend logout
 * - Clears "me" cache immediately
 */
const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),

    onSuccess: () => {
      // Remove cached user data
      queryClient.removeQueries(["me"]);
    }
  });
};

/**
 * 👤 GET CURRENT USER
 * - Calls /auth/me
 * - If 401 → no retry
 */
const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => me(),
    retry: false, // Don't retry on 401
    staleTime: 1000 * 60 * 5 // 5 minutes cache
  });
};

export { useLogin, useLogout, useMe };
