import axiosInstance from "@/lib/config/axiosInstance";

const login = async data => {
  try {
    const response = await axiosInstance.post("/auth/login", data);
    return response.data;
  } catch (error) {
    console.error("Failed to login:", error);
    throw new Error(error.message || "Failed to login");
  }
};

const logout = async () => {
  try {
    await axiosInstance.post("/auth/logout");
  } catch (error) {
    console.error("Failed to logout:", error);
    throw new Error(error.message || "Failed to logout");
  }
};

const me = async () => {
  try {
    const response = await axiosInstance.get("/auth/me");
    return response.data;
  } catch (error) {
    console.error("Failed to retrieve user info:", error);
    throw new Error(error.message || "Failed to retrieve user info");
  }
};

export default { login, logout, me };
export { login, logout, me };
