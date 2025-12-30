// hooks/useLogin.js
import { useMutation } from "@tanstack/react-query";
import { login } from "@/services/authServices";

const useLogin = () => {
  return useMutation({
    mutationFn: ({ username, password }) => login({ username, password }),
  });
};

export default useLogin;
export {useLogin}
