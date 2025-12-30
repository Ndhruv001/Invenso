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


export default {login}
export {login}